"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  History,
  Settings,
  LogOut,
} from "lucide-react";

import PaymentModal from "@/components/PaymentModel";
import TracksTab from "@/components/TracksTab";
import StudentsTab from "@/components/StudentsTab";
import CollectionsTab from "@/components/CollectionsTab";
import BlogsTab from "@/components/BlogsTab";
import CeoOverviewTab from "@/components/CeoOverviewTab";

type SidebarTab =
  | "overview"
  | "tracks"
  | "students"
  | "transactions"
  | "journals";
type FormView = "list" | "form";

const EMPTY_FORM = {
  title: "",
  slug: "",
  subtitle: "",
  duration: "1 Week",
  price: "",
  originalPrice: "",
  heroImg: "",
};

export default function AdminPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "super_admin";
  const [activeTab, setActiveTab] = useState<SidebarTab>("students");
  const [view, setView] = useState<FormView>("list");

  const [programs, setPrograms] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [modules, setModules] = useState([
    { label: "Day 01", title: "", topics: "", tools: "" },
  ]);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const navigationTabs: SidebarTab[] = isSuperAdmin
    ? ["overview", "students", "transactions", "tracks", "journals"]
    : ["students", "transactions", "tracks", "journals"];

  const fetchPrograms = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/programs?full=true", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPrograms(Array.isArray(data) ? data : data.programs || []);
      }
    } catch {
      /* silent */
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  useEffect(() => {
    if (isSuperAdmin) setActiveTab("overview");
  }, [isSuperAdmin]);

  const handleNew = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setModules([{ label: "Day 01", title: "", topics: "", tools: "" }]);
    setView("form");
  };

  const handleEdit = (p: any) => {
    setEditingId(p._id);
    setFormData({
      title: p.title || "",
      slug: p.slug || "",
      subtitle: p.subtitle || "",
      duration: p.duration || "1 Week",
      price: p.price?.toString() || "",
      originalPrice: p.originalPrice?.toString() || "",
      heroImg: p.heroImg || "",
    });
    setModules(
      p.syllabus?.length
        ? p.syllabus.map((m: any) => ({
            ...m,
            topics: Array.isArray(m.topics)
              ? m.topics.join(", ")
              : m.topics || "",
            tools: Array.isArray(m.tools) ? m.tools.join(", ") : m.tools || "",
          }))
        : [{ label: "Day 01", title: "", topics: "", tools: "" }],
    );
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this track?")) return;
    try {
      const res = await fetch("/api/programs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) return alert((await res.json()).error || "Unable to delete track.");
      setPrograms((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Network error.");
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug)
      return alert("Title and Slug are required.");
    setUploading(true);
    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      syllabus: modules.map((m) => ({
        ...m,
        topics: m.topics.split(",").map((t) => t.trim()).filter(Boolean),
        tools: m.tools.split(",").map((t) => t.trim()).filter(Boolean),
      })),
    };

    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return alert((await res.json()).error || "Unable to publish track.");
      await fetchPrograms();
      setView("list");
    } catch {
      alert("Network error.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-shell flex min-h-screen bg-slate-100 font-sans">
      {/* PERSISTENT ADMINISTRATIVE SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-950 text-slate-400 p-6 flex flex-col justify-between shrink-0 hidden md:flex border-r border-slate-800 shadow-2xl shadow-slate-950/10">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <span className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/30">
              <LayoutDashboard size={20} />
            </span>
            <div>
              <h1 className="text-white text-[15px] font-bold tracking-tight">
                iNetz Console
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide mt-0.5">
                ADMIN WORKSPACE
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {session?.user?.role === "super_admin" && (
              <button
                onClick={() => {
                  setActiveTab("overview");
                  setView("list");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-semibold tracking-normal transition-all cursor-pointer ${activeTab === "overview" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/30" : "hover:bg-slate-800 hover:text-slate-100"}`}
              >
                <LayoutDashboard size={16} /> CEO Overview
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab("students");
                setView("list");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-semibold tracking-normal transition-all cursor-pointer ${
                activeTab === "students"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/30"
                  : "hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <Users size={16} /> Student Directory
            </button>

            <button
              onClick={() => {
                setActiveTab("transactions");
                setView("list");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-semibold tracking-normal transition-all cursor-pointer ${
                activeTab === "transactions"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/30"
                  : "hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <History size={16} /> Transactions
            </button>

            <button
              onClick={() => {
                setActiveTab("tracks");
                setView("list");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-semibold tracking-normal transition-all cursor-pointer ${
                activeTab === "tracks"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/30"
                  : "hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <BookOpen size={16} /> Track Management
            </button>

            <button
              onClick={() => {
                setActiveTab("journals");
                setView("list");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-semibold tracking-normal transition-all cursor-pointer ${
                activeTab === "journals"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/30"
                  : "hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <BookOpen size={16} /> Blogs & Events
            </button>

          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-800 text-xs font-medium px-2">
          <div className="flex items-center gap-2 hover:text-slate-100 cursor-pointer transition-colors">
            <Settings size={14} /> System Parameters
          </div>
          <div className="flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer transition-colors">
            <LogOut size={14} /> Kill Session
          </div>
        </div>
      </aside>

      {/* VIEWPORT CONTROLLER SWITCHBOARD FOR ADMIN ROUTINGS */}
      <main className="flex-1 overflow-y-auto h-screen bg-slate-50 p-6 md:p-12">
        <div className="mx-auto max-w-7xl">
          <nav
            className="mb-6 flex gap-2 overflow-x-auto md:hidden"
            aria-label="Admin sections"
          >
            {navigationTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setView("list");
                }}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold capitalize ${activeTab === tab ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
              >
                {tab === "overview"
                  ? "CEO Overview"
                  : tab === "tracks"
                    ? "Tracks"
                    : tab === "students"
                      ? "Students"
                      : tab === "transactions"
                        ? "Collections"
                        : "Blogs"}
              </button>
            ))}
          </nav>
          {session?.user?.role === "super_admin" &&
            activeTab === "overview" && <CeoOverviewTab />}
          {activeTab === "tracks" && (
            <TracksTab
              view={view}
              setView={setView}
              programs={programs}
              listLoading={listLoading}
              uploading={uploading}
              editingId={editingId}
              formData={formData}
              setFormData={setFormData}
              modules={modules}
              setModules={setModules}
              fetchPrograms={fetchPrograms}
              handleNew={handleNew}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleSave={handleSave}
              setIsPayOpen={setIsPayOpen}
            />
          )}

          {activeTab === "students" && <StudentsTab />}

          {activeTab === "transactions" && (
            <CollectionsTab setIsPayOpen={setIsPayOpen} />
          )}

          {activeTab === "journals" && (
            <BlogsTab view={view as any} setView={setView as any} />
          )}
        </div>
      </main>

      {isPayOpen && (
        <PaymentModal programs={programs} onClose={() => setIsPayOpen(false)} />
      )}
    </div>
  );
}
