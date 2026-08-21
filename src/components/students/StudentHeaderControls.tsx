"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  UserPlus, 
  Calendar, 
  Clock, 
  RotateCcw,
  Loader2,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DurationStat {
  count: number;
  collected: number;
  pending: number;
}

interface SummaryData {
  totalStudents: number;
  totalCollected: number;
  totalPending: number;
  duesCount: number;
  clearCount: number;
  byDuration?: {
    "6 Months": DurationStat;
    "3 Months": DurationStat;
    "Short Term (1W / 2W / 1M)": DurationStat;
  };
}

interface ProgramTrack {
  _id?: string;
  title: string;
  duration?: string;
}

interface StudentHeaderControlsProps {
  summary: SummaryData;
  search: string;
  onSearchChange: (value: string) => void;
  domainFilter: string;
  onDomainChange: (value: string) => void;
  availableDomains?: string[];
  durationFilter: string;
  onDurationChange: (value: string) => void;
  availableDurations?: string[];
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
  onClearDates: () => void;
  loading: boolean;
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

const DEFAULT_DURATIONS = [
  "All",
  "1 Week",
  "2 Weeks",
  "1 Month",
  "3 Months",
  "6 Months",
];

const DEFAULT_DOMAINS = [
  "All",
  "Web Development",
  "Java Full Stack",
  "Python Development",
  "Data Analytics",
  "Data Science",
  "Android App Development",
  "Cyber Security",
  "UI/UX Design",
];

export default function StudentHeaderControls({
  summary,
  search,
  onSearchChange,
  domainFilter,
  onDomainChange,
  availableDomains,
  durationFilter,
  onDurationChange,
  availableDurations = DEFAULT_DURATIONS,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onClearDates,
  loading,
  onRefresh,
  onOpenAddModal,
}: StudentHeaderControlsProps) {
  const [fetchedTracks, setFetchedTracks] = useState<string[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  // Fetch dynamic tracks from API if not provided by parent
  useEffect(() => {
    if (availableDomains && availableDomains.length > 1) return;

    async function fetchCourseDomains() {
      setLoadingTracks(true);
      try {
        let res = await fetch("/api/tracks");
        if (!res.ok) {
          res = await fetch("/api/programs");
        }

        if (res.ok) {
          const raw = await res.json();
          const list: ProgramTrack[] = Array.isArray(raw)
            ? raw
            : raw.programs || raw.data || [];

          const titles = Array.from(
            new Set(list.map((item) => item.title).filter(Boolean))
          );
          if (titles.length > 0) {
            setFetchedTracks(titles);
          }
        }
      } catch (err) {
        console.error("Failed to load tracks for domain filter:", err);
      } finally {
        setLoadingTracks(false);
      }
    }

    fetchCourseDomains();
  }, [availableDomains]);

  // Combine and deduplicate domains with case-insensitive normalization
  const resolvedDomains = useMemo(() => {
    let sourceList: string[] = [];

    if (availableDomains && availableDomains.length > 1) {
      sourceList = availableDomains;
    } else if (fetchedTracks.length > 0) {
      sourceList = ["All", ...fetchedTracks];
    } else {
      sourceList = DEFAULT_DOMAINS;
    }

    const seen = new Set<string>();
    const unique: string[] = [];

    sourceList.filter(Boolean).forEach((dom) => {
      const normalized = dom.trim().toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(dom.trim());
      }
    });

    const hasAll = unique.some((d) => d.toLowerCase() === "all");
    if (!hasAll) {
      unique.unshift("All");
    }

    return unique;
  }, [availableDomains, fetchedTracks]);

  // Case-insensitive match for the current domain filter value
  const matchedDomainValue = useMemo(() => {
    const target = (domainFilter || "all").trim().toLowerCase();
    const found = resolvedDomains.find((d) => d.trim().toLowerCase() === target);
    return found || "All";
  }, [domainFilter, resolvedDomains]);

  // Case-insensitive match for the current duration filter value
  const matchedDurationValue = useMemo(() => {
    const target = (durationFilter || "all").trim().toLowerCase();
    const found = availableDurations.find((d) => d.trim().toLowerCase() === target);
    return found || "All";
  }, [durationFilter, availableDurations]);

  const sixMonthStats = summary.byDuration?.["6 Months"] || { count: 0, collected: 0, pending: 0 };
  const threeMonthStats = summary.byDuration?.["3 Months"] || { count: 0, collected: 0, pending: 0 };
  const shortTermStats = summary.byDuration?.["Short Term (1W / 2W / 1M)"] || { count: 0, collected: 0, pending: 0 };

  return (
    <div className="space-y-4">
      {/* ─── DURATION-WISE METRICS CARDS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: 6 Months Track */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-xs">
                6M
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">
                  6 Months Track
                </span>
                <p className="text-xs font-bold text-zinc-500">Long Term Master</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-zinc-900 block leading-tight">
                {sixMonthStats.count.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Students</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 text-xs">
            <div className="bg-zinc-50 p-2.5 rounded-xl">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600">Collected</p>
              <p className="font-black text-sm text-zinc-900 mt-0.5">
                ₹{sixMonthStats.collected.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-xl">
              <p className="text-[9px] font-black uppercase tracking-wider text-amber-600">Pending</p>
              <p className="font-black text-sm text-amber-700 mt-0.5">
                ₹{sixMonthStats.pending.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: 3 Months Track */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs">
                3M
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                  3 Months Track
                </span>
                <p className="text-xs font-bold text-zinc-500">Advanced Program</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-zinc-900 block leading-tight">
                {threeMonthStats.count.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Students</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 text-xs">
            <div className="bg-zinc-50 p-2.5 rounded-xl">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600">Collected</p>
              <p className="font-black text-sm text-zinc-900 mt-0.5">
                ₹{threeMonthStats.collected.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-xl">
              <p className="text-[9px] font-black uppercase tracking-wider text-amber-600">Pending</p>
              <p className="font-black text-sm text-amber-700 mt-0.5">
                ₹{threeMonthStats.pending.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Short Term Track (1W / 2W / 1 Month combined) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs">
                <CalendarDays size={16} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Short Term Tracks
                </span>
                <p className="text-xs font-bold text-zinc-500">1W / 2W / 1 Month</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-zinc-900 block leading-tight">
                {shortTermStats.count.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Students</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 text-xs">
            <div className="bg-zinc-50 p-2.5 rounded-xl">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600">Collected</p>
              <p className="font-black text-sm text-zinc-900 mt-0.5">
                ₹{shortTermStats.collected.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-xl">
              <p className="text-[9px] font-black uppercase tracking-wider text-amber-600">Pending</p>
              <p className="font-black text-sm text-amber-700 mt-0.5">
                ₹{shortTermStats.pending.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ─── CONTROLS & FILTERING BAR ────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-base font-black text-zinc-900 uppercase tracking-tight">
              Student Directory
            </h2>
            <p className="text-xs text-zinc-400 font-medium mt-0.5 flex flex-wrap items-center gap-1">
              <span>Domain:</span>
              <span className="font-bold text-zinc-700">{matchedDomainValue}</span>
              <span className="text-zinc-300">•</span>
              <span>Duration:</span>
              <span className="font-bold text-zinc-700">{matchedDurationValue}</span>
              {(fromDate || toDate) && (
                <span className="ml-1 text-emerald-600 font-bold">
                  ({fromDate || "Start"} to {toDate || "Present"})
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
              title="Reload Directory"
            >
              <RefreshCw size={14} className={cn(loading && "animate-spin")} />
            </button>

            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus size={15} /> Add Student
            </button>
          </div>
        </div>

        {/* INPUTS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          
          {/* 1. Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search Name, Email, Phone..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* 2. Domain Filter Dropdown */}
          <div className="relative">
            <select
              value={matchedDomainValue}
              onChange={(e) => {
                const selectedVal = e.target.value;
                const normalized = selectedVal.trim().toLowerCase();
                onDomainChange(normalized === "all" ? "All" : selectedVal);
              }}
              disabled={loadingTracks}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer appearance-none pr-8 disabled:opacity-60"
            >
              {loadingTracks ? (
                <option value="All">Loading courses...</option>
              ) : (
                resolvedDomains.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom.trim().toLowerCase() === "all" ? "All Domains" : dom}
                  </option>
                ))
              )}
            </select>
            {loadingTracks ? (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 animate-spin pointer-events-none" />
            ) : (
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            )}
          </div>

          {/* 3. Duration Filter Dropdown */}
          <div className="relative">
            <select
              value={matchedDurationValue}
              onChange={(e) => {
                const selectedVal = e.target.value;
                const normalized = selectedVal.trim().toLowerCase();
                onDurationChange(normalized === "all" ? "All" : selectedVal);
              }}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer appearance-none pr-8"
            >
              {availableDurations.map((dur) => (
                <option key={dur} value={dur}>
                  {dur.trim().toLowerCase() === "all" ? "All Durations" : dur}
                </option>
              ))}
            </select>
            <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          {/* 4. From Date Picker */}
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 transition-all cursor-pointer"
              title="From Admission Date"
            />
          </div>

          {/* 5. To Date Picker + Reset Button */}
          <div className="flex gap-2">
            <div className="relative flex-1 flex items-center">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 transition-all cursor-pointer"
                title="To Admission Date"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={onClearDates}
                className="p-2 border border-zinc-200 hover:bg-red-50 hover:border-red-200 text-zinc-500 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                title="Reset Date Range"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}