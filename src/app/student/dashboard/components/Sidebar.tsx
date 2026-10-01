"use client";

import React from "react";
import { signOut } from "next-auth/react";
import {
  User,
  GraduationCap,
  CreditCard,
  LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  activeTab: "profile" | "courses" | "transactions";
  setActiveTab: (tab: "profile" | "courses" | "transactions") => void;
  userName: string;
  userEmail: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  userName,
  userEmail,
}: SidebarProps) {
  const router = useRouter();

  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white px-4 py-4 md:min-h-[calc(100vh-7rem)] md:w-72 md:border-b-0 md:border-r md:px-5 md:py-8">
      <div className="flex h-full flex-col">
        {/* User Card */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm">
            {userName ? userName.charAt(0).toUpperCase() : "S"}
          </div>
          <div className="overflow-hidden">
            <h2 className="truncate text-sm font-semibold text-slate-900">{userName || "Student"}</h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">{userEmail}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-5 grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-1.5" aria-label="Student dashboard">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:justify-start ${
              activeTab === "profile"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <User size={17} /> <span className="hidden sm:inline">My Profile</span><span className="sm:hidden">Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:justify-start ${
              activeTab === "courses"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <GraduationCap size={17} /> <span className="hidden sm:inline">My Courses</span><span className="sm:hidden">Courses</span>
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:justify-start ${
              activeTab === "transactions"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <CreditCard size={17} /> <span className="hidden sm:inline">Payment History</span><span className="sm:hidden">Payments</span>
          </button>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-6 space-y-2 border-t border-slate-100 pt-5 md:mt-auto">
        <button
          onClick={async () => {
            await signOut({ redirect: false });
            router.push("/login");
            router.refresh();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
