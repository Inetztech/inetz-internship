"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { 
  FileText, 
  Lock, 
  Unlock, 
  ArrowLeft, 
  Loader2, 
  ExternalLink,
  UserCheck,
  Calendar,
  Video,
  X,
  Sparkles,
  Users
} from "lucide-react";
import Link from "next/link";

interface ApplicantRecord {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    college?: string;
    domain?: string;
    duration?: string;
  };
  resumeUrl: string;
  status: "Applied" | "Shortlisted" | "Rejected";
  interviewStatus: "Locked" | "Approved" | "Completed";
  interviewDate?: string;
  interviewLink?: string;
  createdAt: string;
}

export default function EmployerApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Safe param unwrapping for Next.js App Router
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const jobId = resolvedParams?.id;

  const [applicants, setApplicants] = useState<ApplicantRecord[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Selected Applicant for Modal Access Gate
  const [selectedApp, setSelectedApp] = useState<ApplicantRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Modal Form State
  const [status, setStatus] = useState<"Applied" | "Shortlisted" | "Rejected">("Shortlisted");
  const [interviewStatus, setInterviewStatus] = useState<"Locked" | "Approved" | "Completed">("Approved");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewLink, setInterviewLink] = useState("");

  const fetchApplicants = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api//jobs/${jobId}/applicants`);
      const data = await res.json();
      if (data.success) {
        setApplicants(data.applicants || []);
        setJobTitle(data.jobTitle || "Job Listing Candidates");
      } else {
        alert(data.error || "Failed to load applicants.");
      }
    } catch {
      console.error("Failed to load applicants feed");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleOpenApprovalModal = (app: ApplicantRecord) => {
    setSelectedApp(app);
    setStatus(app.status);
    setInterviewStatus(app.interviewStatus === "Locked" ? "Approved" : app.interviewStatus);
    setInterviewDate(
      app.interviewDate ? new Date(app.interviewDate).toISOString().slice(0, 16) : ""
    );
    setInterviewLink(app.interviewLink || "");
    setModalOpen(true);
  };

  const handleSaveApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    try {
      const res = await fetch("/api/employer/interview-approval", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp._id,
          status,
          interviewStatus,
          interviewDate: interviewDate || null,
          interviewLink: interviewLink.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchApplicants();
      } else {
        alert(data.error || "Failed to update candidate status.");
      }
    } catch {
      alert("An unexpected error occurred while updating status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/employer/dashboard"
            className="p-2.5 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-700 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900">
              {jobTitle || "Job Applicants"}
            </h1>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Review verified talent submissions and configure interview gates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-1.5 bg-zinc-900 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
            <Users size={14} className="text-orange-400" />
            <span>{applicants.length} Total Applicants</span>
          </span>
        </div>
      </div>

      {/* Main Applicants Roster */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-xs text-zinc-400 gap-2">
          <Loader2 className="animate-spin text-orange-500" size={18} /> Loading candidate roster...
        </div>
      ) : applicants.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
            <UserCheck size={24} />
          </div>
          <h3 className="text-sm font-extrabold text-zinc-800">No Candidate Submissions Yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Students applying for this track will appear here with their verified project credentials.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-200/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  <th className="p-4 sm:px-6">Candidate Details</th>
                  <th className="p-4">Academic & Domain</th>
                  <th className="p-4">Resume</th>
                  <th className="p-4">Hiring Status</th>
                  <th className="p-4">Interview Access</th>
                  <th className="p-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {applicants.map((app) => {
                  const student = app.studentId || {};
                  const isUnlocked = app.interviewStatus === "Approved";

                  return (
                    <tr key={app._id} className="hover:bg-zinc-50/60 transition-colors">
                      
                      {/* Candidate Column */}
                      <td className="p-4 sm:px-6">
                        <div className="font-extrabold text-zinc-900">{student.name || "Candidate"}</div>
                        <div className="text-[11px] text-zinc-500 font-medium">{student.email || "—"}</div>
                        <div className="text-[10px] text-zinc-400 font-semibold">{student.phone || "—"}</div>
                      </td>

                      {/* Domain Column */}
                      <td className="p-4 text-zinc-600">
                        <div className="font-bold text-zinc-800">{student.college || "N/A"}</div>
                        <div className="text-[11px] text-zinc-500 font-medium">
                          {student.domain || "Web Development"} {student.duration ? `• ${student.duration}` : ""}
                        </div>
                      </td>

                      {/* Resume PDF Column */}
                      <td className="p-4">
                        {app.resumeUrl ? (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-extrabold rounded-xl text-[11px] transition-colors"
                          >
                            <FileText size={13} /> View PDF <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-[11px] text-zinc-400 italic">No File</span>
                        )}
                      </td>

                      {/* Hiring Status */}
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            app.status === "Shortlisted"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : app.status === "Rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      {/* Interview Access Status */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold rounded-lg text-[10px] uppercase tracking-wider">
                              <Unlock size={12} /> Unlocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-extrabold rounded-lg text-[10px] uppercase tracking-wider">
                              <Lock size={12} /> Locked
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Manage Button */}
                      <td className="p-4 sm:px-6 text-right">
                        <button
                          onClick={() => handleOpenApprovalModal(app)}
                          className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold rounded-xl text-xs transition-all shadow-sm shadow-orange-500/20 cursor-pointer"
                        >
                          Manage Access
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── ACCESS & STATUS MODAL ────────────────── */}
      {modalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-zinc-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-zinc-100 pb-3.5">
              <div>
                <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest block">
                  Evaluation Gate
                </span>
                <h3 className="text-base font-black text-zinc-900">Manage Candidate Status</h3>
                <p className="text-xs text-zinc-500 font-medium">{selectedApp.studentId?.name}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 font-bold cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveApproval} className="space-y-4">
              
              {/* Application Stage */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-zinc-700">Application Decision Stage</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                >
                  <option value="Applied">Applied (Under Review)</option>
                  <option value="Shortlisted">Shortlisted for Assessment</option>
                  <option value="Rejected">Rejected / Not Selected</option>
                </select>
              </div>

              {/* Interview Portal Lock Gate */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-zinc-700">Interview Portal Access</label>
                <select
                  value={interviewStatus}
                  onChange={(e) => setInterviewStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                >
                  <option value="Locked">🔒 Locked (Candidate Cannot Enter)</option>
                  <option value="Approved">✅ Approved (Unlock Interview Room)</option>
                  <option value="Completed">🎉 Interview Completed</option>
                </select>
              </div>

              {/* Conditional Meeting Inputs */}
              {interviewStatus === "Approved" && (
                <div className="p-4 bg-orange-50/50 border border-orange-200/80 rounded-2xl space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-zinc-700 flex items-center gap-1.5">
                      <Calendar size={13} className="text-orange-600" /> Interview Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-zinc-700 flex items-center gap-1.5">
                      <Video size={13} className="text-orange-600" /> Meeting Link (Google Meet / Zoom)
                    </label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/xyz-abc-123"
                      value={interviewLink}
                      onChange={(e) => setInterviewLink(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {updating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Updates"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}