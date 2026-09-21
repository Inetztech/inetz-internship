import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import Job from "@/models/Job";
import Application from "@/models/Application";

// ────────────────── PATCH: UPDATE JOB LISTING ──────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const jobId = resolvedParams?.id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, error: "Invalid Job ID" }, { status: 400 });
    }

    const body = await req.json();

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          title: body.title,
          companyName: body.companyName,
          domain: body.domain,
          location: body.location,
          jobType: body.jobType,
          salaryOrStipend: body.salaryOrStipend,
          description: body.description,
          isActive: body.isActive !== undefined ? body.isActive : true,
        },
      },
      { new: true }
    );

    if (!updatedJob) {
      return NextResponse.json({ success: false, error: "Job listing not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update job" },
      { status: 500 }
    );
  }
}

// ────────────────── DELETE: REMOVE JOB & APPLICATIONS ──────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const jobId = resolvedParams?.id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, error: "Invalid Job ID" }, { status: 400 });
    }

    // Delete the job listing
    const deletedJob = await Job.findByIdAndDelete(jobId);

    if (!deletedJob) {
      return NextResponse.json({ success: false, error: "Job listing not found" }, { status: 404 });
    }

    // Clean up all applications tied to this job
    await Application.deleteMany({ jobId: new mongoose.Types.ObjectId(jobId) });

    return NextResponse.json({
      success: true,
      message: "Job listing and associated applications deleted.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete job" },
      { status: 500 }
    );
  }
}