"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Network, ChevronLeft, ChevronRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

const SLIDER_SLIDES = [
  {
    url: "/colleges/peri-college.png",
    title: "PERI  of Technology",
    desc: "Collaborating to provide industry-standard software training and placement support for engineering students in Chennai.",
    tag: "MOE Signing",
  },
  {
    url: "/colleges/fx-college.png",
    title: "Francis Xavier Engineering College",
    desc: "Empowering future engineers with advanced technical skills and real-time internship programs through strategic academic partnership.",
    tag: "Partnership",
  },
  {
    url: "/colleges/clg-moe1.png",
    title: "St. Joseph's College of Engineering",
    desc: "Integrating our specialized full-stack and data science curriculum into academic frameworks to ensure high-impact career growth.",
    tag: "MOU Signing",
  },
  {
    url: "/colleges/clg-moe.png",
    title: "SDNB Vaishnav College for Women",
    desc: "Delivering expert-led on-campus training sessions to bridge the gap between classroom theory and modern IT industry requirements.",
    tag: "Training",
  },
] as const;

const PARTNERS = [
  "Indian  of Technology",
  "Anna University",
  "VIT University",
  "SRM ",
  "BMS College of Engineering",
  "JNTU Hyderabad",
  "College of Engineering Guindy",
  "PSG Tech",
  "Amrita Vishwa Vidyapeetham",
  "NIT Trichy",
  "SASTRA University",
  "SSN College of Engineering",
];

// UPDATED THEME: White Cards with Dark Text
const SECTION_STYLE: React.CSSProperties = { background: "#130746" }; // Section stays Navy
const CARD_BG = "#ffffff"; // Card background changed to White

const PARTNER_SCRIM_TOP: React.CSSProperties = {
  top: "46px", height: "24px",
  background: `linear-gradient(to bottom, ${CARD_BG}, transparent)`,
};
const PARTNER_SCRIM_BOT: React.CSSProperties = {
  height: "52px",
  background: `linear-gradient(to top, ${CARD_BG}, transparent)`,
};
// Balanced overlay for better text contrast without being too dark
const SLIDE_SCRIM: React.CSSProperties = {
  background: "linear-gradient(to top, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.3) 50%, transparent 100%)",
};

// ─── Shared primitives ──────────────────────────────────────────────────────────

function PulseDot() {
  return <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />;
}

function EmBadge({ icon: Icon, label }: { icon?: React.ElementType; label: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest"
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </div>
  );
}

function CardShell({
  className,
  style,
  children,
  ...props
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <div
      className={cn("rounded-2xl overflow-hidden shadow-2xl", className)}
      style={{ background: CARD_BG, border: "1px solid rgba(0,0,0,0.05)", ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function MOESection() {
  const [[slide, direction], setSlideDirection] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const total = SLIDER_SLIDES.length;

  const setSlide = useCallback((newSlide: number, newDirection: number) => {
    setSlideDirection([newSlide, newDirection]);
  }, []);

  const next = useCallback(() => {
    const nextSlide = (slide + 1) % total;
    setSlide(nextSlide, 1);
  }, [slide, total, setSlide]);

  const prev = useCallback(() => {
    const prevSlide = (slide - 1 + total) % total;
    setSlide(prevSlide, -1);
  }, [slide, total, setSlide]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, 3000);
    return () => clearInterval(interval);
  }, [next, isPaused]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <Section className="relative py-20 overflow-hidden" style={SECTION_STYLE} maxWidth="xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 w-full">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <EmBadge icon={Network} label="Institutional Network" />

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl text-white mt-4 mb-3"
          >
            Strategic MOE & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-sky-500">Academic Partners</span>
          </motion.h2>

          <p style={{ color: "#94a3b8" }} className="max-w-[480px] mx-auto text-sm leading-relaxed font-medium">
            Our Memorandum of Engagement embeds industry-standard curriculum
            directly on campus — transforming theoretical foundations into
            industrial mastery.
          </p>
        </motion.div>

        {/* ── Grid ── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* LEFT: Image Slider */}
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48 }}
            >
              <CardShell
                className="group relative h-[300px] sm:h-[340px]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={slide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.3 }
                    }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={SLIDER_SLIDES[slide].url}
                      alt={SLIDER_SLIDES[slide].title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover brightness-105 contrast-[1.02] transition-all duration-700"
                    />
                    <div className="absolute inset-0 pointer-events-none" style={SLIDE_SCRIM} />
                  </motion.div>
                </AnimatePresence>

                <div
                  className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    background: "rgba(15,23,42,0.85)",
                    border: "1px solid rgba(16,185,129,0.4)",
                    color: "#ffffff",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {SLIDER_SLIDES[slide].tag}
                </div>

                <div className="absolute top-4 right-4 z-20 flex gap-1.5">
                  {SLIDER_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i, i > slide ? 1 : -1)}
                      className={cn(
                        "h-[3px] rounded-full transition-all duration-300",
                        i === slide ? "w-6 bg-emerald-400" : "w-[6px] bg-white/40"
                      )}
                    />
                  ))}
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <h3 className="text-xl font-bold text-white mb-2">{SLIDER_SLIDES[slide].title}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">{SLIDER_SLIDES[slide].desc}</p>
                </div>

                {/* Navigation */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={prev} className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={next} className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </CardShell>
            </motion.div>
          </div>

          {/* RIGHT: List Scroller */}
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48 }}
            >
              <CardShell className="relative" style={{ height: "340px" }}>
                <div
                  className="flex items-center justify-between px-6 py-4 relative z-20"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: CARD_BG }}
                >
                  <span className="text-xs font-black uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400">
                    Active MOU Partners
                  </span>
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-600"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    <PulseDot /> 50+ Links
                  </div>
                </div>

                <div className="absolute z-10 left-0 right-0 pointer-events-none" style={PARTNER_SCRIM_TOP} />
                <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={PARTNER_SCRIM_BOT} />

                <div className="absolute top-[76px] bottom-0 left-0 right-0 overflow-hidden">
                  <div className="w-full h-full overflow-hidden relative scroller-container pt-4 pb-20">
                    <div className="flex flex-col animate-scroll-vertical">
                      {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((name, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-zinc-50 transition-colors cursor-pointer group/item">
                          <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span className="text-sm font-medium text-zinc-600 group-hover/item:text-zinc-900 transition-colors">
                            {name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardShell>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollV {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        .animate-scroll-vertical {
          animation: scrollV 25s linear infinite;
        }
        .scroller-container:hover .animate-scroll-vertical {
          animation-play-state: paused;
        }
      `}</style>
    </Section>
  );
}
