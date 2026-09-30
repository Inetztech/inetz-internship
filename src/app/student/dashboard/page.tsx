"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

import Sidebar from "./components/Sidebar";
import ProfileTab, { ProfileData } from "./components/ProfileTab";
import CoursesTab from "./components/CoursesTab";
import TransactionsTab from "./components/TransactionsTab";
import PhoneLinkModal from "./components/PhoneLinkModal";

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "courses" | "transactions">("profile");

  // Loading & Feedback States
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile Form State strictly typed with ProfileData
  const [profile, setProfile] = useState<ProfileData>({
    _id: "",
    fullName: "",
    email: "",
    phone: "",
    college: "",
    degree: "B.E / B.Tech",
    domainTrack: "Web Development",
  });

  // Dynamic Data States
  const [courses, setCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // 1. Fetch Student Profile & Enrollment Data from /api/student/me or /api/auth/me
  const fetchStudentProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return;

      const data = await res.json();
      const userData = data.user;

      if (data.authenticated && userData) {
        // Trigger modal if phone number is missing
        if (!userData.phone || data.needsPhoneLinking) {
          setShowPhoneModal(true);
        } else {
          setShowPhoneModal(false);
        }

        setProfile({
          _id: userData.studentId || userData._id || userData.id || "",
          fullName: userData.fullName || userData.name || session?.user?.name || "",
          email: userData.email || session?.user?.email || "",
          phone: userData.phone || "",
          college: userData.college || "",
          degree: userData.degree || "B.E / B.Tech",
          domainTrack: userData.domainTrack || userData.domain || "Web Development",
        });

        if (userData.enrolledCourses) setCourses(userData.enrolledCourses);
        if (userData.transactions) setTransactions(userData.transactions);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  }, [session]);

  // Initial Load on Authentication
  useEffect(() => {
    if (status === "authenticated") {
      fetchStudentProfile();
    }
  }, [status, fetchStudentProfile]);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      let res = await fetch("/api/student/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        res = await fetch("/api/auth/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
      }

      const data = await res.json();

      if (data.success) {
        setProfileMsg({ type: "success", text: "Profile details updated successfully!" });
        fetchStudentProfile();
      } else {
        setProfileMsg({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch {
      setProfileMsg({ type: "error", text: "An error occurred while saving profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-slate-50 text-slate-900 md:flex">
      {/* Phone Number Linking Modal */}
      <PhoneLinkModal
        isOpen={showPhoneModal}
        onSuccess={() => {
          setShowPhoneModal(false);
          fetchStudentProfile();
        }}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={profile.fullName}
        userEmail={profile.email}
      />

      {/* Main Tab Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10">
        {activeTab === "profile" && (
          <ProfileTab
            profile={profile}
            setProfile={setProfile}
            loadingProfile={loadingProfile}
            onSaveProfile={handleSaveProfile}
            savingProfile={savingProfile}
            profileMsg={profileMsg}
            setProfileMsg={setProfileMsg}
          />
        )}

        {activeTab === "courses" && (
          <CoursesTab
            courses={courses}
            student={profile}
            onPaymentSuccess={fetchStudentProfile}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsTab transactions={transactions} />
        )}
      </main>
    </div>
  );
}
