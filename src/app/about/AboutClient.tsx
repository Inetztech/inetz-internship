"use client";

import { motion } from "framer-motion";
import {
  Users,
  Target,
  BookOpen,
  Rocket,
  Code2,
  Laptop,
  Sparkles,
  ArrowRight,
  Layers
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Counter } from "@/components/ui/Counter";

export default function AboutPage() {
  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Curriculum",
      desc: "Stay ahead with our up-to-date and industry-relevant courses designed by tech veterans.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      timelineConfig: {
        dotBorder: "border-emerald-400",
        dotShadow: "shadow-[0_0_20px_rgba(52,211,153,0.6)]",
        lineBorder: "border-emerald-500/40",
        hoverBorder: "hover:border-emerald-500/50",
        groupHoverBorder: "group-hover:border-emerald-500/30",
        groupHoverShadow: "group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]",
        textColor: "text-emerald-600 dark:text-emerald-400",
        groupHoverText: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
        hoverGlow: "from-emerald-500/5",
      }
    },
    {
      icon: Users,
      title: "Experienced Instructors",
      desc: "Learn from seasoned professionals who bring real-world experience and professional advice.",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      timelineConfig: {
        dotBorder: "border-blue-400",
        dotShadow: "shadow-[0_0_20px_rgba(59,130,246,0.6)]",
        lineBorder: "border-blue-500/40",
        hoverBorder: "hover:border-blue-500/50",
        groupHoverBorder: "group-hover:border-blue-500/30",
        groupHoverShadow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
        textColor: "text-blue-600 dark:text-blue-400",
        groupHoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
        hoverGlow: "from-blue-500/5",
      }
    },
    {
      icon: Laptop,
      title: "Flexible Learning",
      desc: "Convenience of both online and offline classes tailored to fit your professional schedule.",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      timelineConfig: {
        dotBorder: "border-purple-400",
        dotShadow: "shadow-[0_0_20px_rgba(168,85,247,0.6)]",
        lineBorder: "border-purple-500/40",
        hoverBorder: "hover:border-purple-500/50",
        groupHoverBorder: "group-hover:border-purple-500/30",
        groupHoverShadow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
        textColor: "text-purple-600 dark:text-purple-400",
        groupHoverText: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
        hoverGlow: "from-purple-500/5",
      }
    },
    {
      icon: Code2,
      title: "Real World Projects",
      desc: "Gain hands-on experience with 5 mini applications and 2 major industrial applications.",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      timelineConfig: {
        dotBorder: "border-orange-400",
        dotShadow: "shadow-[0_0_20px_rgba(249,115,22,0.6)]",
        lineBorder: "border-orange-500/40",
        hoverBorder: "hover:border-orange-500/50",
        groupHoverBorder: "group-hover:border-orange-500/30",
        groupHoverShadow: "group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]",
        textColor: "text-orange-600 dark:text-orange-400",
        groupHoverText: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
        hoverGlow: "from-orange-500/5",
      }
    },
    {
      icon: Rocket,
      title: "Career Support",
      desc: "Dedicated services including professional resume building and intensive job placement assistance.",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      timelineConfig: {
        dotBorder: "border-rose-400",
        dotShadow: "shadow-[0_0_20px_rgba(244,63,94,0.6)]",
        lineBorder: "border-rose-500/40",
        hoverBorder: "hover:border-rose-500/50",
        groupHoverBorder: "group-hover:border-rose-500/30",
        groupHoverShadow: "group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]",
        textColor: "text-rose-600 dark:text-rose-400",
        groupHoverText: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
        hoverGlow: "from-rose-500/5",
      }
    },
    {
      icon: Sparkles,
      title: "Placement Assistance",
      desc: "Personalized guidance ensuring you find the perfect job fit in top tier IT companies.",
      color: "text-teal-500",
      bg: "bg-teal-500/10",
      timelineConfig: {
        dotBorder: "border-teal-400",
        dotShadow: "shadow-[0_0_20px_rgba(20,184,166,0.6)]",
        lineBorder: "border-teal-500/40",
        hoverBorder: "hover:border-teal-500/50",
        groupHoverBorder: "group-hover:border-teal-500/30",
        groupHoverShadow: "group-hover:shadow-[0_0_20px_rgba(20,184,166,0.15)]",
        textColor: "text-teal-600 dark:text-teal-400",
        groupHoverText: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
        hoverGlow: "from-teal-500/5",
      }
    }
  ];

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">

      {/* ─── HERO SECTION - REDUCED TOP PADDING ─── */}
      <section className="relative pt-8 pb-16 md:pt-12 md:pb-24 bg-white dark:bg-zinc-950 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            <div className="w-full lg:w-1/2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
                  Best Software Training &
                  <span className="text-emerald-600 dark:text-emerald-500"> Internship in Chennai</span>
                </h1>

                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                  Inetz Technologies is Chennai's premier software training  and internship provider.
                  We offer industry-aligned programs in MERN Stack, Java Full Stack, Python, and AI/ML,
                  designed to bridge the gap between academic education and corporate expectations.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
                    Explore Programs
                  </button>
                  <button className="px-8 py-4 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                    Learn More
                  </button>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full -z-10" />
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100">
                  <img
                    src="/about.jpeg"
                    alt="Professional Software Training"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS OVERLAP - ADJUSTED MARGIN ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 md:p-10 rounded-[2.5rem] bg-white/75 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden">
          {[
            { label: "Students Placed", val: 500, suffix: "+" },
            { label: "Successful Alumni", val: 5000, suffix: "+" },
            { label: "Project Focus", val: 100, suffix: "%" },
            { label: "Trust Score", val: 4.9, suffix: "/5" }
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 hover:scale-105 transition-transform">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                <Counter to={stat.val} />{stat.suffix}
              </div>
              <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── THE STORY SECTION ─── */}
      <Section className="py-24 bg-white dark:bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full" />
              <div className="relative rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-square lg:aspect-[4/5] group">
                <img
                  src="/office.png"
                  alt="Inetz Technologies HQ"
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <div className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs mb-2">Established 2016</div>
                  <h3 className="text-white text-3xl font-bold">Vadapalani, Chennai</h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 tracking-tight">
                Empowering the Next Generation of <br />
                <span className="text-emerald-500">Tech Professionals in Chennai</span>
              </h2>
              <div className="space-y-6 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                <p>
                  At <span className="text-zinc-900 dark:text-white font-bold">Inetz Technologies</span>, we believe that software education is most effective when it mirrors reality. Founded by industry veterans, our Chennai-based training center was established to solve the critical skill gap between academic graduates and industry expectations.
                </p>
                <p>
                  Located in the vibrant tech hub of <span className="text-emerald-500 font-bold">Vadapalani, Chennai</span>, we provide a premium, boutique learning environment. Our students are trained like software associates, working on live projects and mastering modern tech stacks that are in high demand across the globe.
                </p>
                <p>
                  Our unique approach combines rigorous internship training with personalized mentorship, ensuring that every student who completes our programs walks away with a powerful portfolio and the confidence to excel in top-tier product and service companies.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ─── THE METHODOLOGY SECTION ─── */}
      <Section className="py-24 bg-white dark:bg-[#09090b] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            The Inetz Way
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 tracking-tight">
            Building Engineers, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">Not Just Coders</span>
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
            Our specialized methodology is designed to simulate a high-growth startup environment. We don't teach from books; we build from tickets.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Architecture First", desc: "Learn to design scalable systems and data models before writing a single line of code.", icon: Layers },
            { title: "Task-Driven Learning", desc: "Every concept is taught through a real-world task derived from actual industry scenarios.", icon: Target },
            { title: "Elite Code Review", desc: "Your code is reviewed by senior engineers to ensure it meets production-level standards.", icon: Code2 },
            { title: "Cloud & Deployment", desc: "Go beyond 'localhost'. Learn to ship, scale, and monitor applications in the real world.", icon: Rocket }
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-600/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-950 flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all shadow-sm">
                <m.icon className="h-7 w-7 text-emerald-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-emerald-500 transition-colors">{m.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ─── MASTER EVERY SKILL TIMELINE ─── */}
      <Section className="py-24 relative bg-zinc-50 dark:bg-zinc-950 overflow-hidden isolate">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="text-center mb-24 relative z-10">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl text-zinc-900 dark:text-zinc-100 mb-6">Master Every Skill</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-sm leading-6 font-medium uppercase tracking-widest">The gold standard in tech education and aspiring developer growth.</p>
        </div>

        <div className="relative max-w-5xl mx-auto z-10 flex flex-col gap-16 md:gap-8">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent md:-translate-x-1/2 pointer-events-none" />
          {features.map((feature, i) => {
            const isEven = i % 2 === 0;
            const t = feature.timelineConfig;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isEven ? -40 : 40, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                className="relative flex flex-col md:flex-row md:items-center w-full min-h-[140px]"
              >
                <div className={`absolute left-6 md:left-1/2 top-8 md:top-1/2 w-4 h-4 rounded-full bg-zinc-950 border-[2px] ${t.dotBorder} transform -translate-x-[7px] md:-translate-x-1/2 md:-translate-y-1/2 z-20 ${t.dotShadow}`} />
                {isEven ? (
                  <>
                    <div className="w-full md:w-[45%] pl-16 md:pl-0 z-10 box-border md:pr-6">
                      <div className={`group relative p-6 md:p-8 rounded-[2.5rem] bg-white dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl ${t.hoverBorder} transition-all duration-300`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${t.hoverGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none`} />
                        <div className="flex items-start gap-5 relative z-10">
                          <div className={`shrink-0 w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center ${t.groupHoverBorder} transition-all`}>
                            <span className={`text-xl font-semibold tracking-tight ${t.textColor}`}>{(i + 1).toString().padStart(2, '0')}</span>
                          </div>
                          <div className="flex flex-col gap-2 pt-1 text-left">
                            <h4 className={`text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 ${t.groupHoverText} transition-colors`}>{feature.title}</h4>
                            <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed font-medium">{feature.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`hidden md:block w-[5%] h-[2px] border-b-[2px] border-dashed ${t.lineBorder} shrink-0 opacity-60`} />
                    <div className="hidden md:block md:w-[50%]" />
                  </>
                ) : (
                  <>
                    <div className="hidden md:block md:w-[50%]" />
                    <div className={`hidden md:block w-[5%] h-[2px] border-b-[2px] border-dashed ${t.lineBorder} shrink-0 opacity-60 z-10`} />
                    <div className="w-full md:w-[45%] pl-16 md:pl-6 z-10 box-border">
                      <div className={`group relative p-6 md:p-8 rounded-[2.5rem] bg-white dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl ${t.hoverBorder} transition-all duration-300`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${t.hoverGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none`} />
                        <div className="flex items-start gap-5 relative z-10">
                          <div className={`shrink-0 w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center ${t.groupHoverBorder} transition-all`}>
                            <feature.icon className={`w-6 h-6 ${t.textColor}`} />
                          </div>
                          <div className="flex flex-col gap-2 pt-1 text-left">
                            <h4 className={`text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 ${t.groupHoverText} transition-colors`}>{feature.title}</h4>
                            <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed font-medium">{feature.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* ─── LEADERSHIP SECTION ─── */}
      <Section className="py-32 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 tracking-tight">
              Guided by <span className="text-orange-500">Industry Veterans</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { name: "Senthil Kumar", role: "Founder & CEO",  img: "/staffs/senthilkumar.jpg" },
              { name: "Vigneshwaran", role: "Industry Expert",  img: "/staffs/vigneshwaran.jpg" },
              { name: "Amal", role: "Java Full Stack Trainer",  img: "/staffs/amal.jpeg" },
              { name: "Preethi", role: "Front End Trainer",  img: "/staffs/preethi.png" },
              { name: "Aravind", role: "Mern Stack Trainer",  img: "/staffs/aravindh.png" },
              { name: "Boomika", role: "Java Full Stack Trainer", img: "/staffs/boomika.png" },
              { name: "Dhanalakshmi", role: "Data Analytics Trainer",  img: "/staffs/sridhanalakshmi.png" },
              { name: "Naresh", role: "Mern Stack Trainer", img: "/staffs/Naresh.png" },
              { name: "Anbarasan", role: "Java Developer", img: "/staffs/anbu.png" },
              { name: "Esther Rassou", role: "Data Analytics Trainer", img: "/staffs/Esther.png.jpeg" }
            ].map((member, i) => (
              <motion.div key={i} className="group relative">
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl relative">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  <div className="absolute bottom-8 left-8 right-8">                    
                    <h3 className="text-white text-lg font-bold mb-1">{member.name}</h3>
                    <p className="text-zinc-300 text-xs font-medium">{member.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── CALL TO ACTION ─── */}
      <section className="py-24 relative overflow-hidden bg-emerald-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10 text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Accelerate Your Career?</h2>
          <p className="text-xl opacity-80 mb-12">Join a boutique learning experience that puts you in the driver's seat of your future.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="px-10 py-5 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-400 text-white font-black text-xl flex items-center gap-3 transition-transform hover:scale-105 hover:shadow-[0_10px_40px_rgba(234,88,12,0.4)]">
              Enroll Now <ArrowRight className="h-6 w-6" />
            </button>
            <button className="px-10 py-5 rounded-2xl bg-white/10 text-white font-bold text-xl border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all">
              Speak with a Mentor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
