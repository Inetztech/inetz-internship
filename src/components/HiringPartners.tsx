"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";


export default function HiringPartners() {
  const partners = [
    { name: "Cognizant", image: "/companies/cognizant.png" },
    { name: "TCS", image: "/companies/tcs.png" },
    { name: "Kaaylabs", image: "/companies/kaaylabs.png" },
    { name: "Keyan", image: "/companies/keyan.png" },
    { name: "eNoah", color: "text-[#ED7F10]" },
    { name: "Enormous", color: "text-[#2B2D42] dark:text-zinc-300" },
    { name: "FedEx", color: "text-[#4D148C] dark:text-violet-400" },
    { name: "G10X", color: "text-zinc-900 dark:text-zinc-100" },
    { name: "G2 TechSoft", color: "text-zinc-800 dark:text-zinc-200" },
    { name: "Gainwell", color: "text-[#0082CA]" },
    { name: "GlobalLogic", color: "text-[#F47321]" },
    { name: "T2 Travel Tech", color: "text-zinc-900 dark:text-zinc-100" },
    { name: "JK Tech", color: "text-zinc-900 dark:text-zinc-100" },
    { name: "Kumaran Systems", color: "text-[#2B822E]" },
    { name: "LexisNexis", color: "text-[#EE3124]" },
    { name: "Manuh Technologies", color: "text-[#0047AB]" },
    { name: "Moder", color: "text-zinc-900 dark:text-zinc-100" },
    { name: "MyTech", color: "text-[#00AEEF]" },
    { name: "Nev", color: "text-zinc-900 dark:text-zinc-100" }
  ];

  const firstRow = partners.slice(0, 10);
  const secondRow = partners.slice(10);

  return (
    <Section className="bg-[#FFF9F2] dark:bg-[#18110B] overflow-hidden py-24 relative border-y border-[#F0D5BA] dark:border-[#38281A]">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full hidden dark:block" />
      <div className="text-center mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4"
        >
          Placement Network
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl text-zinc-900 dark:text-zinc-100 mb-4"
        >
          Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-sky-500">Hiring Partners</span>
        </motion.h2>
      </div>
      <p className="text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed text-center mb-16">
        Our elite placement network connects talented students with top-tier product companies and IT service firms in Chennai. 
        With over 200+ active hiring partners, we ensure our graduates secure high-paying roles in the modern software ecosystem.
      </p>

      {/* Scroller Container */}
      <div className="relative mt-20 flex flex-col gap-10">
        {/* Faded edges */}
        <div className="absolute inset-y-0 left-0 w-8 sm:w-20 bg-gradient-to-r from-[#FFF9F2] dark:from-[#18110B] to-transparent z-20" />
        <div className="absolute inset-y-0 right-0 w-8 sm:w-20 bg-gradient-to-l from-[#FFF9F2] dark:from-[#18110B] to-transparent z-20" />

        {/* Row 1 */}
        <div className="flex gap-12 sm:gap-24 animate-logo-scroll whitespace-nowrap py-4 cursor-pointer hover-pause">
          {[...firstRow, ...firstRow, ...firstRow].map((partner, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-center font-black text-2xl sm:text-4xl transition-all duration-300 tracking-tighter hover:scale-110",
                partner.color
              )}
            >
              {partner.image ? (
                <Image src={partner.image} alt={partner.name} width={120} height={48} className="h-8 sm:h-12 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
              ) : (
                partner.name
              )}
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex gap-12 sm:gap-24 animate-logo-scroll-reverse whitespace-nowrap py-4 cursor-pointer hover-pause">
          {[...secondRow, ...secondRow, ...secondRow].map((partner, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-center font-black text-2xl sm:text-4xl transition-all duration-300 tracking-tighter hover:scale-110",
                partner.color
              )}
            >
              {partner.image ? (
                <Image src={partner.image} alt={partner.name} width={120} height={48} className="h-8 sm:h-12 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
              ) : (
                partner.name
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes logo-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes logo-scroll-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-logo-scroll {
          animation: logo-scroll 25s linear infinite;
        }
        .animate-logo-scroll-reverse {
          animation: logo-scroll-reverse 25s linear infinite;
        }
        @media (min-width: 640px) {
          .animate-logo-scroll {
            animation-duration: 20s;
          }
          .animate-logo-scroll-reverse {
            animation-duration: 20s;
          }
        }
        .hover-pause:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </Section>
  );
}
