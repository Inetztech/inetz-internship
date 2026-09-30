import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { NextResponse } from "next/server";// Ensure path matches your project structure
import { requireRole } from "@/lib/api-auth";

// ─── GET: FETCH STUDENT PROFILE BY EMAIL OR PHONE ──────────────────────────
export async function GET(req: Request) {
  try {
    const auth = await requireRole("student", "admin");
    if (auth.error) return auth.error;
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const sessionUser = auth.session.user as { email?: string | null; role?: string };
    const rawEmail = sessionUser.role === "admin" ? searchParams.get("email") : sessionUser.email;
    const rawPhone = sessionUser.role === "admin" ? searchParams.get("phone") : null;

    if (!rawEmail && !rawPhone) {
      return NextResponse.json(
        { success: false, error: "Missing search parameter (email or phone)" },
        { status: 400 }
      );
    }

    const searchConditions: any[] = [];

    // 1. Process Email Search
    if (rawEmail) {
      const email = decodeURIComponent(rawEmail).trim().toLowerCase();
      if (email.length > 0) {
        const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Case-insensitive exact match anchor
        searchConditions.push({
          email: { $regex: new RegExp(`^${escapedEmail}$`, "i") },
        });
      }
    }

    // 2. Process Phone Search (Strict Minimum 10-Digit Guard)
    if (rawPhone) {
      const phoneRaw = decodeURIComponent(rawPhone).trim();
      const phoneDigits = phoneRaw.replace(/\D/g, "");
      const last10Digits = phoneDigits.slice(-10);

      // 🎯 FIX: Require AT LEAST 10 digits to prevent matching partial numbers
      if (last10Digits.length === 10) {
        searchConditions.push(
          { phone: phoneRaw },
          { phone: last10Digits },
          // Match standard formats like "+91 9876543210", "9876543210", or "09876543210"
          { phone: { $regex: new RegExp(`${last10Digits}$`) } }
        );
      }
    }

    if (searchConditions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid or insufficient search parameters" },
        { status: 400 }
      );
    }

    // Execute query with lean() for fast execution
    const student = await Student.findOne({ $or: searchConditions }).lean();

    if (!student) {
      return NextResponse.json(
        { success: false, error: "No student profile found linked to this account" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, student }, { status: 200 });
  } catch (error: any) {
    console.error("GET_STUDENT_ERROR:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── POST: LINK LOGGED-IN EMAIL TO EXISTING PHONE RECORD ────────────────────
export async function POST(req: Request) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;
    await connectToDatabase();

    const body = await req.json();
    const { email, phone } = body;

    const studentEmail = (email || "").trim().toLowerCase();
    const studentPhone = (phone || "").trim();

    if (!studentEmail || !studentPhone) {
      return NextResponse.json(
        { success: false, error: "Both Email and Phone number are required." },
        { status: 400 }
      );
    }

    const phoneDigits = studentPhone.replace(/\D/g, "");
    const last10Digits = phoneDigits.slice(-10);

    if (!last10Digits) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number provided." },
        { status: 400 }
      );
    }

    // Find the student profile created offline or manually by admin
    const student = await Student.findOne({
      $or: [
        { phone: studentPhone },
        { phone: last10Digits },
        { phone: { $regex: last10Digits } }
      ]
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "No student profile found with this phone number. Please contact admin." },
        { status: 404 }
      );
    }

    // Sync logged-in Google/NextAuth email to the MongoDB profile
    student.email = studentEmail;
    await student.save();

    return NextResponse.json(
      {
        success: true,
        message: "Account linked successfully!",
        student,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST_LINK_STUDENT_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to link profile" },
      { status: 500 }
    );
  }
}
