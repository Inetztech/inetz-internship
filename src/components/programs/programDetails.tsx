"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, LayoutGrid, ArrowRight, CheckCircle2, Video, Mic2, ArrowUpRight,
  Sparkles, Quote, Star, ArrowLeft, X, Download, Lock, UserCheck, Briefcase, Loader2,
  PhoneCall,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import ProgramCard from "./ProgramCard";
import { BRAND_DATA, getIconClass } from "../../lib/Tech-utils";
import theComSession from "../../../public/TheComSession.png";
import { toast } from "sonner";

const DURATION_ORDER = ["1 Week", "2 Weeks", "1 Month", "3 Months"];

const TRACK_IMAGES: Record<string, string> = {
  python:        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
  mern:          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200",
  java:          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200",
  dataanalytics: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=1200",
};

const CAREER_FEATURES = [
  { title: "Industry Expert Sessions", description: "Participate in weekly technical deep-dives with Senior SDEs from FAANG. Get your code reviewed and architecture critiqued by the best in the software industry.", icon: <Video className="w-5 h-5" />, color: "bg-blue-600", tag: "Mentorship", image: "https://images.unsplash.com/photo-1591115765373-520b7a217294?auto=format&fit=crop&q=80" },
  { title: "Daily Agile Tasks", description: "Receive daily tickets on our private dashboard. Submit Pull Requests, handle merge conflicts, and master the professional Git workflow used by top tech firms in Chennai.", icon: <Briefcase className="w-5 h-5" />, color: "bg-orange-600", tag: "Daily Sprints", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80" },
  { title: "Mock Interview Series", description: "Prepare for high-stakes technical rounds with 1-on-1 mock interviews and real-time feedback. We cover DSA, System Design, and behavioral preparation for placements in Chennai.", icon: <UserCheck className="w-5 h-5" />, color: "bg-purple-600", tag: "Placement", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80" },
  { title: "Communication Lab", description: "Master technical storytelling. Learn to explain your code logic clearly to recruiters and stakeholders—the critical bridge between technical skills and a successful career.", icon: <Mic2 className="w-5 h-5" />, color: "bg-emerald-600", tag: "Soft Skills", image: theComSession.src },
];

const UNLOCK_FORM_FIELDS = [
  { placeholder: "Full Name",        type: "text", key: "name"  },
  { placeholder: "WhatsApp Number",  type: "tel",  key: "phone" },
] as const;

const MARQUEE_MASK_STYLE: React.CSSProperties = {
  maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
  WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
};

const TechLogo = memo(({ name }: { name: string }) => {
  const key = name.toLowerCase();
  const style = useMemo(
    () => ({ color: BRAND_DATA[key]?.color || "#64748b" }),
    [key],
  );
  return (
    <i
      className={cn(getIconClass(key), "text-2xl transition-transform hover:scale-110")}
      style={style}
    />
  );
});
TechLogo.displayName = "TechLogo";

const ReviewCard = memo(({ rev }: { rev: any }) => (
  <div className="w-[320px] shrink-0 p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100 relative group hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all duration-500 will-change-transform">
    <Quote className="absolute top-6 right-8 w-6 h-6 text-zinc-200 group-hover:text-emerald-100 transition-colors" />
    <div className="flex gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-2.5 h-2.5", i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200")} />)}
    </div>
    <p className="text-[12px] leading-relaxed text-zinc-600 mb-6 italic line-clamp-3">"{rev.text || rev.comment}"</p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-sm">
        {rev.name?.charAt(0) || "?"}
      </div>
      <div>
        <h5 className="text-[12px] font-bold text-zinc-900 leading-tight">{rev.name}</h5>
        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{rev.role}</p>
      </div>
    </div>
  </div>
));
ReviewCard.displayName = "ReviewCard";

const Spinner = ({ label }: { label: string }) => (
  <div className="py-32 flex flex-col items-center justify-center gap-3 text-zinc-400">
    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
  </div>
);

const InternshipPrograms = ({ initialStack = "mern", onBack }: { initialStack?: string; onBack?: () => void }) => {
  const router = useRouter();
  const [activeStack] = useState(initialStack);
  const [activeDuration, setActiveDuration] = useState<string | null>(null);
  const [availableDurations, setAvailableDurations] = useState<string[]>([]);
  const [durationsLoading, setDurationsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  // Check auth & auto-unlock if logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.ok) {
          setIsLoggedIn(true);
          setHasUnlocked(true); // Automatically unlock syllabus for logged-in users
          localStorage.setItem("unlocked", "true");
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false));

    if (localStorage.getItem("unlocked") === "true") {
      setHasUnlocked(true);
    }
  }, []);

  useEffect(() => {
    setDurationsLoading(true);
    fetch("/api/programs")
      .then((r) => r.json())
      .then((all: any[]) => {
        const prefix = activeStack.toLowerCase() + "-";
        const durations = all
          .filter((p) => p.slug?.toLowerCase().startsWith(prefix))
          .map((p) => p.duration).filter(Boolean)
          .sort((a: string, b: string) => {
            const ai = DURATION_ORDER.findIndex((d) => d.toLowerCase() === a.toLowerCase());
            const bi = DURATION_ORDER.findIndex((d) => d.toLowerCase() === b.toLowerCase());
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
          });
        const unique = Array.from(new Set(durations));
        setAvailableDurations(unique);
        if (unique.length > 0) setActiveDuration(unique[0]);
      })
      .catch(() => setAvailableDurations([]))
      .finally(() => setDurationsLoading(false));
  }, [activeStack]);

  useEffect(() => {
    if (!activeDuration) return;
    setLoading(true); setNotFound(false); setCurrent(null);
    const slug = `${activeStack.toLowerCase()}-${activeDuration.toLowerCase().replace(/\s+/g, "-")}`;
    fetch(`/api/programs/${slug}`)
      .then(async (r) => { if (!r.ok) { setNotFound(true); return; } setCurrent(await r.json()); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [activeStack, activeDuration]);

  // Syllabus is unlocked if user is logged in OR if user completed the lead form
  const isSyllabusLocked = useMemo(() => !isLoggedIn && !hasUnlocked, [isLoggedIn, hasUnlocked]);

  const savings = useMemo(
    () => current?.originalPrice
      ? Math.round(((current.originalPrice - current.price) / current.originalPrice) * 100)
      : 0,
    [current?.originalPrice, current?.price],
  );

  const validReviews = useMemo(() => (current?.reviews || []).filter((r: any) => r.name), [current]);
  const animDuration = useMemo(() => Math.max(validReviews.length * 8, 20), [validReviews.length]);

  const handleApply = useCallback(() => {
    const params = new URLSearchParams({
      track: activeStack,
      duration: activeDuration || "",
      price: current.price.toString(),
      courseTitle: current.title,
      originalPrice: current.originalPrice?.toString() || "",
    });
    const url = `/apply?${params}`;
    router.push(isLoggedIn ? url : `/login?callback=${encodeURIComponent(url)}`);
  }, [activeStack, activeDuration, current, isLoggedIn, router]);

  const handleLeadSubmit = useCallback(async () => {
    if (!leadForm.name || !leadForm.phone) return alert("Please enter both Name and Phone");
    setIsSubmitting(true);
    try {
      const r = await fetch("/api/send-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...leadForm, stack: activeStack, type: "Syllabus Unlock" }),
      });
      if (r.ok) {
        setShowModal(false);
        setHasUnlocked(true);
        localStorage.setItem("unlocked", "true");
        alert("Syllabus Unlocked!");
      }
    } catch {
      alert("Error sending details.");
    } finally {
      setIsSubmitting(false);
    }
  }, [leadForm, activeStack]);

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

  const handleDownload = useCallback(() => {
    if (isSyllabusLocked) { 
      setShowModal(true); 
      return; 
    }
    if (!current?.pdfFileName) { 
      alert("No PDF available yet."); 
      return; 
    }
    const a = document.createElement("a");
    a.href = `/api/download-pdf?file=${encodeURIComponent(current.pdfFileName)}`;
    a.download = current.pdfFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [isSyllabusLocked, current?.pdfFileName]);

  const handleCloseModal = useCallback(() => setShowModal(false), []);
  const handleOpenModal  = useCallback(() => {
    if (isSyllabusLocked) {
      setShowModal(true);
    }
  }, [isSyllabusLocked]);

  if (durationsLoading) return <Spinner label="Loading track..." />;
  if (!availableDurations.length) return (
    <div className="p-20 text-center space-y-3">
      <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">No Tracks Available</p>
      <p className="text-zinc-300 text-xs">No durations found for <strong>{activeStack}</strong>. Upload via the admin panel.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased">

      <div className="max-w-7xl mx-auto px-6 pt-8">
        <button onClick={onBack || (() => router.back())} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Catalogue
        </button>
      </div>

      {/* HERO */}
      <section className="relative w-full py-20 overflow-hidden border-b border-zinc-100 bg-white">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-zinc-50/50 -skew-x-12 translate-x-20 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-7xl font-semibold tracking-tight text-zinc-900 mb-8 leading-[1.1]">
                {current?.title || activeStack}<br /><span className="text-emerald-600">Track</span>
              </h1>
              <div className="inline-flex gap-1 p-1 bg-white rounded-xl border border-zinc-200 shadow-2xl flex-wrap">
                {availableDurations.map((d) => (
                  <button key={d} onClick={() => setActiveDuration(d)}
                    className={cn("relative px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all z-10", activeDuration === d ? "text-white" : "text-zinc-400 hover:text-zinc-600")}
                  >
                    {activeDuration === d && <motion.div layoutId="durTab" className="absolute inset-0 bg-zinc-900 rounded-lg -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                    {d}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 bg-emerald-50/50 rounded-[2rem] blur-2xl z-0" />
            <AnimatePresence mode="wait">
              <motion.div key={activeDuration} initial={{ opacity: 0, x: 20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -20, scale: 0.95 }} transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative z-10 overflow-hidden rounded-2xl border border-zinc-200 shadow-2xl bg-zinc-100"
              >
                <div className="aspect-[16/10] w-full relative">
                  <img src={current?.heroImg || TRACK_IMAGES[activeStack.toLowerCase()] || TRACK_IMAGES.mern} alt={activeStack} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full border border-zinc-200 shadow-sm flex items-center gap-2">
                    <TechLogo name={activeStack} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-800">{activeStack} Track</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {loading ? <Spinner label="Syncing track..." /> : notFound || !current ? (
        <div className="py-32 text-center space-y-2">
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Track Not Found</p>
          <p className="text-zinc-300 text-xs">No data for <strong>{activeStack}</strong> — <strong>{activeDuration}</strong>. Upload via admin.</p>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-12">

            {/* ROADMAP */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-emerald-500" /> Technical Roadmap</h2>
                <div className="flex gap-2">
                  {isSyllabusLocked && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1 uppercase tracking-tighter">
                      <Lock size={10} /> Limited Preview
                    </span>
                  )}
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">{current.syllabus?.length || 0} Modules</span>
                </div>
              </div>
              <div className="relative border border-zinc-200 rounded-[2rem] bg-white shadow-lg shadow-zinc-200/20 overflow-hidden">
                <div className="p-6 md:p-10 relative">
                  <div className="absolute left-[34px] md:left-[65px] top-[50px] w-[1.5px] bg-gradient-to-b from-emerald-500 via-emerald-200 to-transparent h-[calc(100%-100px)] z-0" />
                  {current.syllabus?.map((item: any, idx: number) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative flex gap-6 pb-10 last:pb-0">
                      <div className="min-w-[50px] h-10 rounded-xl border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-zinc-400 z-10 bg-white shrink-0">{item.label}</div>
                      <div className="flex-1 pt-0.5">
                        <h4 className="text-md font-bold text-zinc-800">{item.title}</h4>
                        <div className="flex gap-2.5 mt-2 mb-3">{item.tools?.map((t: string) => <TechLogo key={t} name={t} />)}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white/50 p-5 rounded-2xl border border-zinc-100">
                          {(isSyllabusLocked ? item.topics?.slice(0, 3) : item.topics)?.map((topic: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-zinc-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> {topic}
                            </div>
                          ))}
                          {isSyllabusLocked && item.topics?.length > 3 && (
                            <div className="col-span-full mt-3 p-3 bg-zinc-50 rounded-xl border border-dashed border-zinc-100 flex items-center justify-between">
                              <p className="text-[10px] text-zinc-400 italic">+ {item.topics.length - 3} advanced topics hidden</p>
                              <button onClick={handleOpenModal} className="text-[9px] font-bold text-emerald-600 uppercase flex items-center gap-1 hover:underline">
                                Unlock Full Module <ArrowRight size={10} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                    {isSyllabusLocked ? "Enter contact details to unlock full syllabus" : <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Syllabus Access Granted</>}
                  </p>
                  <button onClick={handleDownload} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all shadow-md", isSyllabusLocked ? "bg-emerald-600 text-white animate-pulse" : "bg-zinc-900 text-white")}>
                    {isSyllabusLocked ? "Unlock Full Roadmap" : "Download PDF"} <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* CAREER */}
            <section className="relative py-24 bg-blue-800 px-6 rounded-[3rem]">
              <div className="max-w-5xl mx-auto mb-16 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                  <Sparkles size={12} /> Career Acceleration
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Everything to get you <span className="text-green-500">Job Ready</span></h2>
              </div>
              <div className="relative max-w-5xl mx-auto">
                {CAREER_FEATURES.map((f, idx) => (
                  <div key={idx} className="sticky top-28 w-full mb-8 last:mb-0">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ margin: "-5% 0px -5% 0px" }}
                      className="relative w-full h-[320px] md:h-[280px] overflow-hidden rounded-[2rem] border border-zinc-200 bg-white flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
                    >
                      <div className="w-full md:w-[40%] h-32 md:h-full relative overflow-hidden">
                        <img src={f.image} alt={f.title} className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-900 shadow-sm backdrop-blur-sm">{f.tag}</div>
                      </div>
                      <div className="flex-1 p-6 md:p-10 flex flex-col justify-center relative">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg", f.color)}>{f.icon}</div>
                        <h3 className="text-xl md:text-2xl font-bold text-zinc-900 mb-2 flex items-center gap-2">{f.title} <ArrowUpRight size={16} className="text-zinc-300" /></h3>
                        <p className="text-zinc-500 text-sm md:text-base leading-relaxed font-medium max-w-md">{f.description}</p>
                        <span className="absolute bottom-6 right-8 text-4xl md:text-5xl font-black text-zinc-100 italic tracking-tighter select-none">0{idx + 1}</span>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </section>

            {/* PROJECTS */}
            {current.projects?.length > 0 && (
              <section className="space-y-6 pt-6 border-t border-zinc-100">
                <h2 className="text-xl font-bold flex items-center gap-2"><Code2 className="w-5 h-5" /> Student Builds</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {current.projects.map((proj: any) => (
                    <ProgramCard key={proj.title} title={proj.title} subtitle={proj.subtitle}
                      description={`Built using ${proj.tech?.join(", ")}.`}
                      image={proj.img || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"}
                      badgeText="Live Project" badgeIcon={Code2}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* REVIEWS */}
            <section className="space-y-8 pt-10 border-t border-zinc-100 overflow-hidden">
              <h2 className="text-xl font-bold px-2 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Student Experience</h2>
              <div className="flex overflow-hidden" style={MARQUEE_MASK_STYLE}>
                <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: animDuration, repeat: Infinity, ease: "linear" }} className="flex gap-6 shrink-0 will-change-transform">
                  {validReviews.length > 0
                    ? [...validReviews, ...validReviews].map((rev: any, i: number) => <ReviewCard key={i} rev={rev} />)
                    : <p className="text-zinc-400 text-sm p-10">Joining the elite league soon...</p>
                  }
                </motion.div>
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 sticky top-24 self-start">
            <div className="bg-white rounded-[2rem] p-8 border border-blue-100 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
              <div className="relative z-10 text-center">
                <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-bold mb-1">Start Learning <span className="text-blue-600">Today</span></h3>
                <div className="my-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-black">₹{current.price}</span>
                    {current.originalPrice && <span className="text-sm text-zinc-300 line-through">₹{current.originalPrice}</span>}
                  </div>
                  {savings > 0 && <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1 tracking-widest">Save {savings}% Today</p>}
                </div>
                <button onClick={handleApply} disabled={isLoggedIn === null}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoggedIn === null ? "Checking..." : <>Enroll in {activeStack} Track <ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </div>
          </aside>
        </main>
      )}

      {/* UNLOCK MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
              <button onClick={handleCloseModal} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <Lock className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Unlock Roadmap</h3>
                <p className="text-zinc-400 text-sm mb-8">Register your interest to view the complete curriculum and project list.</p>
                <div className="space-y-4">
                  {UNLOCK_FORM_FIELDS.map(({ placeholder, type, key }) => (
                    <input key={key} type={type} placeholder={placeholder} value={leadForm[key]}
                      onChange={(e) => setLeadForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm focus:border-emerald-500 outline-none transition-colors"
                    />
                  ))}
                  <button onClick={handleLeadSubmit} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase mt-4 shadow-xl shadow-emerald-500/10 hover:bg-emerald-400 transition-colors">
                    {isSubmitting ? "Generating Access..." : "Unlock Full Syllabus"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">WhatsApp Number</label>
                      <input 
                        required
                        type="tel" 
                        placeholder="+91 98765 43210"
                        className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-900 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
       
    </div>
  );
};

export default InternshipPrograms;
