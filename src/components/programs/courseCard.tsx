"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Zap, Globe2, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  BRAND_DATA,
  getStackLogos,
  getIconClass,
  MARKET_INSIGHTS,
  TechStack,
} from "../../lib/Tech-utils";

interface CourseCardProps {
  stack: TechStack;
  title: string;
  image: string;
  subtitle: string;
  description: string;
  modules: number;
  onSelect: (stack: TechStack) => void;
}

/**
 * CourseCard Component
 * Displays individual course tracks with market insights and tech marquee
 */
const CourseCard = ({
  stack,
  title,
  image,
  description,
  modules,
  onSelect,
}: CourseCardProps) => {
  const logos = getStackLogos(stack) || [];
  const market =
    MARKET_INSIGHTS[stack] ||
    MARKET_INSIGHTS[String(stack).toLowerCase()] ||
    MARKET_INSIGHTS["default"] || { demand: "High", trend: "+25% YoY" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      onClick={() => onSelect(stack)}
      className={cn(
        "group relative rounded-[2rem] p-2.5 border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col md:flex-row gap-5 items-center",
        "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800",
        "hover:border-zinc-800 dark:hover:border-emerald-500/50 hover:shadow-2xl"
      )}
    >
      {/* 1. IMAGE SECTION */}
      <div className="relative w-full md:w-[32%] h-48 md:h-56 rounded-[1.5rem] overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800 z-10">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-700"
        />

        <div className="absolute top-3 left-3 flex gap-1">
          <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
            <Globe2 size={10} className="text-emerald-400" />
            <span className="text-[7px] font-black text-white uppercase tracking-tighter">
              {market.demand} Demand
            </span>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20">
          <div className="h-8 w-8 bg-zinc-900 dark:bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all">
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>

      {/* 2. CONTENT HUB */}
      <div className="flex-1 py-2 pr-4 flex flex-col justify-between z-10 w-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={10} />
              <span className="text-[8px] font-bold uppercase">
                {market.trend}
              </span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-1 uppercase">
            {title}
          </h3>

          {/* TECH DOCK MARQUEE */}
          <div className="relative mb-4 w-full max-w-[280px] overflow-hidden rounded-xl p-2 dark:bg-zinc-900/50">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="flex gap-6 items-center w-max"
            >
              {[...logos, ...logos].map((logo, i) => {
                const key = String(logo).toLowerCase().trim();
                const iconClass = getIconClass(logo);
                const brandColor = BRAND_DATA?.[key]?.color || "#64748b";

                return (
                  <div key={i} className="flex items-center gap-1.5 shrink-0">
                    <i
                      className={cn(
                        iconClass,
                        "text-base not-italic inline-block leading-none shrink-0"
                      )}
                      style={{ color: brandColor }}
                    />
                    <span className="text-[7px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {logo}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 italic font-medium leading-relaxed">
            "{description}"
          </p>
        </div>

        {/* 3. FOOTER */}
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800">
              <BookOpen
                size={12}
                className="text-zinc-600 dark:text-zinc-400"
              />
            </div>
            <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">
              {modules} Modules
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-emerald-600 text-white shadow-md">
            <Zap size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[7px] font-black uppercase tracking-widest">
              Industry Ready
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
