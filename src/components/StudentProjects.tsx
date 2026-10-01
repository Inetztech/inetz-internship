"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  Zap,
  Cpu,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import {
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiNodedotjs,
  SiMongodb,
  SiPython,
  SiPostgresql,
} from "react-icons/si";
import { Section } from "@/components/ui/Section";
import { Card } from "./ui/Card";

type Project = {
  id: string;
  title: string;
  label: string;
  domain: string;
  desc: string;
  gradient: string;
  icon: any;
  techIcons: any[];
  cardTech: string[];
  accentColor: string;
  borderColor: string;
  image: string;
  modalContent: {
    overview: string;
    challenge: string;
    solution: string;
    features: string[];
    techStack: string[];
    result: string;
    stats: { label: string; value: string }[];
  };
};

const studentProjects: Project[] = [
  {
    id: "01",
    title: "Global Weather App",
    label: "Web Architecture",
    domain: "MERN Stack Development",
    desc: "Build highly scalable production-ready web applications using the popular MERN stack from the ground up.",
    gradient: "from-orange-500/20 to-transparent",
    icon: SiReact,
    techIcons: [SiReact, SiTailwindcss, SiNodedotjs],
    cardTech: ["React & Node.js Core", "MongoDB & Express", "Tailwind CSS Design"],
    accentColor: "text-orange-500",
    borderColor: "group-hover:border-orange-500/50",
    image: "/projects/mern-project.png",
    modalContent: {
      overview: "Comprehensive masterclass on building full-stack applications with MongoDB, Express, React, and Node.js.",
      challenge: "Managing shared state across complex UI components while keeping the server response time under 100ms.",
      solution: "Implemented Redux Toolkit for global state and optimized MongoDB aggregations for fast data retrieval.",
      features: ["Real-time Data Sync", "Advanced JWT Auth", "Dynamic Dashboarding", "Cloud Deployment"],
      techStack: ["React.js", "Node.js", "MongoDB", "Express", "JWT", "Redux"],
      result: "Mastered end-to-end development of modern, highly interactive web platforms.",
      stats: [
        { label: "Performance", value: "98/100" },
        { label: "Stability", value: "99.9%" }
      ]
    }
  },
  {
    id: "02",
    title: "Enterprise Dashboard",
    label: "Enterprise Computing",
    domain: "Java Fullstack Development",
    desc: "Architect robust mission-critical systems & microservices using Java and modern frontend frameworks.",
    gradient: "from-blue-600/20 to-transparent",
    icon: SiPostgresql,
    techIcons: [SiPostgresql, SiNextdotjs],
    cardTech: ["Spring Boot Core", "Microservices Arch", "PostgreSQL Engine"],
    accentColor: "text-blue-500",
    borderColor: "group-hover:border-blue-500/50",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    modalContent: {
      overview: "Advanced training in building secure, distributed enterprise systems with Spring Boot and Java.",
      challenge: "Coordinating data consistency across multiple microservices in a high-concurrency environment.",
      solution: "Adopted SAGA patterns and Kafka messaging for reliable event-driven communication between services.",
      features: ["SAGA Patterns", "Kafka Messaging", "Role-Based RBAC", "Optimized Querying"],
      techStack: ["Java", "Spring Boot", "Hibernate", "React", "PostgreSQL", "Docker"],
      result: "Acquired the skills to lead large-scale backend engineering for financial and corporate tech.",
      stats: [
        { label: "Scale", value: "10k+ Req/s" },
        { label: "Security", value: "Enterprise" }
      ]
    }
  },
  {
    id: "03",
    title: "Premium Portfolio",
    label: "Rapid Innovation",
    domain: "Python Fullstack Development",
    desc: "Harness the power of Python to develop sophisticated web backends and data-driven frontend experiences.",
    gradient: "from-yellow-400/20 to-transparent",
    icon: SiPython,
    techIcons: [SiPython, SiTailwindcss],
    cardTech: ["Django & Flask Hub", "Python Automation", "RESTful API Flow"],
    accentColor: "text-yellow-500",
    borderColor: "group-hover:border-yellow-500/50",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    modalContent: {
      overview: "Deep dive into web development using Django and Flask, combined with modern JavaScript tools.",
      challenge: "Building a flexible CMS that handles dynamic schema changes without database migrations.",
      solution: "Utilized Django's polymorphic models and NoSQL integration for high flexibility.",
      features: ["Polymorphic Models", "NoSQL Integration", "Automated Pipelines", "ML Pre-processing"],
      techStack: ["Python", "Django", "JavaScript", "PostgreSQL", "Redis"],
      result: "Built multiple high-traffic applications with clean, maintainable Pythonic code.",
      stats: [
        { label: "Build Time", value: "-40%" },
        { label: "Efficiency", value: "High" }
      ]
    }
  },
  {
    id: "04",
    title: "Inventory SaaS",
    label: "Backend Architecture",
    domain: "Python Fullstack Development",
    desc: "Master the algorithms behind machine learning, predictive modeling, and AI-driven automation.",
    gradient: "from-blue-500/20 to-transparent",
    icon: SiNodedotjs,
    techIcons: [SiNodedotjs, SiMongodb],
    cardTech: ["Node.js Backend", "MongoDB Schema", "JWT Security"],
    accentColor: "text-blue-500",
    borderColor: "group-hover:border-blue-500/50",
    image: "https://images.unsplash.com/photo-1586769852044-692d6e3703a0?auto=format&fit=crop&q=80&w=1200",
    modalContent: {
      overview: "A robust inventory management system designed for small to medium logistics operations.",
      challenge: "Processing massive real-time datasets and achieving model accuracy above 90% for inventory tasks.",
      solution: "Optimized data processing using asynchronous workers and indexed database queries.",
      features: ["Batch Management", "Real-time Tracking", "Low Stock Alerts", "Invoicing Engine"],
      techStack: ["Node.js", "Express", "MongoDB", "Tailwind"],
      result: "Developed production-ready management systems capable of handling enterprise-scale logistics.",
      stats: [
        { label: "Uptime", value: "100%" },
        { label: "Response", value: "<50ms" }
      ]
    }
  },
  {
    id: "05",
    title: "Predictive Analytics",
    label: "Intelligent Systems",
    domain: "Data Science & AI",
    desc: "Master the algorithms behind machine learning, predictive modeling, and AI-driven automation.",
    gradient: "from-purple-500/20 to-transparent",
    icon: SiPython,
    techIcons: [SiPython, SiNodedotjs],
    cardTech: ["PyTorch & TensorFlow", "Pandas & Numpy", "Predictive ML Tech"],
    accentColor: "text-purple-500",
    borderColor: "group-hover:border-purple-500/50",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=1200",
    modalContent: {
      overview: "Focus on statistical modeling, neural networks, and deploying models to production environments.",
      challenge: "Processing massive real-time datasets and achieving model accuracy above 90% for predictive tasks.",
      solution: "Optimized model training using GPU acceleration and ensemble learning techniques.",
      features: ["Neural Networks", "NLP Processing", "Big Data Cleaning", "Model Versioning"],
      techStack: ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "FastAPI"],
      result: "Developed production-ready models capable of handling enterprise-scale data analysis.",
      stats: [
        { label: "Accuracy", value: "94.2%" },
        { label: "Data Cap", value: "1TB+" }
      ]
    }
  },
  {
    id: "06",
    title: "EMS Institution",
    label: "Industrial Infrastructure",
    domain: "Embedded Systems",
    desc: "Develop low-level software that bridges hardware and code, powering next-gen smart devices and IoT.",
    gradient: "from-teal-500/20 to-transparent",
    icon: Cpu,
    techIcons: [Cpu, Zap],
    cardTech: ["Arduino / ESP32 Core", "C++ / Embedded C", "MQTT & IoT Protocols"],
    accentColor: "text-teal-500",
    borderColor: "group-hover:border-teal-500/50",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
    modalContent: {
      overview: "An institution management system designed for high-performance and scalability.",
      challenge: "Synthesizing contradictory data sources into a single, unified executive dashboard.",
      solution: "Built robust ETL pipelines and used advanced DAX patterns for dynamic visualization.",
      features: ["Attendance Suite", "Grade Portal", "RBAC System", "Event Timeline"],
      techStack: ["PostgreSQL", "React", "NestJS", "Tailwind"],
      result: "Enabled data-driven decision making for industrial partners through automated management tools.",
      stats: [
        { label: "Latency", value: "Real-time" },
        { label: "Uptime", value: "99.9%" }
      ]
    }
  },
]; export default function StudentProjects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  } as const;

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  } as const;

  return (
    <Section className="bg-zinc-50 dark:bg-zinc-950 py-24 transition-colors overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header - Centered Style */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4"
            >
              Build Showcase
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl text-zinc-900 dark:text-zinc-100 leading-[1.1]"
            >
              Industrial <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-sky-500">Benchmarks.</span>
            </motion.h2>
          </div>
          <div className="max-w-2xl mt-6">
            <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Explore production-ready systems engineered with modern
              microservices and cloud-native patterns.
            </p>
          </div>
        </div>

        {/* 3-Column Grid */}
        <motion.div
          variants={containerVars}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {studentProjects.slice(0, 3).map((project) => (
            <motion.div
              key={project.id}
              variants={itemVars}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <Card className="h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-2xl overflow-hidden p-0 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5">

                {/* Visual Area */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={project.image}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

                  {/* Floating Icons */}
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    {project.techIcons.map((Icon, i) => (
                      <div key={i} className="h-8 w-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80">
                        <Icon size={14} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      {project.domain.split(' ')[0]} / {project.id}
                    </span>
                    <Layers size={14} className="text-zinc-300" />
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2 group-hover:text-emerald-500 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 font-medium mb-6">
                    {project.desc}
                  </p>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Production Ready</span>
                    </div>
                    <ArrowUpRight size={16} className="text-zinc-300 group-hover:text-emerald-500 transition-all" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="md:w-5/12 relative hidden md:block bg-zinc-900">
                <Image src={selectedProject.image} fill sizes="50vw" className="object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedProject.modalContent.stats.map((s, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-xl font-bold text-white">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:w-7/12 p-10 md:p-14 overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mb-2">Technical Analysis</p>
                    <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
                      {selectedProject.title}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2"><Shield size={14} /> Challenge</h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{selectedProject.modalContent.challenge}</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2"><Zap size={14} /> Solution</h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{selectedProject.modalContent.solution}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Primary Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.modalContent.techStack.map((t, i) => (
                        <span key={i} className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-200/50 dark:border-zinc-700/50">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
