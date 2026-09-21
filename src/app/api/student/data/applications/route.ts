import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import Application from "@/models/Application";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const studentId = (session.user as any).id;

    // Retrieve all applications for this student with populated job details
    const applications = await Application.find({ studentId })
      .populate("jobId", "title companyName location domain salaryOrStipend jobType")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: applications.length,
        applications,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET_STUDENT_APPLICATIONS_ERROR:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}