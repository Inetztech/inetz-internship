import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/user";
import { Student } from "@/models/Student";

// Helper to authenticate request via NextAuth or custom JWT
async function getAuthenticatedUser() {
  await connectToDatabase();
  let userId: string | null = null;
  let userEmail: string | null = null;

  // 1. NextAuth Session
  const session = await getServerSession(authOptions);
  if (session?.user) {
    userId = (session.user as any).id;
    userEmail = session.user.email || null;
  }

  // 2. Custom JWT Cookie Fallback
  if (!userId) {
    const jwtSecret = process.env.JWT_SECRET;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (token && jwtSecret) {
      const SECRET = new TextEncoder().encode(jwtSecret);
      const { payload } = await jwtVerify(token, SECRET);
      userId = payload.id as string;
      userEmail = (payload.email as string) || null;
    }
  }

  return { userId, userEmail };
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

    const enrolledCourses = studentDoc
      ? [
          {
            _id: studentDoc._id.toString(),
            courseTitle: `${studentDoc.domain} Internship Track`,
            domain: studentDoc.domain,
            enrolledDate: studentDoc.doj,
            progress: studentDoc.feesStatus === "Clear" ? 100 : 50,
            status: studentDoc.certificateStatus === "Issued" ? "Completed" : "Active",
          },
        ]
      : [];

    const transactions = studentDoc?.installments
      ? studentDoc.installments.map((inst: any) => ({
          _id: inst._id?.toString() || inst.receiptNo,
          paymentId: inst.transactionId || inst.receiptNo,
          description: `${studentDoc.domain} Internship Fee (${inst.billingBy || "Receipt"})`,
          amount: `₹${inst.paidAmount}`,
          date: inst.date,
          status: "Success",
        }))
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
        resumeUrl: studentDoc?.resumeUrl || userDoc?.resumeUrl || "",
        githubUrl: studentDoc?.githubUrl || userDoc?.githubUrl || "",
        linkedinUrl: studentDoc?.linkedinUrl || userDoc?.linkedinUrl || "",
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
      resumeUrl: body.resumeUrl,
      githubUrl: body.githubUrl,
      linkedinUrl: body.linkedinUrl,
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
            resumeUrl: body.resumeUrl,
            githubUrl: body.githubUrl,
            linkedinUrl: body.linkedinUrl,
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