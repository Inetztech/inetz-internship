import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";

// 🎯 1. Ensure all referenced models are explicitly imported so Mongoose can populate them
import Application from "@/models/Application"; // Use your actual Application model export
import Job from "@/models/Job";
import { Student } from "@/models/Student";
import User from "@/models/user";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // Ensure models are registered in Mongoose memory
    const _registered = [Job, Student, User];

    const { id: rawJobId } = await params;

    if (!rawJobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required." },
        { status: 400 }
      );
    }

    // 🎯 2. Query Job Title
    let jobTitle = "Job Applicants";
    if (mongoose.Types.ObjectId.isValid(rawJobId)) {
      const jobDoc = await Job.findById(rawJobId).select("title").lean();
      if (jobDoc?.title) jobTitle = jobDoc.title;
    }

    // 🎯 3. Build Flexible Query that matches both ObjectId and String formats
    const isObjectId = mongoose.Types.ObjectId.isValid(rawJobId);
    const queryFilter = {
      $or: [
        { jobId: rawJobId },
        ...(isObjectId ? [{ jobId: new mongoose.Types.ObjectId(rawJobId) }] : []),
      ],
    };

    // 🎯 4. Fetch Applicants and Populate Candidate Details
    const applicants = await Application.find(queryFilter)
      .populate({
        path: "studentId",
        select: "name fullName email phone college domain duration degree resumeUrl",
      })
      .sort({ createdAt: -1 })
      .lean();

    // Format any missing populated student fields gracefully
    const formattedApplicants = applicants.map((app: any) => {
      // Fallback if studentId was stored as a User reference or plain ID
      const studentData = app.studentId || {};
      return {
        ...app,
        _id: app._id.toString(),
        studentId: {
          _id: studentData._id?.toString() || app.studentId?.toString() || "",
          name: studentData.name || studentData.fullName || "Candidate",
          email: studentData.email || "—",
          phone: studentData.phone || "—",
          college: studentData.college || "—",
          domain: studentData.domain || studentData.domainTrack || "Web Development",
          duration: studentData.duration || "",
        },
      };
    });

    return NextResponse.json(
      {
        success: true,
        jobTitle,
        applicants: formattedApplicants,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("FETCH_JOB_APPLICANTS_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load applicants." },
      { status: 500 }
    );
  }
}
