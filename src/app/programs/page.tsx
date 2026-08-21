"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CourseCard from "@/components/programs/courseCard";
import InternshipPrograms from "@/components/programs/programDetails";
import { STACK_MAPPING, BRAND_DATA, getIconClass } from "@/lib/Tech-utils";
import { Terminal, Loader2 } from "lucide-react";

// ─── Moved outside component: stable reference, never changes ───────────────
const ALL_SKILLS = Array.from(new Set(Object.values(STACK_MAPPING).flat()));
// Pre-double the array so the ticker JSX doesn't allocate a new array on each render
const TICKER_SKILLS = [...ALL_SKILLS, ...ALL_SKILLS];

const ProgramsMainPage = () => {
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Stable callbacks ──────────────────────────────────────────────────────
  const handleSelect = useCallback((stack: string) => setSelectedStack(stack), []);

  const handleBack = useCallback(() => setSelectedStack(null), []);

  // ─── Fetch with AbortController to avoid state updates after unmount ───────
  useEffect(() => {
    const controller = new AbortController();

    const fetchCatalog = async () => {
      try {
        const res = await fetch("/api/catalog", {
          signal: controller.signal,
        });
        const data = await res.json();

        /**
         * LOGIC: If the DB has multiple durations for one course,
         * we only show one unique card in the catalog.
         */
        const uniqueCatalog = data.reduce((acc: any[], current: any) => {
          const exists = acc.find((item) => item.title === current.title);
          if (!exists) return acc.concat([current]);
          return acc;
        }, []);

        setCourses(uniqueCatalog);
      } catch (err) {
        // Ignore AbortError — it's intentional on cleanup
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Failed to load catalog data");
        }
      } finally {
        // Only update loading state if the fetch wasn't aborted
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCatalog();

    return () => controller.abort();
  }, []);

  // ─── Scroll to top when stack selection changes ────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedStack]);

  return (
    <div className="min-h-screen bg-[#fcfdfd] text-[#1a1a1a] antialiased">
      {/* BACKGROUND ACCENT SHAPES */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -left-[5%] w-[400px] h-[400px] bg-blue-50/40 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {!selectedStack ? (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10 max-w-6xl mx-auto px-6"
          >
            {/* 1. TICKER NAV */}
            <nav className="flex items-center justify-between py-5 border-b border-emerald-100 overflow-hidden">
              <div className="flex items-center gap-2 shrink-0 pr-10 bg-[#fcfdfd]/80 backdrop-blur-sm z-10">
                <div className="p-1.5 rounded-md bg-emerald-600">
                  <Terminal size={14} className="text-white" />
                </div>
              </div>

              <motion.div
                animate={{ x: [0, -1200] }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="flex gap-10 whitespace-nowrap"
              >
                {TICKER_SKILLS.map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 group cursor-default"
                  >
                    <i
                      className={`${getIconClass(skill)} text-sm transition-transform group-hover:scale-125`}
                      style={{ color: BRAND_DATA[skill.toLowerCase()]?.color }}
                    />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-emerald-600 transition-colors">
                      {skill}
                    </span>
                  </div>
                ))}
              </motion.div>
            </nav>

            {/* 2. HERO SECTION */}
            <header className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 pb-14 items-center">
              <div className="lg:col-span-6 space-y-5">
                {/* Main Header */}
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 leading-none">
                    Best Software Training <br />
                    <span className="text-blue-600"> in Chennai.</span>
                  </h1>
                  <p className="text-base md:text-lg text-zinc-500 font-medium tracking-tight">
                    Professional internship training in Vadapalani.
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm md:text-base text-zinc-600 max-w-sm leading-relaxed">
                  Join the best software training  in Chennai. We offer specialized 1 month and 15 days internship programs for college students in Python, Java, AI, and Hadoop.
                </p>

                {/* Small Details */}
                <div className="flex gap-6 pt-2 border-t border-zinc-100">
                  <div>
                    <p className="text-[9px] font-black uppercase text-zinc-400">
                      Level
                    </p>
                    <p className="text-xs font-bold text-zinc-800 uppercase">
                      Industry Ready
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-zinc-400">
                      Focus
                    </p>
                    <p className="text-xs font-bold text-zinc-800 uppercase">
                      Architecture
                    </p>
                  </div>
                </div>
              </div>

              {/* HERO IMAGE COLUMN */}
              <div className="lg:col-span-6">
                <div className="relative p-2 rounded-[2rem] bg-gradient-to-br from-emerald-100 to-blue-50 border border-white shadow-xl">
                  <div className="aspect-[16/11] rounded-[1.5rem] overflow-hidden bg-white relative group">
                    <img
                      src="/programs.png"
                      alt="Advanced System Architecture"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </header>

            {/* 3. TRACKS CATALOG GRID */}
            <div id="catalog-grid" className="space-y-8 pb-20">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-800 shrink-0 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                  Catalog.2026
                </h2>
                <div className="h-[1px] w-full bg-gradient-to-r from-emerald-100 to-transparent" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {loading ? (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Synchronizing Catalog...
                    </span>
                  </div>
                ) : (
                  courses.map((item) => (
                    <CourseCard
                      key={item.slug}
                      stack={item.slug.split("-")[0]} // Normalizes "mern-1-week" to "mern"
                      title={item.title}
                      subtitle={item.subtitle}
                      image={item.image}
                      onSelect={handleSelect}
                      description={item.subtitle}
                      modules={item.syllabus?.length}
                    />
                  ))
                )}
              </div>

              {/* SEO Summary Footer */}
              <div className="pt-16 border-t border-zinc-100">
                <p className="text-[9px] text-zinc-400 font-medium leading-relaxed opacity-70">
                  Looking for the best internship companies in Chennai? Inetz Technologies provides it companies in Chennai for internship opportunities for freshers and college students. Whether you need a 1 month internship in Chennai with a certificate or a 15 days technical program in Vadapalani, our training center near Nexus Vijaya Mall is the top choice. We specialize in MERN, Java, Python, AI, and Hadoop training in Chennai.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <InternshipPrograms
              initialStack={selectedStack}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgramsMainPage;