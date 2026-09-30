import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/user";
import { Student } from "@/models/Student";

// Helper to authenticate request via NextAuth or custom JWT
async function getAuthenticatedUser() {
  await connectToDatabase();
  const auth = await requireRole();
  if (auth.error) return { userId: null, userEmail: null };
  const user = auth.session.user as { id?: string; email?: string | null };
  return { userId: user.id || null, userEmail: user.email || null };
}

// ────────────────── GET: FETCH PROFILE & STUDENT RECORD ──────────────────
export async function GET() {
  try {
    const { userId, userEmail } = await getAuthenticatedUser();

    if (!userId && !userEmail) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    const userDoc = userId
      ? ((await User.findById(userId).select("-password").lean()) as any)
      : null;

    const emailToSearch = userEmail || userDoc?.email;

    // Search Student collection by case-insensitive email or phone
    let studentDoc = null;
    if (emailToSearch) {
      studentDoc = (await Student.findOne({
        email: { $regex: new RegExp(`^${emailToSearch.trim()}$`, "i") },
      }).lean()) as any;
    }

    if (!studentDoc && userDoc?.phone) {
      studentDoc = (await Student.findOne({
        phone: userDoc.phone.trim(),
      }).lean()) as any;
    }

    const collectedAmount = studentDoc?.installments?.reduce(
      (total: number, installment: { paidAmount?: number }) =>
        total + (Number(installment.paidAmount) || 0),
      0
    ) || 0;
    const totalBilling = Number(studentDoc?.totalBilling) || collectedAmount;
    const pendingAmount = Math.max(0, totalBilling - collectedAmount);
    const feesStatus = totalBilling > 0 && pendingAmount === 0 ? "Clear" : "Pending";

    const enrolledCourses = studentDoc
      ? [
          {
            _id: studentDoc._id.toString(),
            courseTitle: `${studentDoc.domain} Internship Track`,
            domain: studentDoc.domain,
            duration: studentDoc.duration,
            enrolledDate: studentDoc.doj,
            status: studentDoc.certificateStatus === "Issued" ? "Completed" : "Active",
            totalBilling,
            totalCollection: collectedAmount,
            pendingAmount,
            feesStatus,
            certificateStatus: studentDoc.certificateStatus || "Pending",
          },
        ]
      : [];

    let previouslyPaid = 0;
    const transactions = studentDoc?.installments
      ? studentDoc.installments.map((inst: any) => {
          const paidAmount = Number(inst.paidAmount || 0);
          const transaction = {
          _id: inst._id?.toString() || inst.receiptNo,
          receiptNo: inst.receiptNo || inst.transactionId || "RECEIPT",
          paymentId: inst.transactionId || inst.receiptNo,
          description: `${studentDoc.domain} Internship Fee (${inst.billingBy || "Receipt"})`,
          amount: `₹${paidAmount.toLocaleString("en-IN")}`,
          date: inst.date,
          paymentMethod: inst.paymentMethod || "Razorpay Online",
          studentName: studentDoc.name,
          phone: studentDoc.phone,
          college: studentDoc.college,
          domain: studentDoc.domain,
          courseName: studentDoc.duration,
          totalFee: totalBilling,
          previouslyPaid,
          paidAmount,
          billingBy: inst.billingBy || "Razorpay Online",
          status: "Success",
          };
          previouslyPaid += paidAmount;
          return transaction;
        })
      : [];

    return NextResponse.json({
      authenticated: true,
      user: {
        _id: studentDoc?._id?.toString() || userDoc?._id?.toString() || userId,
        id: studentDoc?._id?.toString() || userDoc?._id?.toString() || userId,
        studentId: studentDoc?._id?.toString() || null,
        name: studentDoc?.name || userDoc?.name || "",
        fullName: studentDoc?.name || userDoc?.name || "",
        email: emailToSearch,
        role: userDoc?.role || "student",
        phone: studentDoc?.phone || userDoc?.phone || "",
        college: studentDoc?.college || userDoc?.college || "",
        degree: studentDoc?.degree || userDoc?.degree || "B.E / B.Tech",
        domain: studentDoc?.domain || userDoc?.domain || "Web Development",
        domainTrack: studentDoc?.domain || userDoc?.domain || "Web Development",
        enrolledCourses,
        transactions,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { authenticated: false, error: err.message },
      { status: 500 }
    );
  }
}

// ────────────────── PUT: UPDATE USER PROFILE & SYNC STUDENT RECORD ──────────────────
export async function PUT(req: Request) {
  try {
    const { userId, userEmail } = await getAuthenticatedUser();

    if (!userId && !userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const updateFields = {
      name: body.fullName || body.name,
      phone: body.phone,
      college: body.college,
      degree: body.degree,
      domain: body.domainTrack || body.domain,
    };

    // 1. Update User Document
    if (userId) {
      await User.findByIdAndUpdate(userId, { $set: updateFields });
    }

    // 2. Sync full details with Student Document
    const emailToSearch = userEmail || body.email;
    if (emailToSearch) {
      await Student.findOneAndUpdate(
        { email: { $regex: new RegExp(`^${emailToSearch.trim()}$`, "i") } },
        {
          $set: {
            name: body.fullName || body.name,
            phone: body.phone,
            college: body.college,
            degree: body.degree,
            domain: body.domainTrack || body.domain,
          },
        }
      );
    }

    return NextResponse.json(
      { success: true, message: "Profile details updated successfully!" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PROFILE_UPDATE_ERROR:", err.message);
    return NextResponse.json(
      { success: false, error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
