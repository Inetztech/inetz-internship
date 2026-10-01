import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

export type AppRole = "student" | "admin";

export async function requireRole(...roles: AppRole[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 }),
    };
  }

  const role = (session.user as { role?: AppRole }).role;
  if (roles.length && (!role || !roles.includes(role))) {
    return {
      session: null,
      error: NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 }),
    };
  }

  return { session, error: null };
}
