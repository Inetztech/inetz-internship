"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Filter, 
  Loader2, 
  Sparkles,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  companyName: string;
  domain: string;
  location: string;
  jobType: string;
  salaryOrStipend: string;
  description: string;
  createdAt: string;
}

export default function PublicJobDirectory() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [domains, setDomains] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  // Fetch Jobs List
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedDomain !== "All") params.append("domain", selectedDomain);
      if (selectedType !== "All") params.append("jobType", selectedType);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setJobs(data.jobs || []);
        if (data.availableDomains) {
          setDomains(data.availableDomains);
        }
      }
    } catch {
      console.error("Failed to load jobs feed");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDomain, selectedType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchJobs]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8 rounded-3xl space-y-3 shadow-lg relative overflow-hidden">
        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 font-extrabold rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 border border-orange-500/30">
          <Sparkles size={12} /> Verified Tech Careers & Placement Tracks
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Explore Placement Opportunities</h1>
        <p className="text-xs sm:text-sm text-zinc-300 max-w-xl font-medium">
          Browse current opportunities from our industry partners and contact us for more information.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search by title, technology stack, or company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div className="w-full md:w-52">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
            >
              <option value="All">All Engagement Types</option>
              <option value="Internship">Internship Track</option>
              <option value="Full-time">Full-time Role</option>
              <option value="Part-time">Part-time Role</option>
            </select>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-100">
          <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1 mr-1">
            <Filter size={12} /> Tech Domains:
          </span>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDomain === dom
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-xs text-zinc-400 gap-2">
          <Loader2 className="animate-spin text-orange-500" size={18} /> Fetching matching opportunities...
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center space-y-2">
          <Briefcase className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-800">No active job listings found</h3>
          <p className="text-xs text-zinc-500">Try adjusting your search query or tech domain filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-sm hover:border-orange-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-base font-extrabold text-zinc-900 line-clamp-1">{job.title}</h3>
                      <p className="text-xs font-bold text-zinc-500 mt-0.5">{job.companyName}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-orange-50 border border-orange-100 text-orange-700 font-extrabold rounded-lg text-[10px] uppercase tracking-wider shrink-0">
                      {job.jobType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin size={13} className="text-zinc-400" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 font-extrabold text-emerald-600">
                      <DollarSign size={13} /> {job.salaryOrStipend}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed font-medium">
                    {job.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400">
                    {new Date(job.createdAt).toLocaleDateString("en-IN")}
                  </span>
                  
                  <Link href="/contact" className="text-xs font-extrabold text-orange-600 hover:text-orange-700 hover:underline">
                    Enquire about this role
                  </Link>
                </div>
              </div>
          ))}
        </div>
      )}

    </div>
  );
}
