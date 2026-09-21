import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Adjust path to your authOptions if placed in lib/auth.ts
import { connectToDatabase } from "@/lib/db";
import Job from "@/models/Job";

// ─── 1. POST: CREATE A NEW JOB LISTING ────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Authentication & Role Authorization Check
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== "employer" && userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only employers can post jobs." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await req.json();
    const {
      title,
      companyName,
      description,
      domain,
      location,
      jobType,
      salaryOrStipend,
    } = body;

    // Field Validation
    if (!title || !description || !domain || !salaryOrStipend) {
      return NextResponse.json(
        { success: false, error: "Please provide all required fields." },
        { status: 400 }
      );
    }

    // Determine Company Name (from request body or fallback to NextAuth session)
    const finalCompanyName =
      companyName?.trim() || (session.user as any).companyName || session.user.name;

    // Create Job Document
    const newJob = await Job.create({
      title: title.trim(),
      companyName: finalCompanyName,
      description: description.trim(),
      domain: domain.trim(),
      location: location?.trim() || "Remote",
      jobType: jobType || "Internship",
      salaryOrStipend: salaryOrStipend.trim(),
      postedBy: (session.user as any).id,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job listing published successfully.",
        job: newJob,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE_JOB_ERROR:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── 2. GET: FETCH JOBS POSTED BY THE LOGGED-IN EMPLOYER ───────────────────────
export async function GET() {
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

    const employerId = (session.user as any).id;

    // Fetch jobs posted by this employer with lean execution
    const jobs = await Job.find({ postedBy: employerId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: jobs.length,
        jobs,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET_EMPLOYER_JOBS_ERROR:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}