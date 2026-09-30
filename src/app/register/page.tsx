"use client";

import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, Mail, Lock, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/login?message=Account created successfully");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact" className="min-h-screen bg-[#FBFBFB] dark:bg-zinc-950 flex flex-col justify-center py-10 px-4">
      
      {/* Compact Navigation */}
      <div className="fixed top-6 left-6">
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-900 transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-3 h-3" />
          Exit
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[380px]">
        {/* Scaled Down Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="relative h-10 w-32 transition-opacity hover:opacity-80">
            <Image src="/icon.jpeg" alt="Inetz Logo" fill className="object-contain" priority />
          </Link>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-zinc-900/50 p-8 shadow-xl shadow-zinc-200/40 dark:shadow-none border border-zinc-100 dark:border-zinc-800 rounded-[2rem]">
          <div className="mb-8">
            <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
              Join <span className="text-orange-500">Inetz</span>
            </h1>
            <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-tight flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-400" /> Start your developer journey
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 text-[10px] font-black uppercase text-red-500 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">
                Full_Name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300 group-focus-within:text-orange-500 transition-colors" />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your name"
                  className="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs outline-none transition-all focus:border-orange-500 focus:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">
                Email_Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300 group-focus-within:text-orange-500 transition-colors" />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs outline-none transition-all focus:border-orange-500 focus:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">
                Secure_Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300 group-focus-within:text-orange-500 transition-colors" />
                <input
                  required
                  type="password"
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs outline-none transition-all focus:border-orange-500 focus:ring-0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-zinc-900 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-zinc-200 dark:shadow-none"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </button>
          </form>
          
          <div className="mt-6 pt-5 border-t border-zinc-50 dark:border-zinc-800">
            <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
              Synced already?{" "}
              <Link href="/login" className="text-orange-600 hover:underline underline-offset-4 font-black transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-[8px] font-black text-zinc-400 uppercase tracking-[0.5em] opacity-50">
          Inetz Technologies // Academy Systems
        </p>
      </div>
    </div>
  );
}
