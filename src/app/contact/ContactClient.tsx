"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Layers,
  Clock,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Ensure sonner is installed

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Something went wrong");

      toast.success("Message sent successfully");
      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: <Phone size={20} />,
      title: "Call Us",
      details: "+91 98402 34475",
      description: "Mon - Sat, 9AM to 6PM",
      action: "tel:+919840234475",
    },
    {
      icon: <Mail size={20} />,
      title: "Email Us",
      details: "inetztechnologies@gmail.com",
      description: "Support team ready to help",
      action: "mailto:info@inetztech.com",
    },
    {
      icon: <MapPin size={20} />,
      title: "Visit Us",
      details: "KP Towers, Vadapalani",
      description: "Professional environment",
      action: "https://maps.google.com",
    },
  ];

  return (
    <div className="relative min-h-screen bg-zinc-50 py-12 dark:bg-zinc-950 md:py-20">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-10 top-0 h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-[100px]" />
        <div className="absolute -left-10 bottom-0 h-[300px] w-[300px] rounded-full bg-sky-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
            Connect With Us
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl"
          >
            Let's Build Your <span className="text-emerald-600 italic">Future.</span>
          </motion.h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Contact Inetz Technologies, the leading software training  in Chennai, for internship programs,
            corporate training, and career-focused project guidance. Visit our Vadapalani center today.
          </p>
        </div>

        {/* Office Section */}
        <div className="mb-20 grid gap-8 lg:grid-cols-2">
          <div className="relative min-h-[350px] overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/office.png"
              alt="Office"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Headquarters</p>
              <h3 className="font-bold text-sm">KP Towers, Vadapalani, Chennai</h3>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white/50 p-5 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">📍 KP Towers, Vadapalani</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Located opposite Nexus Vijaya Mall with premium infrastructure.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: <Layers size={16} />, title: "Pro Environment", desc: "Premium workspace" },
                { icon: <Clock size={16} />, title: "Fulltime Guidance", desc: "Expert support" },
                { icon: <MapPin size={16} />, title: "Prime Location", desc: "Near Metro Station" },
                { icon: <Building2 size={16} />, title: "Infrastructure", desc: "Advanced labs" },
              ].map((f, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 bg-white/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <span className="mb-2 block text-emerald-500">{f.icon}</span>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{f.title}</h4>
                  <p className="text-[11px] text-zinc-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact & Form Grid */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: Contact Methods */}
          <div className="mt-6 space-y-8">
            {contactMethods.map((method, idx) => (
              <div key={idx} className="group flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-emerald-600 shadow-sm transition-transform group-hover:scale-110 dark:border-zinc-800 dark:bg-zinc-900">
                  {method.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{method.title}</h3>
                  <p className="text-xs text-zinc-500 mb-1">{method.description}</p>
                  <a href={method.action} className="text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
                    {method.details}
                  </a>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-50 p-6 dark:border-zinc-800 dark:from-zinc-900/50">
              <h4 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">Enterprise Solutions</h4>
              <p className="mb-4 text-xs text-zinc-600 dark:text-zinc-400">Upskill your corporate teams with modern technologies.</p>
              <a href="mailto:info@inetztech.com" className="text-xs font-bold text-emerald-600 hover:underline">Contact Corporate Team →</a>
            </div>
          </div>

          {/* Right: Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80">
              <h3 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-bold uppercase text-zinc-400">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Rahul S."
                      className="h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 text-sm outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-bold uppercase text-zinc-400">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rahul@example.com"
                      className="h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 text-sm outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-bold uppercase text-zinc-400">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 text-sm outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-bold uppercase text-zinc-400">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Course Inquiry"
                      className="h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 text-sm outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-bold uppercase text-zinc-400">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="w-full resize-none rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm outline-none transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className={`relative flex h-11 w-full items-center justify-center gap-2 rounded-xl font-bold transition-all duration-300 ${isSubmitted
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-900 text-white hover:bg-black dark:bg-zinc-100 dark:text-zinc-900"
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Sending...</span>
                      </motion.div>
                    ) : isSubmitted ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        <span>Sent</span>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <span>Send Message</span>
                        <Send size={14} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
