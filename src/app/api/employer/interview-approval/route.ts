import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { connectToDatabase } from "@/lib/db";
import Application from "@/models/Application";
import Job from "@/models/Job";

export async function PATCH(req: Request) {
  try {
    const auth = await requireRole("employer", "admin");
    if (auth.error) return auth.error;
    const user = auth.session.user as { id?: string; role?: string };

    await connectToDatabase();

    const body = await req.json();
    const { applicationId, status, interviewStatus, interviewDate, interviewLink } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "Application ID is required." },
        { status: 400 }
      );
    }

    const application = await Application.findById(applicationId).select("jobId").lean();
    const ownsJob = application && await Job.exists({
      _id: application.jobId,
      ...(user.role === "admin" ? {} : { postedBy: user.id }),
    });
    if (!ownsJob) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    // Prepare update payload dynamically
    const updateData: Record<string, any> = {};

    if (status && ["Applied", "Shortlisted", "Rejected"].includes(status)) {
      updateData.status = status;
    }

    if (interviewStatus && ["Locked", "Approved", "Completed"].includes(interviewStatus)) {
      updateData.interviewStatus = interviewStatus;
    }

    if (interviewDate !== undefined) {
      updateData.interviewDate = interviewDate ? new Date(interviewDate) : null;
    }

    if (interviewLink !== undefined) {
      updateData.interviewLink = interviewLink ? interviewLink.trim() : "";
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { $set: updateData },
      { new: true }
    ).populate("studentId", "name email");

    if (!updatedApplication) {
      return NextResponse.json(
        { success: false, error: "Application record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Candidate interview status updated to '${updatedApplication.interviewStatus}'.`,
        application: updatedApplication,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("INTERVIEW_APPROVAL_ERROR:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
