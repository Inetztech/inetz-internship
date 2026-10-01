"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";

export default function Quotes() {
  return (
    <Section className="relative w-full overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 py-20">
      {/* Glow effect matching CTA style */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            
          >
            <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-white leading-relaxed tracking-wide font-tamil italic">
              "தெய்வத்தான் ஆகா தெனினும் முயற்சிதன் <br className="hidden md:block" /> மெய்வருத்தக் கூலி தரும்."
            </h2>
            
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="h-px w-8 bg-white/20" />
              <span className="text-emerald-100/90 font-black uppercase tracking-[0.4em] text-xs md:text-sm">
                திருவள்ளுவர்
              </span>
              <div className="h-px w-8 bg-white/20" />
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .font-tamil {
          line-height: 1.8;
          word-spacing: 0.1em;
        }
      `}</style>
    </Section>
  );
}
