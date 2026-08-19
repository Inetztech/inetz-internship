import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/lib/db";       // 🎯 Corrected: imported from models, not lucide-react
import { Student } from "@/models/Student";
import { authOptions } from "../../auth/[...nextauth]/route";
import User from "@/models/user";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const cleanPhone = String(phone || "").trim().replace(/\D/g, "");

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    let userEmail: string | null = null;

    // ── 1. METHOD A: NextAuth Token / Session ─────────────────────────────────
    const nextAuthToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    });

    if (nextAuthToken) {
      userId = (nextAuthToken.sub || nextAuthToken.id) as string;
      userEmail = nextAuthToken.email as string;
    } else {
      const session = await getServerSession(authOptions).catch(() => null);
      if (session?.user) {
        userEmail = session.user.email || null;
        userId = (session.user as any).id || (session.user as any)._id || null;
      }
    }

    // ── 2. METHOD B: Custom JWT Cookie / Bearer Header ────────────────────────
    if (!userId && !userEmail) {
      const cookieStore = await cookies();
      const customToken =
        cookieStore.get("token")?.value ||
        cookieStore.get("next-auth.session-token")?.value ||
        cookieStore.get("__Secure-next-auth.session-token")?.value ||
        req.headers.get("authorization")?.replace("Bearer ", "");

      if (customToken) {
        try {
          const secretKey = new TextEncoder().encode(
            process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || ""
          );
          const { payload } = await jwtVerify(customToken, secretKey);
          userId = (payload.id || payload.sub) as string;
          userEmail = (payload.email as string) || null;
        } catch {
          // Token verification fallback
        }
      }
    }

    // ── 3. Authenticated Check ────────────────────────────────────────────────
    if (!userId && !userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

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