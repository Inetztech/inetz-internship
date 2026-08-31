"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Trash2, Loader2, Award } from "lucide-react";
import { StudentRecord } from "./StudentTable";
import axios from "axios";
import GenerateCertificateModal from "../GenerateCertificateModal";

interface EditStudentModalProps {
  isOpen: boolean;
  student: StudentRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditStudentModal({
  isOpen,
  student,
  onClose,
  onSuccess,
}: EditStudentModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    domain: "",
    duration: "",
    totalBilling: 0,
    certificateStatus: "Pending",
    feesStatus: "Pending",
  });

  const [programTracks, setProgramTracks] = useState<string[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  useEffect(() => {
    async function fetchTracks() {
      setLoadingTracks(true);
      try {
        let res = await fetch("/api/tracks");
        if (!res.ok) res = await fetch("/api/programs");

        if (res.ok) {
          const raw = await res.json();
          const list = Array.isArray(raw)
            ? raw
            : raw.programs || raw.data || [];
          const titles = Array.from(
            new Set(list.map((item: any) => item.title).filter(Boolean)),
          ) as string[];

          if (titles.length > 0) {
            setProgramTracks(titles);
          }
        }
      } catch (err) {
        console.error("Failed to load specialization domains:", err);
      } finally {
        setLoadingTracks(false);
      }
    }

    fetchTracks();
  }, []);

  useEffect(() => {
    if (student) {
      setEditForm({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        college: student.college || "",
        domain: student.domain || "Web Development",
        duration: student.duration || "1 Month",
        totalBilling: student.totalBilling || 0,
        certificateStatus: student.certificateStatus || "Pending",
        feesStatus: student.feesStatus || "Pending",
      });
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await axios.put("/api/students", {
        id: student._id,
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        college: editForm.college.trim(),
        domain: editForm.domain,
        duration: editForm.duration,
        totalBilling: Number(editForm.totalBilling),
        certificateStatus: editForm.certificateStatus,
        feesStatus: editForm.feesStatus,
      });

      if (res.data.success) {
        alert("Student record updated successfully!");
        onClose();
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error updating student:", err);
      alert(err.response?.data?.error || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (
      !confirm(
        `Are you sure you want to delete profile for "${student.name}"? This action cannot be undone.`,
      )
    )
      return;

    setIsDeleting(true);
    try {
      const res = await axios.delete(`/api/students?id=${student._id}`);
      if (res.data.success) {
        alert("Student profile deleted successfully.");
        onClose();
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error deleting student:", err);
      alert(err.response?.data?.error || "Failed to delete profile.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* ────────────────── POPUP CERTIFICATE ACTION MODAL ────────────────── */}
      <GenerateCertificateModal
        isOpen={isCertModalOpen}
        student={{
          _id: student._id,
          name: editForm.name || student.name,
          email: editForm.email || student.email,
          domain: editForm.domain || student.domain,
          duration: editForm.duration || student.duration,
        }}
        onClose={() => setIsCertModalOpen(false)}
        onRefresh={onSuccess}
      />

      <div className="fixed inset-0 z-[999] bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-4xl rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-5 bg-zinc-900 text-white flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-tight">
                  {student.name}
                </h3>
                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                  S.No: #{student.sNo || "N/A"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                Joined on: {student.doj || "N/A"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={handleSaveChanges}
            className="p-6 md:p-8 space-y-8 max-h-[80vh] overflow-y-auto"
          >
            {/* 1. Personal & Program Details */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2">
                1. Personal & Program Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder="e.g. student@gmail.com"
                    className="w-full mt-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                    College / Institution
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.college}
                    onChange={(e) =>
                      setEditForm({ ...editForm, college: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                    Specialization Domain
                  </label>
                  <select
                    required
                    value={editForm.domain}
                    onChange={(e) =>
                      setEditForm({ ...editForm, domain: e.target.value })
                    }
                    disabled={loadingTracks}
                    className="w-full mt-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer disabled:opacity-60"
                  >
                    {loadingTracks ? (
                      <option value="">
                        Loading specialization domains...
                      </option>
                    ) : programTracks.length > 0 ? (
                      programTracks.map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Web Development">
                          Web Development (MERN)
                        </option>
                        <option value="Java Full Stack">Java Full Stack</option>
                        <option value="Python Development">
                          Python Development
                        </option>
                        <option value="Data Analytics">Data Analytics</option>
                        <option value="AI & Machine Learning">
                          AI & Machine Learning
                        </option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                    Duration
                  </label>
                  <select
                    required
                    value={editForm.duration}
                    onChange={(e) =>
                      setEditForm({ ...editForm, duration: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="1 Week">1 Week</option>
                    <option value="2 Weeks">2 Weeks</option>
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Financial Status & Adjustments */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2">
                2. Financial Status & Adjustments
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                    Total Fee (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editForm.totalBilling}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        totalBilling: Number(e.target.value),
                      })
                    }
                    className="w-full mt-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                  <p className="text-[9px] font-black uppercase text-emerald-600">
                    Total Collected
                  </p>
                  <p className="text-base font-black text-emerald-700 mt-0.5">
                    ₹{(student.totalCollection || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                  <p className="text-[9px] font-black uppercase text-amber-600">
                    Calculated Balance
                  </p>
                  <p className="text-base font-black text-amber-700 mt-0.5">
                    ₹
                    {Math.max(
                      0,
                      editForm.totalBilling - (student.totalCollection || 0),
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                    Fees Status
                  </label>
                  <select
                    value={editForm.feesStatus}
                    onChange={(e) =>
                      setEditForm({ ...editForm, feesStatus: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Clear">Clear</option>
                    <option value="Fully Paid">Fully Paid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Installments Ledger */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  3. Payment Installments Ledger (
                  {student.installments?.length || 0})
                </h4>
              </div>

              {student.installments && student.installments.length > 0 ? (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-[9px] font-black uppercase text-zinc-400">
                      <tr>
                        <th className="p-3">Receipt No</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Paid Amount</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Billing Staff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                      {student.installments.map((inst, idx) => (
                        <tr
                          key={inst.receiptNo || idx}
                          className="hover:bg-zinc-50/50"
                        >
                          <td className="p-3 font-mono text-[11px] font-bold text-zinc-900">
                            {inst.receiptNo}
                          </td>
                          <td className="p-3">{inst.date}</td>
                          <td className="p-3 font-bold text-emerald-600">
                            ₹{inst.paidAmount?.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-[9px] font-bold">
                              {inst.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3 text-zinc-500">
                            {inst.billingBy}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    No Installments Audited Yet
                  </p>
                </div>
              )}
            </div>

            {/* 4. Bottom Action Toolbar */}
            <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteStudent}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}{" "}
                Delete Profile
              </button>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsCertModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Award size={15} /> Generate Certificate
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}{" "}
                  Save Updates
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
