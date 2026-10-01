"use client";

import { motion } from "framer-motion";
import {
  Layers,
  ListTodo,
  FileText,
  BarChart3,
  Code2,
  Presentation,
  CheckCircle,
  Award,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Concept Learning",
    desc: "Understand core fundamentals with real-world relevance through interactive sessions.",
    icon: Layers,
    color: "bg-teal-500",
    textColor: "group-hover:text-teal-500",
    shadow: "shadow-teal-500/20",
  },
  {
    title: "Task-Based Practice",
    desc: "Daily hands-on tasks to build practical coding confidence and muscle memory.",
    icon: ListTodo,
    color: "bg-blue-500",
    textColor: "group-hover:text-blue-500",
    shadow: "shadow-blue-500/20",
  },
  {
    title: "Mini Applications",
    desc: "Build small yet functional apps to strengthen core logic and problem-solving.",
    icon: FileText,
    color: "bg-purple-500",
    textColor: "group-hover:text-purple-500",
    shadow: "shadow-purple-500/20",
  },
  {
    title: "Real-Time Projects",
    desc: "Collaborate on industry-level real-world applications with modern tech stacks.",
    icon: BarChart3,
    color: "bg-emerald-500",
    textColor: "group-hover:text-emerald-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    title: "Code Review",
    desc: "Professional mentor feedback to improve code quality and industry standards.",
    icon: Code2,
    color: "bg-pink-500",
    textColor: "group-hover:text-pink-500",
    shadow: "shadow-pink-500/20",
  },
  {
    title: "Board Presentation",
    desc: "Soft-skills training to present your work clearly with technical confidence.",
    icon: Presentation,
    color: "bg-indigo-500",
    textColor: "group-hover:text-indigo-500",
    shadow: "shadow-indigo-500/20",
  },
  {
    title: "Mock Interviews",
    desc: "Prepare for corporate rounds with practice interview sessions and feedback.",
    icon: CheckCircle,
    color: "bg-rose-500",
    textColor: "group-hover:text-rose-500",
    shadow: "shadow-rose-500/20",
  },
  {
    title: "Certification & Support",
    desc: "Get certified and receive dedicated placement support to kickstart your career.",
    icon: Award,
    color: "bg-sky-500",
    textColor: "group-hover:text-sky-500",
    shadow: "shadow-sky-500/20",
  },
];

export default function InternshipProcess() {
  return (
    <Section className="bg-zinc-50 dark:bg-zinc-950 transition-colors relative overflow-hidden">
      {/* Dark mode glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full hidden dark:block" />

      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4"
        >
          Our Roadmap
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl text-zinc-900 dark:text-zinc-100"
        >
          Best Software Training <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-sky-500"> in Chennai</span> - Internship Training
        </motion.h2>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-lg text-zinc-600 dark:text-zinc-400 w-full mb-12 max-w-2xl mx-auto text-center"
      >
        The Inetz roadmap is a structured, career-focused system designed to bridge the gap between academic learning and industrial expectations in the Chennai tech job market, centered in our Vadapalani training hub. From Hadoop training to AI and Full Stack development, we provide industry-ready expertise.
      </motion.p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
        {/* Connection line for desktop */}
        <div className="hidden lg:block absolute top-[10%] left-[10%] right-[10%] h-[1px] bg-zinc-200 dark:bg-zinc-800 -z-10" />

        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card
                variant="glass"
                hover="lift"
                className="group relative flex flex-col items-center text-center h-full border-zinc-200/50 dark:border-zinc-800/50 p-5 sm:p-6 overflow-hidden"
              >
                {/* Step Number */}
                <div className="absolute top-4 right-6 text-2xl font-black text-zinc-100 dark:text-zinc-900 transition-colors group-hover:text-orange-500/10">
                  {index + 1}
                </div>

                {/* Icon Container - Smaller */}
                <div className={cn(
                  "relative w-12 h-12 flex items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-12",
                  step.color,
                  "text-white mb-6",
                  step.shadow,
                  "shadow-lg"
                )}>
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className={cn(
                  "text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3 transition-colors",
                  step.textColor
                )}>
                  {step.title}
                </h3>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {step.desc}
                </p>

                {/* Bottom Slide Color - NEW EFFECT */}
                <div className={cn(
                  "absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-500 ease-out",
                  step.color
                )} />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Footer for this section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="mt-10 text-center"
      >

      </motion.div>
    </Section>
  );
}
