"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Phone, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

export interface StudentDataPayload {
  name: string;
  domain: string;
  duration: string;
  feesStatus: "Clear" | "Pending" | string;
}

interface PhoneLinkModalProps {
  isOpen: boolean;
  onSuccess: (studentData: StudentDataPayload | null) => void;
}

export default function PhoneLinkModal({ isOpen, onSuccess }: PhoneLinkModalProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/student/link-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();

      if (data.success) {
        // 1. Update session token with phone number
        if (typeof updateSession === "function") {
          await updateSession({ phone: cleanPhone });
        }

        // 2. Refresh server components
        router.refresh();

        // 3. Clear inputs & hand off studentData to close modal
        setPhone("");
        onSuccess(data.studentData || null);
      } else {
        setError(data.error || "Failed to link phone number.");
      }
    } catch {
      setError("An error occurred while linking your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <Phone size={24} />
          </div>
          <h2 className="text-xl font-semibold text-slate-950">Link your student record</h2>
          <p className="text-sm leading-6 text-slate-500">
            Please enter your registered mobile number to fetch your enrolled internship domain, courses, and payment receipts.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mobile phone number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 text-zinc-400" size={15} />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit registered number (e.g. 7093792955)"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Verify & Link Account
          </button>
        </form>
      </div>
    </div>
  );
}
