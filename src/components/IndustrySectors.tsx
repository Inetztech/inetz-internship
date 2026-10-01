"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  Building2,
  Zap,
  TrendingUp,
  Map,
  Lock as LucideLock,
} from "lucide-react";
import {
  SiGoogle,
  SiAtlassian,
  SiUber,
  SiMeta,
  SiOpenai,
  SiNvidia,
  SiIntel,
  SiSiemens,
  SiQualcomm,
  SiStripe,
  SiPostman,
  SiAccenture,
  SiCloudflare,
  SiTerraform,
  SiKubernetes,
  SiDocker,
  SiCisco,
  SiShopify,
  SiTarget,
  SiWalmart
} from "react-icons/si";
import { FaAws, FaMicrosoft, FaShieldAlt } from "react-icons/fa";

type Sector = {
  title: string;
  label: string;
  image: string;
  desc: string;
  highlight: string;
  badge: string;
  modalContent: {
    about: string;
    companies: { name: string; icon: any; domain?: string }[];
    surviving: string;
    growth: string;
    pathway: string[];
  };
};

const sectors: Sector[] = [
  {
    title: "Product\nCompanies",
    label: "Top-Tier Products",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000",
    desc: "Work at cutting-edge product-based companies as a Software Developer, building real-world applications at scale.",
    highlight: "500+ alumni placed",
    badge: "Most Placed",
    modalContent: {
      about: "Product companies focus on building software solutions, platforms, and applications that scale to millions of users. The work involves deep problem-solving, system design, and continuous iteration.",
      companies: [
        { name: "Google", icon: SiGoogle, domain: "google.com" },
        { name: "Microsoft", icon: FaMicrosoft, domain: "microsoft.com" },
        { name: "Amazon", icon: FaAws, domain: "amazon.com" },
        { name: "Atlassian", icon: SiAtlassian, domain: "atlassian.com" },
        { name: "Uber", icon: SiUber, domain: "uber.com" },
        { name: "Meta", icon: SiMeta, domain: "meta.com" }
      ],
      surviving: "Focus heavily on Data Structures & Algorithms, System Design, and writing highly optimized code. You must understand the product lifecycle.",
      growth: "A+",
      pathway: ["SDE I (Junior)", "SDE II (Mid-Level)", "Senior Engineer", "Staff Engineer"]
    }
  },
  {
    title: "IT Services &\nMNCS",
    label: "Enterprise IT",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000",
    desc: "Join top IT service companies delivering technology solutions across banking, retail, and enterprise clients globally.",
    highlight: "Leading MNC placements",
    badge: "High Demand",
    modalContent: {
      about: "IT Services and Consulting firms provide technology solutions to other businesses. They handle diverse, large-scale projects across domains like banking and healthcare.",
      companies: [
        { name: "Accenture", icon: SiAccenture, domain: "accenture.com" },
        { name: "TCS", icon: Building2, domain: "tcs.com" },
        { name: "Infosys", icon: Building2, domain: "infosys.com" },
        { name: "Capgemini", icon: Building2, domain: "capgemini.com" },
        { name: "Cognizant", icon: Building2, domain: "cognizant.com" }
      ],
      surviving: "Adaptability is key. Learn new tech stacks quickly as client projects demand. Strong communication skills are vital for success.",
      growth: "B+",
      pathway: ["Assoc. Engineer", "System Engineer", "Technology Analyst", "Solution Architect"]
    }
  },
  {
    title: "AI & Data\nScience",
    label: "Future of Tech",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=1000",
    desc: "Step into the fast-growing AI, ML and Data Analytics space. Work on real datasets and intelligent systems.",
    highlight: "Highest salary bracket",
    badge: "Trending",
    modalContent: {
      about: "This industry leverages data to predict trends, build generative models, and automate complex decisions. High focus on mathematics and logic.",
      companies: [
        { name: "OpenAI", icon: SiOpenai, domain: "openai.com" },
        { name: "NVIDIA", icon: SiNvidia, domain: "nvidia.com" },
        { name: "DeepMind", icon: SiGoogle, domain: "deepmind.google" },
        { name: "Anthropic", icon: Building2, domain: "anthropic.ai" }
      ],
      surviving: "Master Python and Statistics. Keep up with rapidly evolving research papers and master frameworks like PyTorch.",
      growth: "Exponential",
      pathway: ["Data Analyst", "Applied Scientist", "ML Engineer", "Head of AI"]
    }
  },
  {
    title: "FinTech &\nStartups",
    label: "Fast Growth",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1000",
    desc: "Accelerate your career at innovative startups and fintech companies where you own features end-to-end from day one.",
    highlight: "Equity & growth roles",
    badge: "Hot Sector",
    modalContent: {
      about: "Startups operate at blistering speeds. You will wear multiple hats, push code daily, and work directly with founders.",
      companies: [
        { name: "Stripe", icon: SiStripe, domain: "stripe.com" },
        { name: "Razorpay", icon: Building2, domain: "razorpay.com" },
        { name: "Postman", icon: SiPostman, domain: "postman.com" },
        { name: "Zerodha", icon: Building2, domain: "zerodha.com" }
      ],
      surviving: "Extreme ownership is required. Move fast, break things, and fix them faster. Product thinking is just as important as code.",
      growth: "High",
      pathway: ["Founding Engineer", "Tech Lead", "VP Engineering", "CTO"]
    }
  },
  {
    title: "Embedded &\nIoT",
    label: "Hardware Meets Code",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000",
    desc: "Build the future of smart devices. Work on microcontrollers, real-time systems, and industrial IoT applications.",
    highlight: "Niche, high-demand roles",
    badge: "Specialized",
    modalContent: {
      about: "Programming hardware directly. From consumer smart appliances to industrial robotics, you work at the hardware-software junction.",
      companies: [
        { name: "Intel", icon: SiIntel, domain: "intel.com" },
        { name: "Qualcomm", icon: SiQualcomm, domain: "qualcomm.com" },
        { name: "NVIDIA", icon: SiNvidia, domain: "nvidia.com" },
        { name: "Siemens", icon: SiSiemens, domain: "siemens.com" }
      ],
      surviving: "Master C, C++, and Rust. Understand memory management intrinsically. Optimized, bug-free code is non-negotiable.",
      growth: "Moderate",
      pathway: ["Firmware Engineer", "Embedded Systems Dev", "IoT Architect", "Systems Lead"]
    }
  },
  {
    title: "Cybersecurity & Trust",
    label: "Digital Ethics",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000",
    desc: "Protect global networks and sensitive data. Build impenetrable security systems and defend against evolving cyber threats.",
    highlight: "Critical Infrastructure roles",
    badge: "Essential",
    modalContent: {
      about: "Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. It ensures confidentiality, integrity, and availability of data.",
      companies: [
        { name: "Cisco", icon: SiCisco, domain: "cisco.com" },
        { name: "Cloudflare", icon: SiCloudflare, domain: "cloudflare.com" },
        { name: "CrowdStrike", icon: FaShieldAlt, domain: "crowdstrike.com" },
        { name: "Palo Alto", icon: LucideLock, domain: "paloaltonetworks.com" }
      ],
      surviving: "Master Networking, Linux, and Pen-Testing. Deep understanding of encryption and security protocols is mandatory.",
      growth: "High",
      pathway: ["Security Analyst", "Penetration Tester", "Security Architect", "CISO"]
    }
  },
  {
    title: "Cloud & Infrastructure",
    label: "Scalability at Core",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
    desc: "Architect the backbone of the modern web. Manage distributed systems and scale applications to serve millions globally.",
    highlight: "DevOps & SRE specialization",
    badge: "Infrastructure",
    modalContent: {
      about: "Cloud computing provides on-demand delivery of IT resources over the internet. Infrastructure engineers build the tools that keep the web running.",
      companies: [
        { name: "AWS", icon: FaAws, domain: "aws.amazon.com" },
        { name: "Terraform", icon: SiTerraform, domain: "hashicorp.com" },
        { name: "Kubernetes", icon: SiKubernetes, domain: "kubernetes.io" },
        { name: "Docker", icon: SiDocker, domain: "docker.com" }
      ],
      surviving: "Learn IaC (Infrastructure as Code) and containerization. Master at least one major cloud provider (AWS/Azure/GCP).",
      growth: "Stable",
      pathway: ["Cloud Engineer", "DevOps Engineer", "SRE (Site Reliability)", "Infrastructure Lead"]
    }
  },
  {
    title: "Retail Tech & E-commerce",
    label: "Consumer Scale",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000",
    desc: "Revolutionize the way the world shops. Build high-performance e-commerce engines and intelligent supply chain systems.",
    highlight: "Massive scale experience",
    badge: "Consumer",
    modalContent: {
      about: "E-commerce technology involves building the platforms, payment gateways, and logistics systems that power global trade.",
      companies: [
        { name: "Amazon", icon: FaAws, domain: "amazon.jobs" },
        { name: "Shopify", icon: SiShopify, domain: "shopify.engineering" },
        { name: "Target", icon: SiTarget, domain: "target.com" },
        { name: "Walmart", icon: SiWalmart, domain: "walmart.org" }
      ],
      surviving: "Focus on latency, high availability, and real-time inventory management. Distributed caching and database optimization are key.",
      growth: "Steady",
      pathway: ["Fullstack Dev", "Backend Specialist", "Lead architect", "Director of Eng"]
    }
  },
];

export default function IndustrySectors() {
  const [active, setActive] = useState<number | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<Sector | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -380 : 380,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-zinc-50 dark:bg-zinc-950 py-24 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col gap-6 mb-14">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              Where Our Students Work
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl text-zinc-900 dark:text-zinc-100 mb-4"
            >
              High-Growth <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-sky-500">Tech Job Sectors</span>
            </motion.h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium max-w-2xl">
              Our internship training in Chennai prepares you for elite roles across these high-impact industries.
              Explore career guides for the most in-demand tech sectors today.
            </p>
            <div className="flex gap-4 shrink-0">
              <button
                onClick={() => scroll("left")}
                className="h-12 w-12 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-emerald-500 transition-all text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="h-12 w-12 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-emerald-500 transition-all text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar"
        >
          {sectors.map((sector, i) => {
            const isActive = active === i;
            return (
              <motion.div
                key={i}
                layout
                onClick={() => setActive(isActive ? null : i)}
                animate={{
                  width: isActive ? (isMobile ? "90vw" : 520) : (isMobile ? "70vw" : 270),
                  minWidth: isActive ? (isMobile ? "90vw" : 520) : (isMobile ? "70vw" : 270)
                }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                className="relative rounded-3xl overflow-hidden cursor-pointer snap-start shrink-0 select-none group"
                style={{ height: isMobile ? 320 : 380 }}
              >
                <Image
                  src={sector.image}
                  alt={sector.title}
                  draggable={false}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover transition-transform duration-700 ${isActive ? "scale-110" : "group-hover:scale-105"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                <div className="absolute top-5 left-5 z-10">
                  <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                    {sector.badge}
                  </span>
                </div>

                <AnimatePresence>
                  {!isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-0 left-0 right-0 p-7 pointer-events-none"
                    >
                      <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                        {sector.label}
                      </p>
                      <h3 className="text-white font-bold text-2xl leading-[0.95] uppercase tracking-tight whitespace-pre-line min-h-[46px] flex flex-col justify-start">
                        {sector.title}
                      </h3>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-4"
                    >
                      <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        {sector.label}
                      </span>
                      <h3 className="text-white font-black text-3xl leading-[1.1] uppercase tracking-tighter whitespace-pre-line">
                        {sector.title}
                      </h3>
                      <p className="text-zinc-300 text-sm leading-relaxed max-w-sm font-medium">
                        {sector.desc}
                      </p>
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">
                          ✦ {sector.highlight}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIndustry(sector);
                          }}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase transition-all hover:bg-emerald-400 shadow-lg"
                        >
                          Explore Guide <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modern Professional Strategy Modal */}
      <AnimatePresence>
        {selectedIndustry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-zinc-950/40 backdrop-blur-xl"
            onClick={() => setSelectedIndustry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col md:flex-row"
            >
              {/* Left Side - Visual Hero (Mobile Hidden or Top) */}
              <div className="relative w-full md:w-2/5 h-48 md:h-auto shrink-0 overflow-hidden">
                <Image
                  src={selectedIndustry.image}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  alt={selectedIndustry.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-900 via-zinc-900/40 to-transparent" />

                <div className="absolute inset-0 p-8 flex flex-col justify-end md:justify-start gap-2">
                  <div className="inline-flex w-fit px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/30">
                    {selectedIndustry.label}
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black text-white leading-[0.9] uppercase tracking-tighter mt-2">
                    {selectedIndustry.title.split(' ').map((word, i) => (
                      <span key={i} className="block">{word}</span>
                    ))}
                  </h3>

                  <div className="mt-8 hidden md:block space-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Market Growth</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                        <span className="text-xl font-black text-emerald-500">{selectedIndustry.modalContent.growth}</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Core Opportunities</p>
                      <div className="flex flex-wrap gap-2">
                        {['High Scale', 'Innovation', 'Mentorship'].map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-zinc-300 uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedIndustry(null)}
                  className="absolute top-6 right-6 md:hidden w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Right Side - Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-zinc-50 dark:bg-zinc-900/50">
                <button
                  onClick={() => setSelectedIndustry(null)}
                  className="hidden md:flex absolute top-8 right-8 w-12 h-12 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 transition-all items-center justify-center z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="max-w-2xl mx-auto space-y-12">
                  {/* Executive Overview */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">Sector Analysis</h4>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg font-medium">
                      {selectedIndustry.modalContent.about}
                    </p>
                  </section>

                  {/* Getting In - Strategy */}
                  <section className="bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Zap className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Prep Strategy
                      </h4>
                      <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-bold">
                        {selectedIndustry.modalContent.surviving}
                      </p>
                    </div>
                  </section>

                  {/* Industry Partners & Roadmap Grid */}
                  <div className="grid md:grid-cols-2 gap-10">
                    <section>
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5" /> Hiring Partners
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedIndustry.modalContent.companies.map((company, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 group hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                                {company.icon ? <company.icon className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500" /> : <Building2 className="w-4 h-4 text-zinc-400" />}
                              </div>
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">{company.name}</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Map className="w-3.5 h-3.5" /> Career Path
                      </h4>
                      <div className="space-y-3">
                        {selectedIndustry.modalContent.pathway.map((step, i) => (
                          <div key={i} className="relative flex items-center gap-4 group">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0 relative z-10 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                              {i + 1}
                            </div>
                            {i !== selectedIndustry.modalContent.pathway.length - 1 && (
                              <div className="absolute left-3 top-6 bottom-[-12px] w-px bg-zinc-200 dark:bg-zinc-800" />
                            )}
                            <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">{step}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-4">
                    <button className="w-full py-5 rounded-2xl bg-zinc-900 dark:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-2 group">
                      Get Expert Career Advice <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
