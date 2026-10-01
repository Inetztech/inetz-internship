"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Sparkles, Users, Eye } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Course = {
  title: string;
  desc: string;
  tag: string;
  image: string;
  details: string;
  duration: string;
  students: string;
};

export default function PremiumCoursesSection() {
  const [selected, setSelected] = useState<Course | null>(null);

  const courses: Course[] = [
    {
      title: "Java Fullstack Development",
      desc: "Enterprise apps using Spring Boot.",
      tag: "Backend Focus",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200",
      details: "Master Spring Boot, REST APIs, and microservices architecture with Java. Focus on enterprise-grade system design and scalable backend solutions.",
      duration: "5 Months",
      students: "800+ Joined",
    },
    {
      title: "Data Science & AI",
      desc: "AI, ML, and data modeling.",
      tag: "Advanced Tech",
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1200",
      details: "Deep dive into statistical analysis, machine learning algorithms, and neural networks using Python. Build and deploy predictive models.",
      duration: "6 Months",
      students: "600+ Joined",
    },
    {
      title: "Embedded Systems",
      desc: "IoT & real-time systems.",
      tag: "Hardware",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
      details: "Experience hardware-software co-design. Learn microcontrollers, RTOS, and industrial IoT protocols for automation.",
      duration: "4 Months",
      students: "450+ Joined",
    },
  ];

  return (
    <Section className="bg-blue-950 text-white relative py-16 md:py-20">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col gap-4 mb-12 relative z-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 mx-auto"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          Empower your future
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl text-white mb-2"
        >
          Best Software Training <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-sky-500"> in Chennai</span>
        </motion.h2>
        <p className="text-sm md:text-base text-blue-200/80 max-w-xl mx-auto leading-relaxed">
          From Hadoop training to AI and MERN stack, we offer the most comprehensive software internship programs in Chennai for college students and freshers.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 max-w-7xl mx-auto px-6">
        {courses.map((course, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="p-4 border-none bg-white transition-all duration-300 group h-full flex flex-col rounded-[1.5rem] hover:shadow-2xl shadow-xl"
            >
              {/* Image Container - Aspect Video for better fit */}
              <div
                className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-blue-50 group/img cursor-pointer"
                onClick={() => setSelected(course)}
              >
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                />
                <div className="absolute inset-0 bg-blue-900/30 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="flex flex-col flex-1 px-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-2 border border-blue-100">
                  {course.tag}
                </span>
                <h3 className="text-lg font-bold text-blue-950 mb-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                  {course.details}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <Link href="/programs" className="inline-flex items-center gap-1.5 text-blue-600 text-[11px] font-bold group/btn hover:underline">
                    Explore
                    <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                    <Users className="w-3 h-3" />
                    {course.students.split(' ')[0]}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal - Compact Version */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blue-950/90 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl rounded-[2rem] overflow-hidden bg-white shadow-2xl"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 text-blue-600 flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-full h-48 relative overflow-hidden">
                <Image src={selected.image} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" alt={selected.title} />
              </div>

              <div className="p-6 text-left">
                <h3 className="text-xl font-bold text-blue-950 mb-2">{selected.title}</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{selected.details}</p>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Duration</span>
                    <div className="text-sm font-bold text-blue-700">{selected.duration}</div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Status</span>
                    <div className="text-sm font-bold text-blue-700">Open for Cohort</div>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-5 text-sm font-bold">
                  View Full Syllabus
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
