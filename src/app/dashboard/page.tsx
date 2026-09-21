import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;

  if (role === "employer") {
    redirect("/employer/dashboard");
  } else if (role === "admin") {
    redirect("/admin");
  } else {
    redirect("/student/dashboard");
  }
}