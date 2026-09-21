import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import Application from "@/models/Application";
import Job from "@/models/Job";
import { Student } from "@/models/Student";
import User from "@/models/user";

// Helper to authenticate request
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
      try {
        const SECRET = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, SECRET);
        userId = payload.id as string;
        userEmail = (payload.email as string) || null;
      } catch {
        // Token invalid
      }
    }
  }

  return { userId, userEmail };
}

// ────────────────── GET: FETCH STUDENT APPLICATIONS ──────────────────
export async function GET() {
  try {
    const { userId, userEmail } = await getAuthenticatedUser();

    if (!userId && !userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Register models in Mongoose memory to allow populate
    const _models = [Job, Student, User];

    // Find all possible candidate IDs (Student._id, User._id)
    const possibleStudentIds: any[] = [];

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      possibleStudentIds.push(new mongoose.Types.ObjectId(userId));
      possibleStudentIds.push(userId);
    }

    // Lookup Student document by email
    if (userEmail) {
      const studentDoc = await Student.findOne({
        email: { $regex: new RegExp(`^${userEmail.trim()}$`, "i") },
      }).select("_id").lean();

      if (studentDoc?._id) {
        possibleStudentIds.push(studentDoc._id);
        possibleStudentIds.push(studentDoc._id.toString());
      }
    }

    // Query applications matching any resolved student ID
    const applications = await Application.find({
      studentId: { $in: possibleStudentIds },
    })
      .populate({
        path: "jobId",
        select: "title companyName location domain salaryOrStipend jobType isActive",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        applications: applications || [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("GET_STUDENT_APPLICATIONS_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch applications." },
      { status: 500 }
    );
  }
}