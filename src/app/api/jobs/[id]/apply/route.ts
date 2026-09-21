import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import Application from "@/models/Application";
import Job from "@/models/Job";
import { Student } from "@/models/Student";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Please log in to apply for this position." },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const { id: jobId } = await params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { success: false, error: "Invalid job listing ID." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Verify Job Listing Existence & Status
    const job = await Job.findById(jobId).lean();
    if (!job || job.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          error: "This job listing is no longer accepting applications.",
        },
        { status: 404 }
      );
    }

    // 2. Fetch the corresponding Student record from MongoDB
    const body = await req.json().catch(() => ({}));
    const emailToSearch = userEmail || body.studentEmail || body.email;

    if (!emailToSearch) {
      return NextResponse.json(
        { success: false, error: "User email could not be resolved." },
        { status: 400 }
      );
    }

    const student = await Student.findOne({
      email: { $regex: new RegExp(`^${emailToSearch.trim()}$`, "i") },
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: "Student profile not found. Please complete your profile first.",
        },
        { status: 404 }
      );
    }

    // 3. Resolve Resume URL (Payload -> Student Document)
    const finalResumeUrl =
      body.resumeUrl?.trim() || student.resumeUrl?.trim();

    if (!finalResumeUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No resume found. Please upload a PDF resume in your profile before applying.",
        },
        { status: 400 }
      );
    }

    // 4. Check for Existing Application (Avoid Duplicate Key Error)
    const existingApplication = await Application.findOne({
      jobId: new mongoose.Types.ObjectId(jobId),
      studentId: student._id, // 🎯 Use the real Student._id
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already applied for this position.",
        },
        { status: 400 }
      );
    }

    // 5. Create Application linked to the Student record
    const application = await Application.create({
      jobId: new mongoose.Types.ObjectId(jobId),
      studentId: student._id, // 🎯 Critical fix: links to Student model for populate()
      resumeUrl: finalResumeUrl,
      status: "Applied",
      interviewStatus: "Locked",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully!",
        application,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already applied for this job listing.",
        },
        { status: 400 }
      );
    }

    console.error("SUBMIT_APPLICATION_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}