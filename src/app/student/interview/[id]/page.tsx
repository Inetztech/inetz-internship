"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useSession } from "next-auth/react";
import { 
  Lock, 
  Unlock, 
  Calendar, 
  Clock, 
  Video, 
  Building, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface ApplicationDetails {
  _id: string;
  jobId: {
    title: string;
    companyName: string;
    location: string;
    domain: string;
    salaryOrStipend: string;
  };
  status: "Applied" | "Shortlisted" | "Rejected";
  interviewStatus: "Locked" | "Approved" | "Completed";
  interviewDate?: string;
  interviewLink?: string;
}

export default function StudentInterviewPortal({ params }: { params: Promise<{ id: string }> }) {
  const { id: applicationId } = use(params);
  const { data: session } = useSession();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplicationDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/applications`);
      const data = await res.json();

      if (data.success) {
        const found = (data.applications as ApplicationDetails[]).find(
          (app) => app._id === applicationId
        );

        if (found) {
          setApplication(found);
        } else {
          setError("Interview record not found or access denied.");
        }
      } else {
        setError(data.error || "Failed to retrieve interview details.");
      }
    } catch {
      setError("An error occurred while loading your interview portal.");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplicationDetails();
  }, [fetchApplicationDetails]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-xs text-zinc-400">
        <Loader2 className="animate-spin" size={24} />
        <span>Verifying interview access permissions...</span>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-zinc-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-zinc-900">Access Restricted</h2>
        <p className="text-xs text-zinc-500">{error || "Unable to load interview portal."}</p>
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white font-bold rounded-xl text-xs"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const isApproved = application.interviewStatus === "Approved";
  const job = application.jobId || {};

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Top Navigation */}
      <Link
        href="/student/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft size={14} /> Back to My Applications
      </Link>

      {/* Main Gate Card */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        {/* Header Ribbon */}
        <div className={`p-6 text-white ${isApproved ? "bg-emerald-600" : "bg-amber-600"}`}>
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-white/20 font-bold rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5">
              {isApproved ? <Unlock size={12} /> : <Lock size={12} />} 
              Interview Access Gate
            </span>
            <span className="text-xs font-bold bg-black/20 px-3 py-1 rounded-full">
              Status: {application.interviewStatus}
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <h1 className="text-2xl font-black">{job.title}</h1>
            <p className="text-xs text-white/80 font-medium">{job.companyName} • {job.domain}</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          {isApproved ? (
            /* Unlocked View */
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-emerald-900 space-y-1">
                  <p className="font-bold">Interview Gate Unlocked!</p>
                  <p>
                    Your profile has been shortlisted and cleared by the hiring team. Please review the schedule and join your video session on time.
                  </p>
                </div>
              </div>

              {/* Schedule Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} /> Date & Time
                  </span>
                  <p className="text-xs font-bold text-zinc-900">
                    {application.interviewDate
                      ? new Date(application.interviewDate).toLocaleString("en-IN", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })
                      : "To be announced"}
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Building size={12} /> Location / Platform
                  </span>
                  <p className="text-xs font-bold text-zinc-900">
                    {application.interviewLink ? "Online Video Call" : "Pending Meeting URL"}
                  </p>
                </div>
              </div>

              {/* Meeting Link Launcher */}
              {application.interviewLink ? (
                <div className="p-6 bg-zinc-900 text-white rounded-2xl space-y-3 text-center">
                  <h3 className="text-sm font-bold">Ready for your interview?</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Click below to open the secure video meeting URL provided by the employer.
                  </p>
                  <a
                    href={application.interviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md"
                  >
                    <Video size={16} /> Launch Video Interview <ExternalLink size={12} />
                  </a>
                </div>
              ) : (
                <div className="p-4 bg-zinc-100 rounded-2xl text-center text-xs text-zinc-500 font-medium">
                  The meeting URL will appear here once finalized by the recruiter.
                </div>
              )}
            </div>
          ) : (
            /* Locked View */
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                <Lock size={24} />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-zinc-900">Interview Access Currently Locked</h3>
                <p className="text-xs text-zinc-500">
                  Your application is undergoing review. Access to the video interview portal will automatically unlock once the employer grants approval.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={fetchApplicationDetails}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Clock size={13} /> Refresh Access Status
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
