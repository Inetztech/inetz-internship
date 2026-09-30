import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";       // 🎯 Corrected: imported from models, not lucide-react
import { Student } from "@/models/Student";

import User from "@/models/user";
import { requireRole } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole("student", "admin");
    if (auth.error) return auth.error;
    const sessionUser = auth.session.user as { id?: string; email?: string | null };
    const { phone } = await req.json();
    const cleanPhone = String(phone || "").trim().replace(/\D/g, "");

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    const userId = sessionUser.id || null;
    const userEmail = sessionUser.email || null;

    await connectToDatabase();

    // ── 4. Save Phone on User Model (Fixes persistent modal state) ────────────
    const userQuery = userId ? { _id: userId } : { email: userEmail?.toLowerCase() };

    await User.findOneAndUpdate(
      userQuery,
      { $set: { phone: cleanPhone } },
      { new: true }
    );

    // ── 5. Match & Link with Student Record ───────────────────────────────────
    const phoneRegex = new RegExp(cleanPhone.slice(-10) + "$");
    const matchingStudent = await Student.findOne({
      $or: [
        { phone: phoneRegex },
        ...(userEmail ? [{ email: userEmail.toLowerCase() }] : []),
      ],
    }).lean();

    // If matching student exists and email was empty, sync it
    if (matchingStudent && userEmail && !matchingStudent.email) {
      await Student.findByIdAndUpdate(matchingStudent._id, {
        $set: { email: userEmail.toLowerCase() },
      });
    }

    return NextResponse.json({
      success: true,
      message: matchingStudent
        ? "Account linked successfully with your enrolled student record!"
        : "Phone number updated successfully.",
      matchedStudent: !!matchingStudent,
      studentData: matchingStudent
        ? {
            name: matchingStudent.name,
            domain: matchingStudent.domain,
            duration: matchingStudent.duration,
            feesStatus: matchingStudent.feesStatus,
          }
        : null,
    });
  } catch (error: any) {
    console.error("LINK_PHONE_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
