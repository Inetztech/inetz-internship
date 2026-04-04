"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LogIn, ChevronDown, Sparkles, Code, Terminal, Brain, Cpu, Database, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Image from "next/image";

const programs = [
  { 
    title: "MERN Stack Development", 
    href: "/programs", 
    desc: "React, Node, Express & MongoDB",
    icon: Code,
    color: "text-orange-500"
  },
  { 
    title: "Java Fullstack Development", 
    href: "/programs", 
    desc: "Enterprise apps with Spring Boot",
    icon: Terminal,
    color: "text-blue-500"
  },
  { 
    title: "Python Fullstack Development", 
    href: "/programs", 
    desc: "Web apps with Django & Flask",
    icon: Database,
    color: "text-yellow-500"
  },
  { 
    title: "Data Science & AI", 
    href: "/programs", 
    desc: "AI, ML and Data Modeling",
    icon: Brain,
    color: "text-purple-500"
  },
  { 
    title: "Embedded Systems", 
    href: "/programs", 
    desc: "IoT & Real-time Systems",
    icon: Cpu,
    color: "text-teal-500"
  },
  { 
    title: "Data Analytics", 
    href: "/programs", 
    desc: "Business insights and visualization",
    icon: Sparkles,
    color: "text-sky-500"
  },
];

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs", subItems: programs },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

function InetzLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-12 w-44 flex items-center group", className)}>
      <Image 
        src="/logo.png" 
        alt="Inetz Technologies Logo" 
        fill
        className="object-contain transition-transform group-hover:scale-105"
        priority
      />
    </div>
  );
}

// function ThemeToggle() {
//   const { resolvedTheme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   if (!mounted) return <div className="w-10 h-10" />;

//   const isDark = resolvedTheme === "dark";

//   return (
//     <Button
//       variant="ghost"
//       size="sm"
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       className="p-2 w-10 h-10 rounded-full"
//       aria-label="Toggle theme"
//     >
//       <motion.div
//         initial={false}
//         animate={{ rotate: isDark ? 90 : 0, scale: [0.8, 1] }}
//         transition={{ type: "spring", stiffness: 200, damping: 10 }}
//       >
//         {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
//       </motion.div>
//     </Button>
//   );
// }

// 2. Main Navbar Component
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileSubOpen, setIsMobileSubOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUser(data.user);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsLoggedIn(false);
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const activeHref = useMemo(() => {
    const exact = navItems.find((i) => i.href === pathname)?.href;
    if (exact) return exact;
    return navItems.find((i) => pathname?.startsWith(i.href) && i.href !== "/")?.href;
  }, [pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSubOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-zinc-100/50 bg-white/70 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/70">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <InetzLogo />
        </Link>
 
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 lg:flex p-1 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-full border border-zinc-100/50 dark:border-zinc-800/50">
          {navItems.map((item) => {
            const isActive = item.href === activeHref;
            const hasSubmenu = "subItems" in item;

            return (
              <div 
                key={item.href}
                className="relative group"
                onMouseEnter={() => hasSubmenu && setActiveDropdown(item.label)}
                onMouseLeave={() => hasSubmenu && setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1 rounded-full px-6 py-2 text-sm font-bold transition-all duration-300",
                    isActive
                      ? "text-white dark:text-zinc-900"
                      : "text-zinc-500 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400",
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-orange-500 dark:bg-orange-500 rounded-full -z-10 shadow-lg shadow-orange-500/20"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  {item.label}
                  {hasSubmenu && <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", activeDropdown === item.label && "rotate-180")} />}
                </Link>

                {/* Dropdown Menu */}
                {hasSubmenu && (
                  <AnimatePresence>
                    {activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                      >
                        <div className="w-[600px] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl p-6 grid grid-cols-2 gap-4 backdrop-blur-xl">
                          {item.subItems?.map((sub) => (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              className="flex items-start gap-4 p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group/sub"
                            >
                              <div className={cn("p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover/sub:bg-white dark:group-hover/sub:bg-zinc-700 transition-colors shadow-sm", sub.color)}>
                                <sub.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover/sub:text-orange-500 transition-colors">
                                  {sub.title}
                                </h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                                  {sub.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
          {isLoggedIn && (
            <Link 
              href="/dashboard" 
              className={cn(
                "px-6 py-2 text-sm font-bold transition-all duration-300",
                pathname === "/dashboard" ? "text-orange-500" : "text-zinc-500 hover:text-orange-500"
              )}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* <ThemeToggle /> */}
          <div className="hidden sm:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Button href="/login" variant="ghost" size="sm" className="font-semibold">
                  Login
                </Button>
                <Button href="/register" variant="primary" size="sm" className="px-6 rounded-full font-bold shadow-lg shadow-orange-500/20">
                  Register
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                   <User className="w-5 h-5" />
                </div>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full font-bold border-zinc-200 dark:border-zinc-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 rounded-full h-10 w-10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => {
                const isActive = item.href === activeHref;
                const hasSubmenu = "subItems" in item;

                return (
                  <div key={item.href}>
                    <div
                      role="button"
                      onClick={() => hasSubmenu ? setIsMobileSubOpen(!isMobileSubOpen) : null}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl text-lg font-semibold transition-all",
                        isActive && !hasSubmenu
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      )}
                    >
                      {hasSubmenu ? (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.label}</span>
                          <ChevronDown className={cn("h-5 w-5 transition-transform", isMobileSubOpen && "rotate-180")} />
                        </div>
                      ) : (
                        <Link href={item.href} className="flex-1">{item.label}</Link>
                      )}
                      {isActive && !hasSubmenu && <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 rounded-full bg-orange-500" />}
                    </div>
                    
                    {hasSubmenu && (
                      <AnimatePresence>
                        {isMobileSubOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 pr-2 pb-2 flex flex-col gap-1"
                          >
                            {item.subItems?.map((sub) => (
                              <Link
                                key={sub.title}
                                href={sub.href}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                              >
                                <sub.icon className={cn("h-4 w-4", sub.color)} />
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{sub.title}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}

              {isLoggedIn && (
                <Link href="/dashboard" className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20">
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
              )}
              
              <div className="grid grid-cols-1 gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                {!isLoggedIn ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button href="/login" variant="outline" size="lg" className="rounded-2xl">
                      Login
                    </Button>
                    <Button href="/register" variant="primary" size="lg" className="rounded-2xl">
                      Register
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleLogout} variant="primary" size="lg" className="rounded-2xl bg-red-600 hover:bg-red-700 border-none">
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}