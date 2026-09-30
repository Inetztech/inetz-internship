// app/apply/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
  ArrowLeft,
  IndianRupee,
  Lock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

interface ProgramItem {
  _id?: string;
  title: string;
  duration: string;
  price?: number;
  originalPrice?: number;
}

const toDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function BatchStartCalendar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [isOpen, setIsOpen] = useState(false);
  const firstDay = visibleMonth.getDay();
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const isCurrentMonth =
    visibleMonth.getFullYear() === today.getFullYear() &&
    visibleMonth.getMonth() === today.getMonth();

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-700 outline-none transition-all hover:bg-white focus:border-indigo-500"
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value
            ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Choose joining date"}
        </span>
        <CalendarDays size={14} className="text-indigo-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          disabled={isCurrentMonth}
          onClick={() =>
            setVisibleMonth(
              new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
            )
          }
          className="rounded p-1 text-slate-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-black text-slate-800">
          {visibleMonth.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() =>
            setVisibleMonth(
              new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
            )
          }
          className="rounded p-1 text-slate-500 hover:bg-white"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day} className="py-1 text-[8px] font-black uppercase text-slate-400">
            {day}
          </span>
        ))}
        {Array.from({ length: firstDay }).map((_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const date = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth(),
            index + 1,
          );
          const dateValue = toDateValue(date);
          const isBatchDay = date.getDay() === 1 || date.getDay() === 5;
          const isAvailable = date >= today && isBatchDay;
          const isSelected = value === dateValue;

          return (
            <button
              key={dateValue}
              type="button"
              disabled={!isAvailable}
              aria-label={date.toLocaleDateString("en-IN")}
              onClick={() => {
                onChange(dateValue);
                setIsOpen(false);
              }}
              className={cn(
                "aspect-square rounded text-[10px] font-bold transition-colors",
                isSelected
                  ? "bg-indigo-600 text-white"
                  : isAvailable
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "cursor-not-allowed text-slate-300",
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[9px] font-bold text-slate-500">
        Blue dates are available batch starts.
      </p>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  label,
  onChange,
  ...props
}: { label: string; onChange: (v: string) => void } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
>) {
  return (
    <Field label={label}>
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
      />
    </Field>
  );
}

function Select({ label, options, onChange, ...props }: any) {
  return (
    <Field label={label}>
      <div className="relative">
        <select
          {...props}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none appearance-none cursor-pointer capitalize"
        >
          {options.map((o: string) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
      </div>
    </Field>
  );
}

function StaticField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <div className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-700">
        {value}
      </div>
    </Field>
  );
}

function StepCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black">
          {step}
        </span>
        <h2 className="font-black text-[11px] text-slate-800 uppercase tracking-widest">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function ReviewAndPayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  // Role Detection
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "admin";

  // URL Parameters
  const urlTrack = searchParams.get("track") || "WEB DEVELOPMENT";
  const urlDuration = searchParams.get("duration") || "1 Week";
  const urlPrice = parseInt(searchParams.get("price") || "0");
  const urlOriginalPrice = parseInt(searchParams.get("originalPrice") || "0");
  const urlCourseTitle = searchParams.get("courseTitle") || "";

  const [isProcessing, setIsProcessing] = useState(false);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  // Fee state
  const [discountedFee, setDiscountedFee] = useState<number>(urlPrice || 1499);
  const [originalFee, setOriginalFee] = useState<number>(
    urlOriginalPrice || discountedFee * 2,
  );
  const [customAmount, setCustomAmount] = useState<number>(discountedFee);

  // Admin Specific Options
  const [adminPaymentMethod, setAdminPaymentMethod] = useState<"Cash" | "GPay">(
    "Cash",
  );

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    year: "1st Year",
    track: urlTrack,
    duration: urlDuration,
    mode: "Online",
    batchStartDate: "", // 🎯 Added batch start date state
  });

  const set = (key: string) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  // Dynamic Razorpay Script Loader Backup
  const ensureRazorpayLoaded = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const promptLogin = () => {
    const currentUrl =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/apply";
    const wantsToLogin = window.confirm(
      "Notice: You must be logged in to complete enrollment and access your student dashboard.\n\nClick 'OK' to navigate to the Sign In page now.",
    );
    if (wantsToLogin) {
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
    }
  };

  // 1. Fetch tracks and programs from API
  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoadingTracks(true);
        const res = await fetch("/api/tracks");
        if (res.ok) {
          const data: ProgramItem[] = await res.json();
          setPrograms(data);

          if (Array.isArray(data) && data.length > 0) {
            const matched =
              data.find(
                (p) =>
                  p.title.toLowerCase() === urlTrack.toLowerCase() &&
                  p.duration.toLowerCase() === urlDuration.toLowerCase(),
              ) ||
              data.find(
                (p) => p.title.toLowerCase() === urlTrack.toLowerCase(),
              ) ||
              data[0];

            setForm((f) => ({
              ...f,
              track: matched.title,
              duration: matched.duration || f.duration,
            }));

            if (matched.price) {
              setDiscountedFee(matched.price);
              setCustomAmount(matched.price);
            }
            if (matched.originalPrice) {
              setOriginalFee(matched.originalPrice);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch tracks:", err);
      } finally {
        setLoadingTracks(false);
      }
    }

    fetchPrograms();
  }, [urlTrack, urlDuration]);

  // 2. Pre-fill user data when NextAuth session becomes available
  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || u.name || "",
        email: prev.email || u.email || "",
        phone: prev.phone || u.phone || u.phoneNumber || "",
      }));
    }
  }, [session]);

  // 3. Available duration options for current track
  const availableDurations = Array.from(
    new Set(
      programs
        .filter((p) => p.title === form.track)
        .map((p) => p.duration)
        .filter(Boolean),
    ),
  );

  const durationOptions =
    availableDurations.length > 0
      ? availableDurations
      : ["1 Week", "2 Weeks", "1 Month", "2 Months"];

  // 4. Handle Track change
  const handleTrackChange = (selectedTitle: string) => {
    const trackPrograms = programs.filter((p) => p.title === selectedTitle);
    const matched = trackPrograms[0];
    const newDuration = matched?.duration || form.duration;

    setForm((f) => ({
      ...f,
      track: selectedTitle,
      duration: newDuration,
    }));

    if (matched?.price) {
      setDiscountedFee(matched.price);
      setCustomAmount(matched.price);
    }
    if (matched?.originalPrice) {
      setOriginalFee(matched.originalPrice);
    }
  };

  // 5. Handle Duration change
  const handleDurationChange = (selectedDuration: string) => {
    const matched = programs.find(
      (p) => p.title === form.track && p.duration === selectedDuration,
    );

    setForm((f) => ({
      ...f,
      duration: selectedDuration,
    }));

    if (matched?.price) {
      setDiscountedFee(matched.price);
      setCustomAmount(matched.price);
    }
    if (matched?.originalPrice) {
      setOriginalFee(matched.originalPrice);
    }
  };

  // Validation flags
  const isOverAmount = customAmount > discountedFee;
  const isUnderAmount = customAmount < 500 && !isAdmin;
  const isAmountInvalid = isOverAmount || isUnderAmount;

  // ─── MAIN PAY / ADMIT SUBMISSION HANDLER ────────────────────────────────────
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sessionStatus === "unauthenticated" || !session) {
      promptLogin();
      return;
    }

    if (isUnderAmount) return alert("Min payment is ₹500");
    if (isOverAmount)
      return alert(`Max payment is ₹${discountedFee.toLocaleString()}`);
    if (!form.fullName || !form.phone)
      return alert("Please fill in candidate name and mobile number.");
    if (!form.college || !form.department)
      return alert("Please fill in education details.");
    if (!form.batchStartDate)
      return alert("Please select your preferred batch start date.");

    setIsProcessing(true);

    // PATH 1: ADMIN MANUAL ENTRY
    if (isAdmin) {
      try {
        const response = await axios.post("/api/students", {
          name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          college: form.college.trim(),
          domain: form.track,
          duration: form.duration,
          doj: form.batchStartDate,
          batchStartDate: form.batchStartDate,
          totalBilling: discountedFee,
          initialPayment: customAmount,
          paymentMethod: adminPaymentMethod,
          billingBy: session?.user?.name || "Admin Manual Entry",
        });

        if (response.data.success) {
          alert(
            `Student profile registered successfully under ${adminPaymentMethod} entry!`,
          );
          router.push("/admin");
        }
      } catch (err: any) {
        console.error("Admin Manual Admission Failed:", err);
        alert(err.response?.data?.error || "Failed to register candidate.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // PATH 2: STUDENT ONLINE PAYMENT VIA RAZORPAY
    try {
      const selectedProgram = programs.find(
        (program) =>
          program.title === form.track && program.duration === form.duration,
      );
      if (!selectedProgram?._id) {
        alert("Please select a valid internship program.");
        return setIsProcessing(false);
      }

      const isLoaded = await ensureRazorpayLoaded();
      if (!isLoaded) {
        alert(
          "Razorpay SDK failed to load. Please check your network connection.",
        );
        setIsProcessing(false);
        return;
      }

      const applyPayload = {
        fullName: form.fullName.trim(),
        name: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        college: form.college.trim(),
        department: form.department.trim(),
        year: form.year,
        domain: form.track,
        duration: form.duration,
        mode: form.mode,
        batchStartDate: form.batchStartDate, // 🎯 Included
        programId: selectedProgram._id,
        amountToPay: customAmount,
      };

      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applyPayload),
      });
      const data = await res.json();

      if (!res.ok || !data.key || !data.orderId || !data.amount) {
        alert(data.error || "Failed to create order.");
        return setIsProcessing(false);
      }

      const rzp = new (window as any).Razorpay({
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "INetZ Academy",
        description: `${form.track} Internship - ${form.duration}`,
        order_id: data.orderId,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#4F46E5" },
        modal: { ondismiss: () => setIsProcessing(false) },
        handler: async (response: any) => {
          try {
            const verify = await fetch("/api/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                phone: form.phone.trim(),
                email: form.email.trim(),
                paidAmount: customAmount,
                paymentMethod: "GPay",
                billingBy: "Razorpay Online",
              }),
            });
            const result = await verify.json();

            if (result.success) {
              router.push("/dashboard?status=success");
            } else {
              alert(
                `Verification failed: ${result.error || "Please contact support."}`,
              );
              setIsProcessing(false);
            }
          } catch (err) {
            console.error("Verification network error:", err);
            alert("Verification failed due to a network connection error.");
            setIsProcessing(false);
          }
        },
      });

      rzp.on("payment.failed", (r: any) => {
        alert(`Payment failed: ${r.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong during payment processing.");
      setIsProcessing(false);
    }
  };

  const trackOptions = Array.from(new Set(programs.map((p) => p.title)));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {!isAdmin && (
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      )}

      <main className="max-w-5xl mx-auto px-6 py-8 md:py-10">
        <form
          onSubmit={handlePay}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* FORM SECTION */}
          <div className="lg:col-span-7 space-y-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-[10px] font-black uppercase flex items-center gap-1.5 text-slate-400 hover:text-[#4F46E5] transition-all tracking-widest cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>

            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {isAdmin ? "Admin Manual Admission" : "Review & Apply"}
              </h1>
              {isAdmin && (
                <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Admin Mode
                </span>
              )}
            </div>

            {/* ON-PAGE ALERT BANNER FOR VISITORS */}
            {sessionStatus === "unauthenticated" && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-tight">
                    Account Sign-In Required
                  </p>
                  <p className="text-[11px] font-medium text-amber-700 mt-0.5">
                    You need an active account to link your payment and track
                    your internship modules.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={promptLogin}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase rounded-xl transition-all shrink-0 shadow-sm cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}

            <div className="space-y-5">
              <StepCard step={1} title="Contact Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Full Name *"
                    value={form.fullName}
                    onChange={set("fullName")}
                    placeholder="Rahul Sharma"
                  />
                  <Input
                    label={isAdmin ? "Email (Optional for Admin)" : "Email *"}
                    value={form.email}
                    onChange={set("email")}
                    placeholder="rahul@example.com"
                    disabled={!isAdmin && !!session?.user?.email}
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Phone Number *"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>
              </StepCard>

              <StepCard step={2} title="Education Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      label="College *"
                      value={form.college}
                      onChange={set("college")}
                      placeholder="Institution Name"
                    />
                  </div>
                  <Input
                    label="Department *"
                    value={form.department}
                    onChange={set("department")}
                    placeholder="e.g. CSE"
                  />
                  <Select
                    label="Year *"
                    value={form.year}
                    options={["1st Year", "2nd Year", "3rd Year", "4th Year"]}
                    onChange={set("year")}
                  />
                </div>
              </StepCard>

              <StepCard step={3} title="Program Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Track Dropdown */}
                  {loadingTracks ? (
                    <Field label="Track">
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-400 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                        Loading...
                      </div>
                    </Field>
                  ) : trackOptions.length > 0 ? (
                    <Select
                      label="Track"
                      value={form.track}
                      options={trackOptions}
                      onChange={handleTrackChange}
                    />
                  ) : (
                    <StaticField
                      label="Track"
                      value={form.track.toUpperCase()}
                    />
                  )}

                  {/* Duration Dropdown */}
                  <Select
                    label="Duration"
                    value={form.duration}
                    options={durationOptions}
                    onChange={handleDurationChange}
                  />

                  <Select
                    label="Mode"
                    value={form.mode}
                    options={["Online", "Offline"]}
                    onChange={set("mode")}
                  />

                  <Field label="Date of Joining (Monday / Friday) *">
                    <BatchStartCalendar
                      value={form.batchStartDate}
                      onChange={set("batchStartDate")}
                    />
                  </Field>
                </div>
              </StepCard>
            </div>
          </div>

          {/* SUMMARY SECTION */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm sticky top-20">
              <div className="p-3 border-b border-slate-100 flex items-center gap-2 font-black text-[9px] uppercase tracking-widest text-slate-400">
                <Lock className="w-3.5 h-3.5 text-indigo-600" /> Order Summary
              </div>
              <div className="p-4">
                <div className="rounded-lg overflow-hidden mb-3 h-32 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600"
                    className="w-full h-full object-cover"
                    alt="Program"
                  />
                </div>

                <h3 className="font-black text-sm leading-tight text-slate-800 uppercase tracking-tighter">
                  {urlCourseTitle
                    ? `${urlCourseTitle} — ${form.duration}`
                    : `${form.duration} ${form.track} Internship`}
                </h3>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span>Standard Fee</span>
                    <span className="line-through">
                      ₹{originalFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-emerald-600 font-black uppercase">
                    <span>Scholarship</span>
                    <span>
                      -₹{(originalFee - discountedFee).toLocaleString()}
                    </span>
                  </div>

                  {/* ADMIN PAYMENT METHOD SELECTOR */}
                  {isAdmin && (
                    <div className="my-3 p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-amber-800 tracking-wider">
                        Admin Collection Method
                      </label>
                      <div className="flex gap-4 pt-1">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="radio"
                            name="adminPayment"
                            value="Cash"
                            checked={adminPaymentMethod === "Cash"}
                            onChange={() => setAdminPaymentMethod("Cash")}
                            className="accent-indigo-600"
                          />
                          Cash
                        </label>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="radio"
                            name="adminPayment"
                            value="GPay"
                            checked={adminPaymentMethod === "GPay"}
                            onChange={() => setAdminPaymentMethod("GPay")}
                            className="accent-indigo-600"
                          />
                          GPay / UPI
                        </label>
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      "border rounded-lg p-2.5 my-3 flex items-center justify-between gap-3 transition-colors",
                      isOverAmount
                        ? "bg-red-50 border-red-200"
                        : isUnderAmount
                          ? "bg-amber-50 border-amber-200"
                          : "bg-slate-50 border-slate-100",
                    )}
                  >
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                        {isAdmin ? "Collected Amount" : "Payable Now"}
                      </p>
                      {isOverAmount ? (
                        <p className="text-[7px] font-black text-red-500 uppercase tracking-wide">
                          Max ₹{discountedFee.toLocaleString()}
                        </p>
                      ) : isUnderAmount ? (
                        <p className="text-[7px] font-black text-amber-500 uppercase tracking-wide">
                          Min ₹500
                        </p>
                      ) : (
                        <p className="text-[7px] font-bold text-slate-400 italic">
                          ({isAdmin ? "Custom Admin Entry" : "Min ₹500"})
                        </p>
                      )}
                    </div>
                    <div className="relative flex-1 max-w-[110px]">
                      <IndianRupee
                        className={cn(
                          "absolute left-2.5 top-1/2 -translate-y-1/2 size-3",
                          isOverAmount ? "text-red-400" : "text-slate-400",
                        )}
                      />
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) =>
                          setCustomAmount(parseInt(e.target.value) || 0)
                        }
                        className={cn(
                          "w-full pl-6 pr-2 py-1.5 bg-white border rounded text-sm font-black text-slate-800 outline-none text-right transition-colors",
                          isOverAmount
                            ? "border-red-400 focus:border-red-500 text-red-600"
                            : isUnderAmount
                              ? "border-amber-400 focus:border-amber-500"
                              : "border-slate-200 focus:border-indigo-500",
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-baseline">
                    <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
                      Grand Total
                    </span>
                    <span
                      className={cn(
                        "font-black text-xl tracking-tighter",
                        isAmountInvalid ? "text-red-500" : "text-slate-900",
                      )}
                    >
                      ₹{customAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || isAmountInvalid}
                  className={cn(
                    "w-full mt-5 py-3.5 text-white rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                    isAmountInvalid
                      ? "bg-red-500 shadow-red-100"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100",
                  )}
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin size-3" />
                  ) : (
                    <Lock className="size-3" />
                  )}
                  {isAdmin
                    ? "Register Candidate (Admin)"
                    : isOverAmount
                      ? "Check Limit"
                      : "Enroll Now"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function ReviewAndPay() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-indigo-600" />
        </div>
      }
    >
      <ReviewAndPayContent />
    </Suspense>
  );
}
