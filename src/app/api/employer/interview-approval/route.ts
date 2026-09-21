import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import Application from "@/models/Application";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== "employer" && userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await req.json();
    const { applicationId, status, interviewStatus, interviewDate, interviewLink } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "Application ID is required." },
        { status: 400 }
      );
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