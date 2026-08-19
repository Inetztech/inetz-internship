"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, User, ShieldCheck, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  // { href: "/hire-from-us", label: "Hire From Us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

function InetzLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-14 w-45 flex items-center group", className)}>
      <Image
        src="/Inetz-logo-removebg1.png"
        alt="Inetz Technologies Logo" 
        fill
        className="object-contain transition-transform group-hover:scale-105"
        priority
      />
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const user = session?.user as any; 

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleRegisterClick = () => {
    if (isLoggedIn) {
      router.push("/register");
    } else {
      router.push("/login?callbackUrl=/register");
    }
  };

  const handleLoginClick = () => {
    router.push("/login?callbackUrl=/dashboard");
  };

  const activeHref = useMemo(() => {
    const exact = navItems.find((i) => i.href === pathname)?.href;
    if (exact) return exact;
    return navItems.find((i) => pathname?.startsWith(i.href) && i.href !== "/")?.href;
  }, [pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-zinc-100/50 bg-white/70 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/70">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <InetzLogo />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-full border border-zinc-100/50 dark:border-zinc-800/50">
          {navItems.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300",
                    isActive 
                      ? "text-white dark:text-zinc-900" 
                      : "text-zinc-500 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-orange-500 rounded-full -z-10 shadow-lg shadow-orange-500/20"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ) : !isLoggedIn ? (
              <>
                <Button 
                  onClick={handleLoginClick} 
                  variant="ghost" 
                  size="sm" 
                  className="font-semibold"
                >
                  Login
                </Button>

                <Button 
                  onClick={handleRegisterClick} 
                  variant="primary" 
                  size="sm" 
                  className="px-6 rounded-full font-bold shadow-lg shadow-orange-500/20 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Apply Now
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {user?.role === "admin" && (
                  <Button
                    href="/admin"
                    variant="ghost"
                    size="sm"
                    className="font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" /> Admin
                  </Button>
                )}

                <Button 
                  href="/apply" 
                  variant="primary" 
                  size="sm" 
                  className="px-5 rounded-full font-bold shadow-md shadow-orange-500/20 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Apply Now
                </Button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(user?.role === "admin" ? "/admin" : "/dashboard")}
                    className="relative w-9 h-9 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:ring-2 hover:ring-orange-500 transition-all shadow-sm"
                    title="Dashboard"
                  >
                    {user?.image ? (
                      <Image src={user.image} alt="User Profile" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-zinc-500" />
                      </div>
                    )}
                  </button>
                  
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="rounded-full font-bold border-zinc-200 dark:border-zinc-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 rounded-full h-10 w-10 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl text-lg font-semibold transition-all",
                    item.href === activeHref 
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" 
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {isLoggedIn && (
                <>
                  {user?.role === "admin" && (
                    <Link href="/admin" className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20">
                      <ShieldCheck className="w-5 h-5" /> Admin Dashboard
                    </Link>
                  )}
                  <Link href="/dashboard" className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20">
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Link>
                </>
              )}

              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                {isLoading ? (
                  <div className="h-12 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                ) : !isLoggedIn ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handleLoginClick} variant="outline" size="lg" className="rounded-2xl">
                      Login
                    </Button>
                    <Button 
                      onClick={handleRegisterClick} 
                      variant="primary" 
                      size="lg" 
                      className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600"
                    >
                      Register Now
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleLogout} variant="primary" size="lg" className="w-full rounded-2xl bg-red-600 hover:bg-red-700 border-none text-white flex justify-center items-center">
                    <LogOut className="w-5 h-5 mr-2" /> Logout
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