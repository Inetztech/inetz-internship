import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminRoute = pathname.startsWith("/admin");
  const isEmployerRoute = pathname.startsWith("/employer/dashboard") || pathname.startsWith("/employer/jobs");
  const isStudentRoute = pathname.startsWith("/student");
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding") ||
    isAdminRoute || isEmployerRoute || isStudentRoute;

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && role !== "admin") return NextResponse.redirect(new URL("/dashboard", req.url));
  if (isEmployerRoute && role !== "employer" && role !== "admin") return NextResponse.redirect(new URL("/dashboard", req.url));
  if (isStudentRoute && role !== "student" && role !== "admin") return NextResponse.redirect(new URL("/dashboard", req.url));

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    "/employer/dashboard/:path*",
    "/employer/jobs/:path*",
    "/student/:path*",
    "/login",
    "/register",
  ],
};
