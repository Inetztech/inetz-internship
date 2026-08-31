import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

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
    const { fullName, name, email, phone, college, domain, duration, totalBilling, amountToPay } = body;

    const studentName = (fullName || name || "").trim();
    const studentPhone = String(phone || "").trim().replace(/\D/g, "");
    const studentEmail = (email || "").trim().toLowerCase();
    const targetDomain = (domain || "Web Development").trim();
    const targetDuration = (duration || "1 Month").trim();

    if (!studentName || !studentPhone || !studentEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required details (Name, Email, or Phone)" },
        { status: 400 }
      );
    }

    const payAmount = Number(amountToPay) || 500;
    if (payAmount < 500) {
      return NextResponse.json(
        { success: false, error: "Minimum payment is ₹500" },
        { status: 400 }
      );
    }

    const billingTotal = Number(totalBilling) || payAmount;

    // ── 1. Find Specific Enrollment by Phone + Domain ────────────────────────
    let student = await Student.findOne({
      phone: studentPhone,
      domain: targetDomain,
    });

    if (student) {
      // Update details only for THIS specific domain enrollment
      student.name = studentName;
      student.email = studentEmail;
      if (college) student.college = college.trim();
      student.duration = targetDuration;
      student.totalBilling = billingTotal;
      student.pendingAmount = Math.max(0, billingTotal - (student.totalCollection || 0));

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

      const now = new Date();
      const dojString = now.toLocaleDateString("en-IN", {
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
    const amountInPaise = Math.round(payAmount * 100);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        mongoId: student._id.toString(),
        studentId: student.studentId?.toString() || "N/A",
        studentName,
        email: studentEmail,
        phone: studentPhone,
        domain: targetDomain,
        duration: targetDuration,
      },
    });

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
  } catch (error: any) {
    console.error("APPLY_ROUTE_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Process failed" },
      { status: 500 }
    );
  }
}