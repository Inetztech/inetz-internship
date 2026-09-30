"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  Terminal, 
  Code2, 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { FaChrome } from "react-icons/fa";

const LOGIN_QUOTES = [
  "Welcome back, Commander. Ready to push some code?",
  "Every great developer was once where you are now.",
  "Compiling your workspace... please wait.",
  "First, solve the problem. Then, write the code.",
  "System.out.println('Welcome Developer');",
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [randomQuote] = useState(
    () => LOGIN_QUOTES[Math.floor(Math.random() * LOGIN_QUOTES.length)],
  );

  // Extract return target from either 'callbackUrl' or 'callback' search parameters
  // Sanitize callback URL to enforce relative internal redirects only
  const targetDestination = useMemo(() => {
    const rawCallback = searchParams.get("callbackUrl") || searchParams.get("callback");
    
    if (!rawCallback) return "/dashboard";

    const decoded = decodeURIComponent(rawCallback).trim();
    
    // Prevent external redirects (e.g., "https://...", "//attacker.com", "javascript:")
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }

    return "/dashboard";
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccessMsg("");

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password: password,
        redirect: false, // Prevents full-page hard refresh from NextAuth
      });

      if (res?.error) {
        // Handle credential verification errors
        setError(res.error === "CredentialsSignin" ? "Invalid email or access key." : res.error);
        setLoading(false);
      } else if (res?.ok) {
        // 🎯 FIX 2: Check `res?.ok` instead of `res?.url` (res?.url can be null with redirect: false)
        setSuccessMsg("Session initialized successfully! Redirecting...");
        
        // Force full refresh navigation so Next.js server components & middleware register session cookies instantly
        window.location.href = targetDestination;
      } else {
        setError("Failed to establish session. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      
      <div className="fixed top-6 left-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-xs font-bold uppercase tracking-tighter"
        >
          <ArrowLeft className="w-3 h-3" />
          Return
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="relative h-10 w-32">
            <Image
              src="/icon.jpeg"
              alt="Inetz Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <p className="mt-1.5 text-center text-[11px] text-zinc-500 dark:text-zinc-400 font-medium italic">
          {randomQuote}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-white dark:bg-zinc-900/40 py-8 px-6 shadow-xl shadow-zinc-200/40 dark:shadow-none border border-zinc-100 dark:border-zinc-800 rounded-3xl backdrop-blur-md">
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 flex items-center gap-2 text-red-600 dark:text-red-400 text-[10px] font-bold"
              >
                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">
                Student Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-orange-500 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@student.inetz.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Access Key
                </label>
                <span className="text-[9px] font-bold text-zinc-400">Contact support to reset</span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-orange-500 transition-colors">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-[11px] font-black uppercase tracking-widest text-white bg-zinc-900 hover:bg-black focus:outline-none transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Terminal className="w-3.5 h-3.5" />
                  Initialize Session
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div></div>
            <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-widest">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400">or external auth</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => signIn("google", { callbackUrl: targetDestination })}
            className="w-full flex justify-center items-center gap-2 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            <FaChrome className="w-3.5 h-3.5 text-orange-500" />
            Connect via Google
          </button>

          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-center text-[10px] text-zinc-500 uppercase tracking-tight">
              Don't have an ID?{" "}
              <Link
                href="/register"
                className="font-black text-orange-600 hover:text-orange-700 underline underline-offset-4"
              >
                Join
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-zinc-300">
            <Code2 className="w-4 h-4" />
            <div className="h-px w-12 bg-zinc-100 dark:bg-zinc-800" />
            <Terminal className="w-4 h-4" />
          </div>
          <p className="text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest opacity-60">
            Inetz Technologies • Build. Deploy. Scale.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
