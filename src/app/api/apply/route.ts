import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { requireRole } from "@/lib/api-auth";
import Program from "@/models/Program";
import mongoose from "mongoose";
import RazorpayOrder from "@/models/RazorpayOrder";

export const runtime = "nodejs";

// Helper to determine ID prefix based on duration
function getDurationPrefix(duration: string): string {
  const clean = (duration || "").toLowerCase();
  if (clean.includes("6") && clean.includes("month")) {
    return "INC";
  }
  if (clean.includes("3") && clean.includes("month")) {
    return "IN3";
  }
  return "INI";
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const body = await req.json();
    const { fullName, name, phone, college, domain, duration, programId, amountToPay, balancePayment, batchStartDate } = body;

    const auth = await requireRole("student");
    if (auth.error) return auth.error;
    const authenticatedUser = auth.session.user as { id?: string; email?: string | null };
    const authenticatedEmail = authenticatedUser.email?.trim().toLowerCase();
    const accountId = authenticatedUser.id || authenticatedEmail;
    if (!authenticatedEmail || !accountId) {
      return NextResponse.json({ success: false, error: "Your account identity is unavailable." }, { status: 401 });
    }

    const studentName = (fullName || name || "").trim();
    const studentPhone = String(phone || "").trim().replace(/\D/g, "");
    const studentEmail = authenticatedEmail;
    let targetDomain = (domain || "Web Development").trim();
    let targetDuration = (duration || "1 Month").trim();

    if (!balancePayment && (!studentName || studentPhone.length < 10 || studentPhone.length > 15)) {
      return NextResponse.json(
        { success: false, error: "Enter your name and a valid phone number." },
        { status: 400 }
      );
    }

    const batchDate = new Date(`${batchStartDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (
      !balancePayment &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(batchStartDate || "") ||
        Number.isNaN(batchDate.getTime()) ||
        `${batchDate.getFullYear()}-${String(batchDate.getMonth() + 1).padStart(2, "0")}-${String(batchDate.getDate()).padStart(2, "0")}` !== batchStartDate ||
        batchDate < today ||
        (batchDate.getDay() !== 1 && batchDate.getDay() !== 5))
    ) {
      return NextResponse.json(
        { success: false, error: "Choose an upcoming Monday or Friday as your date of joining." },
        { status: 400 }
      );
    }

    const payAmount = Number(amountToPay);
    if (!Number.isFinite(payAmount) || payAmount < 1 || !Number.isInteger(payAmount * 100)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid payment amount of at least ₹1, with no more than two decimal places." },
        { status: 400 }
      );
    }
    let billingTotal = 0;

    const recentOrderCount = await RazorpayOrder.countDocuments({
      accountId,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    });
    if (recentOrderCount >= 5) {
      return NextResponse.json(
        { success: false, error: "Too many payment attempts. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    if (!balancePayment) {
      if (!mongoose.isValidObjectId(programId)) {
        return NextResponse.json({ success: false, error: "Select a valid internship program." }, { status: 400 });
      }

      const program = await Program.findById(programId).select("title duration price").lean();
      const programPrice = Number(program?.price);
      if (!program || !Number.isFinite(programPrice) || programPrice <= 0) {
        return NextResponse.json({ success: false, error: "This program is unavailable for payment." }, { status: 400 });
      }

      targetDomain = program.title.trim();
      targetDuration = program.duration?.trim() || "1 Month";
      billingTotal = programPrice;

      if (payAmount < 500 || payAmount > billingTotal) {
        return NextResponse.json(
          { success: false, error: `Payment must be between ₹500 and ₹${billingTotal.toLocaleString("en-IN")}.` },
          { status: 400 }
        );
      }
    }

    // ── 1. Find Specific Enrollment by Phone + Domain ────────────────────────
    let student;
    if (balancePayment) {
      student = await Student.findOne({ email: authenticatedEmail, domain: targetDomain });
    } else {
      student = await Student.findOne({
        domain: targetDomain,
        $or: [{ email: authenticatedEmail }, { phone: studentPhone }],
      });
      if (student) {
        if (student.email && student.email !== authenticatedEmail) {
          return NextResponse.json(
            { success: false, error: "This phone number is already linked to another account." },
            { status: 409 }
          );
        }
        if ((student.totalCollection || 0) > 0 || student.installments.length > 0) {
          return NextResponse.json(
            { success: false, error: "This enrollment already has a payment. Use your dashboard to pay the remaining balance." },
            { status: 409 }
          );
        }
      }
    }

    if (balancePayment && !student) {
      return NextResponse.json(
        { success: false, error: "No matching enrollment was found for your account." },
        { status: 404 }
      );
    }

    if (student) {
      if (balancePayment) {
        billingTotal = student.totalBilling;
        if (payAmount > student.pendingAmount) {
          return NextResponse.json(
            { success: false, error: "Payment must not exceed the outstanding balance." },
            { status: 400 }
          );
        }
      }

      if (!balancePayment) {
        // Initial registration details may be refreshed before the first payment.
        student.name = studentName;
        student.email = studentEmail;
        if (college) student.college = college.trim();
        student.duration = targetDuration;
        student.totalBilling = billingTotal;
        student.pendingAmount = Math.max(0, billingTotal - (student.totalCollection || 0));
      }

      // Generate studentId if not existing on older records
      if (!student.studentId) {
        const prefix = getDurationPrefix(targetDuration);
        const latestWithPrefix = await Student.findOne(
          { studentId: { $regex: `^${prefix}` } },
          { studentId: 1 }
        )
          .sort({ studentId: -1 })
          .collation({ locale: "en", numericOrdering: true })
          .lean();

        let nextSeqNum = 1;
        if (latestWithPrefix?.studentId) {
          const numericPart = parseInt(latestWithPrefix.studentId.replace(prefix, ""), 10);
          if (!isNaN(numericPart)) {
            nextSeqNum = numericPart + 1;
          }
        }
        student.studentId = `${prefix}${String(nextSeqNum).padStart(3, "0")}`;
      }

      await student.save();
    } else {
      if (balancePayment) {
        return NextResponse.json({ success: false, error: "No matching enrollment was found." }, { status: 404 });
      }
      // ── 2. Create NEW Enrollment Document with Custom Auto-ID ─────────────
      const lastStudent = await Student.findOne({}, { sNo: 1 }).sort({ sNo: -1 }).lean();
      const nextSNo = lastStudent && typeof lastStudent.sNo === "number" ? lastStudent.sNo + 1 : 1;

      const prefix = getDurationPrefix(targetDuration);
      const latestWithPrefix = await Student.findOne(
        { studentId: { $regex: `^${prefix}` } },
        { studentId: 1 }
      )
        .sort({ studentId: -1 })
        .collation({ locale: "en", numericOrdering: true })
        .lean();

      let nextSeqNum = 1;
      if (latestWithPrefix?.studentId) {
        const numericPart = parseInt(latestWithPrefix.studentId.replace(prefix, ""), 10);
        if (!isNaN(numericPart)) {
          nextSeqNum = numericPart + 1;
        }
      }

      const generatedStudentId = `${prefix}${String(nextSeqNum).padStart(3, "0")}`;

      const dojString = batchDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      student = await Student.create({
        sNo: nextSNo,
        studentId: generatedStudentId,
        name: studentName,
        email: studentEmail,
        phone: studentPhone,
        college: college?.trim() || "N/A",
        domain: targetDomain,
        duration: targetDuration,
        totalBilling: billingTotal,
        totalCollection: 0,
        pendingAmount: billingTotal,
        feesStatus: "Pending",
        certificateStatus: "Pending",
        doj: dojString,
        installments: [],
      });
    }

    // ── 3. Create Razorpay Order with Domain in Notes ────────────────────────
    const orderStudentName = balancePayment ? student.name : studentName;
    const orderStudentEmail = balancePayment ? student.email || "" : studentEmail;
    const orderStudentPhone = balancePayment ? student.phone : studentPhone;
    const orderDuration = balancePayment ? student.duration : targetDuration;
    const amountInPaise = Math.round(payAmount * 100);
    const lockKey = student._id.toString();
    const now = new Date();
    if (!balancePayment && (student.totalCollection || 0) === 0) {
      await RazorpayOrder.updateMany(
        { lockKey, status: { $in: ["creating", "created"] }, paymentId: { $exists: false } },
        { $unset: { lockKey: "" }, $set: { status: "expired" } }
      );
    }
    await RazorpayOrder.updateMany(
      { lockKey, expiresAt: { $lte: now }, status: { $in: ["creating", "created"] } },
      { $unset: { lockKey: "" }, $set: { status: "expired" } }
    );

    let trackedOrder;
    try {
      trackedOrder = await RazorpayOrder.create({
        accountId,
        studentId: student._id,
        lockKey,
        amount: amountInPaise,
        currency: "INR",
        status: "creating",
        expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
      });
    } catch (error: unknown) {
      if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
        return NextResponse.json(
          { success: false, error: "A payment is already in progress. Complete it or try again shortly." },
          { status: 409 }
        );
      }
      throw error;
    }

    let order;
    try {
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${trackedOrder._id}`,
        notes: {
          mongoId: student._id.toString(),
          studentId: student.studentId?.toString() || "N/A",
          studentName: orderStudentName,
          email: orderStudentEmail,
          phone: orderStudentPhone,
          domain: targetDomain,
          duration: orderDuration,
        },
      });
      trackedOrder.orderId = order.id;
      trackedOrder.status = "created";
      await trackedOrder.save();
    } catch (error) {
      trackedOrder.status = "failed";
      trackedOrder.lockKey = undefined;
      await trackedOrder.save();
      throw error;
    }

    if (!order) {
      throw new Error("Razorpay Order creation failed");
    }

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount: order.amount,
        key: process.env.RAZORPAY_KEY_ID,
        studentId: student._id,
        customStudentId: student.studentId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("APPLY_ROUTE_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Process failed" },
      { status: 500 }
    );
  }
}
