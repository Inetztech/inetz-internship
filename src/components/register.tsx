"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Calendar,
  Layers,
  UserCheck,
  PhoneCall,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { toast } from "sonner";

const enrollmentSteps = [
  {
    step: "1",
    title: "Select Program",
    icon: <Layers className="w-4 h-4 text-indigo-600" />,
    bg: "bg-indigo-100/50",
  },
  {
    step: "2",
    title: "Select Duration",
    icon: <Calendar className="w-4 h-4 text-purple-600" />,
    bg: "bg-purple-100/50",
  },
  {
    step: "3",
    title: "Register",
    icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
    bg: "bg-emerald-100/50",
  },
  {
    step: "4",
    title: "Start your classes",
    icon: <UserCheck className="w-4 h-4 text-blue-600" />,
    bg: "bg-blue-100/50",
  },
];

export function EnrollmentActionSection() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          stack: "General Assistance",
          type: "Callback Request",
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setIsSuccess(false);
          setFormData({ name: "", phone: "" });
        }, 3000);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section id="contact" className="relative bg-[#f8fafc] dark:bg-[#020617] py-10 md:py-16">
      <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">

        {/* LEFT SIDE: STEPS */}
        <div className="space-y-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl text-slate-900 dark:text-white"
            >
              Get Started <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-sky-500">in Minutes</span>
            </motion.h2>
          </div>

          <div className="space-y-2.5">
            {enrollmentSteps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm"
              >
                <div className={`p-2 rounded-md ${item.bg}`}>{item.icon}</div>
                <span className="text-xl font-bold text-slate-200 dark:text-zinc-800 tabular-nums">
                  {item.step}
                </span>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                  {item.title}
                </h3>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => router.push("/programs")}
            className="w-full py-3 rounded-lg bg-[#0f172a] dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
          >
            <UserCheck size={16} />
            Start Enrollment Process
          </button>
        </div>

        {/* RIGHT SIDE: SUPPORT CARD */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Need Assistance?
          </h2>

          <div className="p-6 md:p-8 rounded-[2rem] bg-[#1e293b] text-white shadow-xl relative flex flex-col justify-between h-auto min-h-[360px] md:h-[380px] overflow-hidden group">
            {/* Background Decorative Mesh */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />

            <div className="space-y-4 relative z-10">
              <h3 className="text-xl md:text-2xl font-bold leading-tight">
                Confused about which program to pick?
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-[280px]">
                Speak with our expert academic counselors to find the perfect
                fit for your career goals.
              </p>

              <div className="flex gap-4 items-center pt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Support Active
                </div>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="grid grid-cols-2 gap-3">
                {/* CALLBACK TRIGGER */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl bg-white text-slate-900 hover:bg-slate-50 transition-all group"
                >
                  <PhoneCall
                    size={18}
                    className="text-indigo-600 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    Callback
                  </span>
                </button>

                {/* WHATSAPP LINK */}
                <a
                  href={`https://wa.me/919840234475?text=${encodeURIComponent("Hi! I need help picking a program.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <button className="flex flex-col items-center justify-center gap-2 py-4 w-full rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all group shadow-md hover:shadow-lg">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="group-hover:scale-110 transition-transform">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.216 1.36.186 1.872.11.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.87 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-tight">
                      WhatsApp
                    </span>
                  </button>
                </a>
              </div>

              <p className="text-center text-[9px] text-slate-500 uppercase tracking-widest font-black">
                Counselors online now
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CALLBACK MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-zinc-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              {!isSuccess ? (
                <div className="p-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
                    <PhoneCall className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Request a Callback
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                    Enter your details and our counselor will call you within 24 hours.
                  </p>

                  <form onSubmit={handleCallbackSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. John Doe"
                        className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-900 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">WhatsApp Number</label>
                      <input
                        required
                        type="number"
                        placeholder="+91 98765 43210"
                        className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-900 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Request Call Now"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-6 text-emerald-600"
                  >
                    <CheckCircle2 size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Request Sent!</h3>
                  <p className="text-slate-500 text-sm">
                    Check your phone. Our counselors will reach out to you shortly.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  );
}
