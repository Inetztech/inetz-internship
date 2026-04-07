"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, GraduationCap, MapPin,
  Calendar, Mail, Briefcase, FileText,
  ChevronRight, LayoutGrid, Info, BadgeCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Application {
  _id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  collegeName?: string;
  year?: string;
  department?: string;
  domain: string;
  duration: string;
  mode: string;
  status: string;
  createdAt: string;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user") || "{}");
        const userEmail = user?.user?.email || user?.email;
        if (!userEmail) return;

        const response = await fetch(`/api/student/data?email=${userEmail}`);
        const result = await response.json();

        if (result.success) {
          const apps = Array.isArray(result.data.profile) ? result.data.profile : [result.data.profile];
          setApplications(apps);
          if (apps.length > 0) setSelectedAppId(apps[0]._id);
        }
      } catch (error) {
        console.error("Data fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const activeApp: Application | undefined =
  applications.find((a: Application) => a._id === selectedAppId);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-zinc-100 border-t-zinc-900 rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Applications...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#F9F9F9] text-zinc-900 font-sans overflow-hidden flex flex-col">
      
      {/* COMPACT HEADER */}
      <header className="bg-white border-b border-zinc-200 py-4 px-8 shrink-0">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-black uppercase tracking-tight">Technical <span className="text-emerald-600">Portal</span></h1>
          </div>
          <div className="flex items-center gap-3 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">
              {activeApp?.fullName?.charAt(0) || "S"}
            </div>
            <span className="text-xs font-bold text-zinc-700">{activeApp?.fullName || "Student"}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* LEFT: COURSE TABS */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-2">My Applications</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {applications.map((app) => (
                <button
                  key={app._id}
                  onClick={() => setSelectedAppId(app._id)}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border transition-all relative overflow-hidden group",
                    selectedAppId === app._id 
                      ? "bg-white border-zinc-900 shadow-md" 
                      : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={cn("text-sm font-black transition-colors", selectedAppId === app._id ? "text-zinc-900" : "text-zinc-500")}>
                        {app.domain}
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">{app.duration} • {app.mode}</p>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 transition-transform", selectedAppId === app._id ? "translate-x-1 text-zinc-900" : "text-zinc-200")} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: APPLICATION INFORMATION DETAILS */}
          <div className="lg:col-span-8 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeApp ? (
                <motion.div 
                  key={selectedAppId}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="h-full flex flex-col bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden"
                >
                  {/* Top Status Bar */}
                  <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl border border-zinc-200">
                        <FileText className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Application Status</p>
                        <p className="text-xs font-bold text-emerald-600 uppercase">{activeApp.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Submission Date</p>
                      <p className="text-xs font-bold text-zinc-900">
                        {new Date(activeApp.createdAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Information Grid */}
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                      
                      {/* Section: Personal */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] flex items-center gap-2">
                          <User className="w-3 h-3" /> Personal Profile
                        </h4>
                        <div className="space-y-4">
                          <InfoItem label="Full Name" value={activeApp.fullName} icon={User} />
                          <InfoItem label="Email Address" value={activeApp.email} icon={Mail} />
                          <InfoItem label="Phone Number" value={activeApp.phoneNumber} icon={Phone} />
                        </div>
                      </div>

                      {/* Section: Academic */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] flex items-center gap-2">
                          <GraduationCap className="w-3 h-3" /> Academic Record
                        </h4>
                        <div className="space-y-4">
                          <InfoItem label="College / University" value={activeApp.collegeName} icon={GraduationCap} />
                          <InfoItem label="Year of Study" value={activeApp.year} icon={Calendar} />
                          <InfoItem label="Department" value={activeApp.department} icon={Briefcase} />
                        </div>
                      </div>

                      {/* Section: Training Details */}
                      <div className="space-y-4 md:col-span-2 pt-6 border-t border-zinc-50">
                        <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] flex items-center gap-2">
                          <BadgeCheck className="w-3 h-3" /> Student Configuration
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Track Selection</p>
                            <p className="text-sm font-bold text-zinc-800">{activeApp.domain}</p>
                          </div>
                          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Duration</p>
                            <p className="text-sm font-bold text-zinc-800">{activeApp.duration}</p>
                          </div>
                          <div className={cn(
                            "p-4 rounded-2xl border",
                            activeApp.mode === 'Offline' ? "bg-orange-50 border-orange-100" : "bg-blue-50 border-blue-100"
                          )}>
                            <p className={cn(
                              "text-[9px] font-black uppercase mb-1",
                              activeApp.mode === 'Offline' ? "text-orange-400" : "text-blue-400"
                            )}>Training Mode</p>
                            <p className="text-sm font-bold text-zinc-800">{activeApp.mode}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-[2rem] bg-zinc-50/50">
                  <Info className="w-8 h-8 text-zinc-300 mb-2" />
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select a course to view your submitted data</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E4E4E7; border-radius: 10px; }
      `}</style>
    </div>
  );
};

/* Internal Helper Component for Info Rows */
interface InfoItemProps {
  label: string;
  value?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const InfoItem = ({ label, value, icon: Icon }: InfoItemProps) => (
  <div className="flex items-start gap-4 group">
    <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div>
      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-wider leading-none mb-1">{label}</p>
      <p className="text-sm font-bold text-zinc-800">{value || "Not Provided"}</p>
    </div>
  </div>
);

export default Dashboard;