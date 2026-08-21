"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, BookOpen, Users, History, Settings, LogOut } from "lucide-react";

import PaymentModal from "@/components/PaymentModel";
import TracksTab from "@/components/TracksTab";
import StudentsTab from "@/components/StudentsTab";
import CollectionsTab from "@/components/CollectionsTab";
import BlogsTab from "@/components/BlogsTab";

type SidebarTab = "tracks" | "students" | "transactions" | "journals";
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
  const [activeTab, setActiveTab] = useState<SidebarTab>("tracks");
  const [view, setView] = useState<FormView>("list");

  const [programs, setPrograms] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [modules, setModules] = useState([{ label: "Day 01", title: "", topics: "", tools: "" }]);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchPrograms = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/programs");
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
            topics: Array.isArray(m.topics) ? m.topics.join(", ") : m.topics || "",
            tools: Array.isArray(m.tools) ? m.tools.join(", ") : m.tools || "",
          }))
        : [{ label: "Day 01", title: "", topics: "", tools: "" }]
    );
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this track?")) return;
    try {
      const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
      if (res.ok) setPrograms((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Network error.");
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) return alert("Title and Slug are required.");
    setUploading(true);
    const payload = {
      slug: formData.slug,
      durationKey: formData.duration,
      variant: {
        title: formData.title,
        subtitle: formData.subtitle,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        heroImg: formData.heroImg,
        syllabus: modules.map((m) => ({
          ...m,
          topics: m.topics.split(",").map((t) => t.trim()).filter(Boolean),
          tools: m.tools.split(",").map((t) => t.trim()).filter(Boolean),
        })),
      },
    };
    const data = new FormData();
    data.append("mainData", JSON.stringify(payload));
    data.append("skipPdf", "true");

    try {
      const res = await fetch("/api/programs/manual-save", { method: "POST", body: data });
      if (res.ok) {
        await fetchPrograms();
        setView("list");
      }
    } catch {
      alert("Network error.");
    } finally {
      setUploading(false);
    }
  };

  const handleExportToExcel = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/payments?download=true");
      const result = await response.json();
      const transactions = result.data || [];

      if (!transactions || transactions.length === 0) {
        setExporting(false);
        return alert("There are currently no audited transactions found in the database layer to export.");
      }

      const headers = [
        "Receipt Number",
        "Date",
        "Student Name",
        "Mobile Number",
        "Institution/College",
        "Domain Selected",
        "Duration",
        "Total Course Fee (INR)",
        "Previously Paid (INR)",
        "Current Paid Now (INR)",
        "Outstanding Balance (INR)",
        "Classification",
        "Channel Mode",
        "UPI Reference Token Id",
        "Billing Authority",
      ];

      const rows = transactions.map((t: any) => [
        t.receiptNo || "N/A",
        t.date || "N/A",
        t.name || "N/A",
        t.phone ? `'${t.phone}` : "N/A",
        t.college || "N/A",
        t.domain || "Web development",
        t.courseName || "1 Month",
        t.totalCoursePayment || 0,
        t.alreadyPaid || 0,
        t.paidAmount || 0,
        t.balanceAmount || 0,
        t.paymentType || "Part Payment",
        t.paymentMethod || "Cash",
        t.transactionId || "N/A",
        t.billingBy || "SYSTEM",
      ]);

      const matrixContent = [headers, ...rows]
        .map((cellsArray: Array<string | number>) =>
          cellsArray
            .map((cell: string | number) => {
              const stringified = String(cell).replace(/"/g, '""');
              return stringified.includes(",") || stringified.includes("\n") || stringified.includes('"')
                ? `"${stringified}"`
                : stringified;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), matrixContent], {
        type: "text/csv;charset=utf-8;",
      });
      const dlUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = dlUrl;
      downloadAnchor.download = `iNetz_Financial_Audit_Ledger_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(dlUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to build tracking report.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      {/* PERSISTENT ADMINISTRATIVE SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-zinc-900 text-zinc-400 p-6 flex flex-col justify-between shrink-0 hidden md:flex border-r border-zinc-800">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <span className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <LayoutDashboard size={20} />
            </span>
            <div>
              <h1 className="text-white text-sm font-black uppercase tracking-wider">iNetz Console</h1>
              <p className="text-[10px] text-zinc-500 font-bold tracking-tight mt-0.5">ADMIN ENVIRONMENT</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab("tracks");
                setView("list");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "tracks"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10"
                  : "hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <BookOpen size={16} /> Track Management
            </button>

            <button
              onClick={() => {
                setActiveTab("students");
                setView("list");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "students"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10"
                  : "hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <Users size={16} /> Student Directory
            </button>

            <button
              onClick={() => {
                setActiveTab("transactions");
                setView("list");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "transactions"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10"
                  : "hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <History size={16} /> Audit Collections
            </button>

            <button
              onClick={() => {
                setActiveTab("journals");
                setView("list");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "journals"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10"
                  : "hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <BookOpen size={16} /> Blogs & Events
            </button>
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-zinc-800/60 text-[11px] font-medium px-2">
          <div className="flex items-center gap-2 hover:text-zinc-200 cursor-pointer transition-colors">
            <Settings size={14} /> System Parameters
          </div>
          <div className="flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer transition-colors">
            <LogOut size={14} /> Kill Session
          </div>
        </div>
      </aside>

      {/* VIEWPORT CONTROLLER SWITCHBOARD FOR ADMIN ROUTINGS */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
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