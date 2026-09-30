"use client";

import React, { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Globe, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  Briefcase
} from "lucide-react";

// Memoized Reusable Input Component to Eliminate Input Lag
const FormInput = memo(({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required = true,
  minLength,
  icon: Icon,
  rightElement,
}: {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  icon?: React.ElementType;
  rightElement?: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-xs font-bold text-zinc-700">
      {label} {required && <span className="text-orange-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={15} />
      )}
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full py-2.5 bg-zinc-50/80 border border-zinc-200/90 rounded-xl text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all ${
          Icon ? "pl-10" : "px-3.5"
        } ${rightElement ? "pr-10" : "pr-3.5"}`}
      />
      {rightElement && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  </div>
));
FormInput.displayName = "FormInput";

export default function EmployerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    companyWebsite: "",
    phone: "",
  });

  // Optimized Input Change Handler
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/employer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/login?registered=true&role=employer");
      } else {
        setError(data.error || "Failed to create employer account.");
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/80 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white max-w-5xl w-full rounded-3xl border border-zinc-200/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-6">
        
        {/* LEFT COLUMN: BRANDING & VALUE PROPOSITIONS */}
        <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-500/20">
                i
              </div>
              <span className="text-xl font-black tracking-tight text-white">inetz</span>
            </Link>

            <div className="space-y-3 pt-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Recruit Industry-Tested Software Developers
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Partner with Inetz Technologies to access pre-vetted candidates trained on production-grade Full-Stack, Java, Python, and Mobile architectures.
              </p>
            </div>

            {/* Key Benefits List */}
            <div className="space-y-3 pt-2">
              {[
                "Zero Recruitment Agency Commission",
                "100% Code-Validated Candidate Profiles",
                "Direct Dashboard Interview Scheduling",
                "Immediate Availability Engineers",
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Trust Footer */}
          <div className="pt-8 border-t border-zinc-800/80 mt-8 relative z-10">
            <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
              <ShieldCheck size={16} className="text-orange-400" />
              <span>Encrypted & Verified Enterprise Onboarding</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTRATION FORM */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center space-y-6 bg-white">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Create Employer Account</h1>
            <p className="text-xs text-zinc-500 font-medium">
              Publish job listings and connect directly with candidate developers.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in zoom-in-95">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Full Name"
              type="text"
              name="name"
              placeholder="e.g. Sarah Jenkins (HR Director)"
              value={formData.name}
              onChange={handleChange}
              icon={User}
            />

            <FormInput
              label="Work Email Address"
              type="email"
              name="email"
              placeholder="e.g. recruiter@company.com"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Company Name"
                type="text"
                name="companyName"
                placeholder="e.g. Acme Corp"
                value={formData.companyName}
                onChange={handleChange}
                icon={Building2}
              />

              <FormInput
                label="Phone Number"
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
              />
            </div>

            <FormInput
              label="Company Website"
              type="url"
              name="companyWebsite"
              required={false}
              placeholder="https://company.com"
              value={formData.companyWebsite}
              onChange={handleChange}
              icon={Globe}
            />

            <FormInput
              label="Password"
              type={showPassword ? "text" : "password"}
              minLength={8}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  <Briefcase size={16} /> Complete Employer Registration <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-zinc-500 pt-4 border-t border-zinc-100">
            Already registered as an employer?{" "}
            <Link href="/login" className="font-bold text-orange-600 hover:text-orange-700 hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
