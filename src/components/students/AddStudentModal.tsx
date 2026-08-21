"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  UserPlus, 
  Loader2, 
  BookOpen, 
  Clock, 
  DollarSign, 
  Building, 
  Mail, 
  Phone, 
  User,
  Calendar,
  AlertCircle
} from "lucide-react";

export interface ProgramTrackItem {
  _id?: string;
  title: string;
  slug?: string;
  duration?: string;
  price?: number | string;
  originalPrice?: number | string;
}

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_DURATIONS = ["1 Week", "2 Weeks", "1 Month", "3 Months", "6 Months"];

// Helper to format Date into Indian standard format (e.g. "21 Aug 2026")
const formatToIndianDate = (dateString: string) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AddStudentModal({
  isOpen,
  onClose,
  onSuccess,
}: AddStudentModalProps) {
  const [programs, setPrograms] = useState<ProgramTrackItem[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Student Form State (defaults to Web Development & today's date in YYYY-MM-DD)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    degree: "B.E / B.Tech",
    domain: "Web Development",
    duration: "1 Month",
    doj: new Date().toISOString().split("T")[0],
    totalBilling: 0,
    initialPayment: 0,
    paymentMethod: "Cash",
    remarks: "",
  });

  // 1. Fetch available programs and auto-select default track & pricing
  useEffect(() => {
    if (!isOpen) return;

    async function fetchTracksData() {
      setLoadingTracks(true);
      setErrorMsg(null);
      try {
        let res = await fetch("/api/tracks");
        if (!res.ok) {
          res = await fetch("/api/programs");
        }

        if (res.ok) {
          const rawData = await res.json();
          const list: ProgramTrackItem[] = Array.isArray(rawData)
            ? rawData
            : rawData.programs || rawData.data || [];

          setPrograms(list);

          if (list.length > 0) {
            const firstTrack = list[0];
            const parsedPrice = Number(firstTrack.price) || 0;

            setForm((prev) => ({
              ...prev,
              domain: prev.domain || firstTrack.title,
              duration: firstTrack.duration || prev.duration || "1 Month",
              totalBilling: prev.totalBilling || parsedPrice,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load tracks for student form:", err);
      } finally {
        setLoadingTracks(false);
      }
    }

    fetchTracksData();
  }, [isOpen]);

  // 2. Auto-update Fee when Course Track or Duration changes
  const handleTrackChange = (selectedTitle: string) => {
    const matched = programs.find(
      (p) =>
        p.title.toLowerCase() === selectedTitle.toLowerCase() &&
        p.duration?.toLowerCase() === form.duration.toLowerCase()
    ) || programs.find((p) => p.title.toLowerCase() === selectedTitle.toLowerCase());

    const matchedPrice = matched?.price ? Number(matched.price) : form.totalBilling;

    setForm((prev) => ({
      ...prev,
      domain: selectedTitle,
      duration: matched?.duration || prev.duration,
      totalBilling: matchedPrice,
    }));
  };

  const handleDurationChange = (selectedDuration: string) => {
    const matched = programs.find(
      (p) =>
        p.title.toLowerCase() === form.domain.toLowerCase() &&
        p.duration?.toLowerCase() === selectedDuration.toLowerCase()
    );

    const matchedPrice = matched?.price ? Number(matched.price) : form.totalBilling;

    setForm((prev) => ({
      ...prev,
      duration: selectedDuration,
      totalBilling: matchedPrice,
    }));
  };

  // 3. Submit Student Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    // Format payload with exact field keys expected by POST /api/students
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      college: form.college.trim(),
      domain: form.domain,
      duration: form.duration,
      doj: formatToIndianDate(form.doj),
      totalBilling: Number(form.totalBilling) || 0,
      initialPayment: Number(form.initialPayment) || 0,
      paymentMethod: form.paymentMethod,
    };

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || "Failed to register student.");
      }
    } catch {
      setErrorMsg("Network error occurred while saving student record.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const balanceAmount = Math.max(0, Number(form.totalBilling) - Number(form.initialPayment));
  const distinctTrackTitles = Array.from(new Set(programs.map((p) => p.title).filter(Boolean)));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
          <div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
              Admission Management
            </span>
            <h3 className="text-xl font-black text-zinc-900">Enrol New Student</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg text-sm font-bold cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Personal Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Arun Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">College / Institution *</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Loyola College"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Course Track, Duration & Date of Joining */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100">
            
            {/* Dynamic Course Track Selection */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <BookOpen size={13} className="text-emerald-600" /> Domain Track *
              </label>
              <select
                required
                value={form.domain}
                onChange={(e) => handleTrackChange(e.target.value)}
                disabled={loadingTracks}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer disabled:opacity-60"
              >
                {loadingTracks ? (
                  <option value="">Loading course tracks...</option>
                ) : distinctTrackTitles.length > 0 ? (
                  distinctTrackTitles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Web Development">Web Development (MERN)</option>
                    <option value="Java Full Stack">Java Full Stack</option>
                    <option value="Python Development">Python Development</option>
                    <option value="Data Analytics">Data Analytics</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                  </>
                )}
              </select>
            </div>

            {/* Duration Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <Clock size={13} className="text-emerald-600" /> Duration *
              </label>
              <select
                value={form.duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                {DEFAULT_DURATIONS.map((dur) => (
                  <option key={dur} value={dur}>
                    {dur}
                  </option>
                ))}
              </select>
            </div>

            {/* Date of Joining (DOJ) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <Calendar size={13} className="text-emerald-600" /> Date of Joining *
              </label>
              <input
                type="date"
                required
                value={form.doj}
                onChange={(e) => setForm({ ...form, doj: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Fee & Payment Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Total Course Fee (₹) *</label>
              <input
                type="number"
                required
                min={0}
                value={form.totalBilling}
                onChange={(e) => setForm({ ...form, totalBilling: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Initial Payment (₹)</label>
              <input
                type="number"
                required
                min={0}
                max={form.totalBilling}
                value={form.initialPayment}
                onChange={(e) => setForm({ ...form, initialPayment: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-emerald-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700">Payment Mode</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="Cash">Cash</option>
                <option value="GPay">GPay / UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>

          {/* Remaining Balance Summary Pill */}
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-500">Remaining Balance:</span>
            <span className={`font-black text-sm ${balanceAmount === 0 ? "text-emerald-600" : "text-amber-600"}`}>
              ₹{balanceAmount.toLocaleString("en-IN")} {balanceAmount === 0 ? "(Fully Paid)" : "(Due)"}
            </span>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingTracks}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Enrol Student
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}