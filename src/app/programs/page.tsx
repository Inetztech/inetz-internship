"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  BarChart3,
  BrainCircuit,
  Cpu,
  Code2,
  LayoutGrid,
  ArrowRight,
  BookOpen,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Video,
  Mic2,
  ArrowUpRight,
  Sparkles,
  Quote,
  Star,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { programData, type Duration, type TechStack } from "@/lib/program-data";
import { useRouter } from "next/navigation";

// --- Sub-Component: TechLogo ---
const TechLogo = ({ name }: { name: string }) => {
  const key = name.toLowerCase();
  const brandColors: Record<string, string> = {
    html5: "#E34F26",
    css3: "#1572B6",
    javascript: "#F7DF1E",
    typescript: "#3178C6",
    react: "#61DAFB",
    node: "#339933",
    mongodb: "#47A248",
    postgresql: "#4169E1",
    github: "#181717",
    excel: "#217346",
    powerbi: "#F2C811",
    python: "#3776AB",
    tensorflow: "#FF6F00",
    pytorch: "#EE4C2C",
    arduino: "#00979D",
    stm32: "#03234B",
    esp32: "#E7352C",
    c: "#A8B9CC",
    java: "#ED8B00",
  };
  const iconColor = brandColors[key] || "#64748b";

  if (key === "excel" || key === "pandas") return <Table color={iconColor} size={18} />;
  if (key === "powerbi") return <BarChart3 color={iconColor} size={18} />;
  if (key === "tensorflow" || key === "pytorch") return <BrainCircuit color={iconColor} size={18} />;
  if (key === "arduino" || key === "stm32") return <Cpu color={iconColor} size={18} />;

  const deviconMapping: Record<string, string> = {
    html5: "devicon-html5-plain",
    css3: "devicon-css3-plain",
    javascript: "devicon-javascript-plain",
    typescript: "devicon-typescript-plain",
    react: "devicon-react-original",
    node: "devicon-nodejs-plain",
    python: "devicon-python-plain",
    java: "devicon-java-plain",
    github: "devicon-github-original",
  };

  return (
    <i
      className={`${deviconMapping[key] || "devicon-github-original"} text-2xl`}
      style={{ color: iconColor }}
    />
  );
};

const InternshipPrograms = () => {
  const router = useRouter();
  const [activeStack, setActiveStack] = useState<TechStack>("Python");
  const [activeDuration, setActiveDuration] = useState<Duration>("1 Week");
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        setIsLoggedIn(res.ok);
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleApply = () => {
    if (isLoggedIn) {
      router.push(`/apply?track=${activeStack}&duration=${activeDuration}`);
    } else {
      router.push(`/login?callback=/programs/details?track=${activeStack}`);
    }
  };

  const stacks: TechStack[] = ["MERN", "Java", "Python", "DataAnalytics", "DataScienceAI", "Embedded"];
  const durations: Duration[] = ["1 Week", "2 Weeks", "1 Month", "3 Months"];
  const current = programData[activeStack]?.[activeDuration];

  if (!current) return <div className="p-20 text-center italic text-zinc-400 animate-pulse font-sans">Syncing track...</div>;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-emerald-100">
      
      {/* 1. HERO SECTION - Adjusted Padding */}
      <section className="relative w-full py-16 overflow-hidden border-b border-zinc-100 bg-zinc-50/50">
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Stack Selection - Tighter Margins */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {stacks.map((s) => {
              const isActive = activeStack === s;
              return (
                <motion.button
                  key={s}
                  onClick={() => setActiveStack(s)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-300 border",
                    isActive 
                      ? "text-white border-zinc-900 shadow-lg" 
                      : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-stack-pill"
                      className="absolute inset-0 bg-zinc-900 rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{s}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Heading - Slightly smaller to "zoom out" */}
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-zinc-900 mb-6 font-sans">
            {current.title} <span className="text-emerald-600">Track</span>
          </h1>

          <div className="inline-flex gap-1 p-1 bg-white rounded-xl border border-zinc-200 shadow-xl mx-auto">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDuration(d)}
                className={cn(
                  "relative px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all z-10 font-sans",
                  activeDuration === d ? "text-white" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {activeDuration === d && (
                  <motion.div layoutId="durTab" className="absolute inset-0 bg-[#fb8500] rounded-lg -z-10" />
                )}
                {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MAIN LAYOUT - Adjusted Gap */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 font-sans">
        <div className="lg:col-span-8 space-y-12">
          
          {/* SYLLABUS SECTION */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 font-sans">
                <LayoutGrid className="w-5 h-5 text-emerald-500" /> Technical Roadmap
              </h2>
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full font-sans">
                {current.syllabus.length} Modules
              </span>
            </div>

            <div className="border border-zinc-200 rounded-[2rem] overflow-hidden bg-white shadow-lg shadow-zinc-200/20">
              <button 
                onClick={() => setIsSyllabusOpen(!isSyllabusOpen)} 
                className="w-full p-6 flex justify-between items-center hover:bg-zinc-50/80 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    animate={{ rotate: isSyllabusOpen ? 360 : 0 }}
                    className={cn(
                      "p-3 rounded-xl transition-all duration-500", 
                      isSyllabusOpen ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-zinc-100 text-zinc-400"
                    )}
                  >
                    <BookOpen className="w-5 h-5" />
                  </motion.div>
                  <div className="text-left font-sans">
                    <h3 className="text-lg font-bold text-zinc-900">Detailed {activeDuration} Syllabus</h3>
                    <p className="text-xs text-zinc-500">Click to expand curriculum details</p>
                  </div>
                </div>
                <div className={cn("p-1.5 rounded-full border border-zinc-100 transition-colors", isSyllabusOpen && "bg-emerald-50 border-emerald-200")}>
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-500", isSyllabusOpen && "rotate-180 text-emerald-600")} />
                </div>
              </button>

              <AnimatePresence>
                {isSyllabusOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden border-t border-zinc-50 bg-gradient-to-b from-white to-zinc-50/30"
                  >
                    <div className="p-6 md:p-10 space-y-0 relative font-sans">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 'calc(100% - 80px)' }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="absolute left-[34px] md:left-[65px] top-[50px] w-[1.5px] bg-gradient-to-b from-emerald-500 via-emerald-200 to-transparent z-0" 
                      />

                      {current.syllabus.map((item, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="relative flex gap-6 group pb-10 last:pb-0">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="min-w-[50px] px-2 h-10 rounded-xl border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-zinc-400 group-hover:border-emerald-500 group-hover:text-emerald-600 transition-all z-10 bg-white text-center font-sans"
                          >
                            {item.label}
                          </motion.div>
                          <div className="flex-1 pt-0.5">
                            <h4 className="text-md font-bold text-zinc-800 group-hover:text-emerald-700 transition-colors font-sans">{item.title}</h4>
                            <div className="flex gap-2.5 mt-2 mb-3">{item.tools.map(t => <TechLogo key={t} name={t} />)}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white/50 p-5 rounded-2xl border border-zinc-100 group-hover:border-emerald-100 transition-all">
                              {item.topics.map((topic, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-zinc-600 font-sans">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> {topic}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* CAREER TRAINING */}
          <section className="space-y-6 pt-6 border-t border-zinc-100">
            <h2 className="text-xl font-bold flex items-center gap-2 font-sans"><Cpu className="w-5 h-5 text-zinc-900" /> Career Training</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group rounded-2xl bg-white border border-zinc-200 p-1.5 shadow-sm hover:shadow-lg transition-all">
                <div className="h-40 relative rounded-xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Technical Sync" />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[8px] font-bold uppercase flex items-center gap-1.5 font-sans"><Video className="w-3 h-3 text-emerald-600" /> Industry Sync</div>
                </div>
                <div className="p-4 font-sans">
                  <h4 className="text-sm font-bold text-zinc-900">Industry Expert Sync</h4>
                  <p className="text-[11px] text-zinc-400 italic mt-0.5">Direct reviews with Senior FAANG SDEs.</p>
                </div>
              </div>
              <div className="group rounded-2xl bg-zinc-900 p-6 text-white relative overflow-hidden flex flex-col justify-between h-full border border-zinc-800 shadow-xl">
                <div className="font-sans">
                  <Mic2 className="w-8 h-8 text-emerald-400 mb-4" />
                  <h4 className="text-md font-bold italic uppercase">Communication Lab</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">Mastering technical storytelling & PR etiquette.</p>
                </div>
                <button className="w-full py-3 rounded-lg bg-white text-zinc-950 font-bold text-[8px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-md font-sans">
                  Review Modules <ArrowUpRight className="w-3 h-3 inline ml-1" />
                </button>
              </div>
            </div>
          </section>

          {/* PROJECTS SECTION */}
          <section className="space-y-6 pt-6 border-t border-zinc-100">
            <h2 className="text-xl font-bold flex items-center gap-2 font-sans"><Code2 className="w-5 h-5 text-zinc-900" /> Student Builds</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {current.projects.map((proj) => (
                <div key={proj.title} className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                  <div className="h-40 overflow-hidden relative">
                    <img src={proj.img} alt={proj.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-5 flex justify-between items-center font-sans">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">{proj.title}</h4>
                      <div className="flex gap-1.5 mt-1.5">
                        {proj.tech.map((t) => (
                          <span key={t} className="text-[7px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-100 px-1.5 py-0.5 rounded-md">{t}</span>
                        ))}
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* REVIEWS SECTION */}
          <section className="space-y-6 pt-6 border-t border-zinc-100">
            <h2 className="text-2xl font-bold flex items-center gap-2 font-sans">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Student Experience
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {current.reviews.map((rev, i) => (
                <div key={i} className="p-6 rounded-[1.5rem] bg-zinc-50 border border-zinc-100 relative group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <Quote className="absolute top-4 right-5 w-6 h-6 text-zinc-200 group-hover:text-emerald-100 transition-colors" />
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-[13px] leading-relaxed text-zinc-600 mb-4 italic font-sans">"{rev.text}"</p>
                  <div className="font-sans">
                    <h5 className="text-[13px] font-bold text-zinc-900">{rev.name}</h5>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{rev.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 3. SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-5">
            <div className="bg-white rounded-[2rem] p-8 border border-blue-100 shadow-xl shadow-blue-500/5 relative overflow-hidden text-center group">
              <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold mb-1.5 tracking-tight font-sans">The future is <span className="text-blue-600">code</span></h3>
              <p className="text-xs text-zinc-400 mb-6 italic font-sans">"Build something that outlasts you."</p>
              
              <button
                onClick={handleApply}
                disabled={isLoggedIn === null}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-sans"
              >
                {isLoggedIn === null ? "Checking..." : <>Apply for {activeStack} <ArrowRight className="w-3.5 h-3.5" /></>}
              </button>

              <div className="mt-6 py-2.5 px-3 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-center gap-1.5 font-sans">
                <Users className="w-3 h-3 text-blue-500" />
                <span className="text-[9px] text-slate-500 font-semibold uppercase">Only 8/20 seats left</span>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            </div>
            
          </div>
        </aside>
      </main>
    </div>
  );
};

export default InternshipPrograms;