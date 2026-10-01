"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Amjith Khan",
    role: "Junior Software Engineer",
    company: "Zoho Partners",
    image: "placement-students/amjith.png",
    color: "from-amber-500",
  },
  {
    name: "Mohammed Anas",
    role: "React Developer",
    company: "Brightstack",
    image: "placement-students/anas.png",
    color: "from-indigo-500",
  },
  {
    name: "Ariyangau",
    role: "Software Developer",
    company: "Dofy Infosys",
    image: "placement-students/ariyangau.png",
    color: "from-emerald-500",
  },
  {
    name: "Sivaraman",
    role: "Frontend Developer",
    company: "IntechHub",
    image: "placement-students/sivaraman.png",
    color: "from-rose-500",
  },
  {
    name: "Vimal",
    role: "Data Scientist",
    company: "Dofy Infosys",
    image: "placement-students/vimal.png",
    color: "from-sky-500",
  },
];

export default function SuccessStories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <Section className="bg-zinc-50 dark:bg-zinc-950 py-20 overflow-hidden relative border-t border-zinc-200 dark:border-zinc-900">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header - Centered Style */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            Placement Success
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl text-zinc-900 dark:text-zinc-100 mb-8"
          >
            Future Talent. <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-sky-500">Proven Results.</span>
          </motion.h2>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 font-medium">
            Join the elite circle of Inetz alumni who have secured high-impact software roles in Chennai's top product companies and global IT services. 
            Our graduates don't just find jobs; they build careers at industry leaders like Zoho, Brightstack, and more.
          </p>

        </div>

        {/* Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="min-w-[260px] md:min-w-[300px] snap-start group"
            >
              <Card className="relative h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 backdrop-blur-sm overflow-hidden p-0 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2">

                {/* Image Section */}
                <div className="relative h-[280px] overflow-hidden group-hover:grayscale-0 transition-all duration-700">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-top scale-105 group-hover:scale-100 transition-transform duration-700"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                  {/* Company Badge - Glass Style */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md backdrop-blur-md bg-blue-600 border border-white/20">
                    <span className="text-[8px] font-black text-white uppercase tracking-wider">
                      {item.company}
                    </span>
                    <ExternalLink size={10} className="text-white/60" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 relative bg-white dark:bg-zinc-900/80">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-emerald-500">
                    {item.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mt-1">
                    {item.role}
                  </p>

                  {/* Bottom Progress Accent */}
                  <div className={cn(
                    "absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r",
                    item.color, "to-transparent"
                  )} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </Section>
  );
}
