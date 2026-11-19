"use client";

import React from "react";
import { Plus, Trash2, Layers, Pencil, RefreshCw, BookOpen, IndianRupee, Save, ArrowLeft, Loader2 } from "lucide-react";

interface TracksTabProps {
  view: "list" | "form";
  setView: (view: "list" | "form") => void;
  programs: any[];
  listLoading: boolean;
  uploading: boolean;
  editingId: string | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  modules: any[];
  setModules: React.Dispatch<React.SetStateAction<any[]>>;
  fetchPrograms: () => Promise<void>;
  handleNew: () => void;
  handleEdit: (p: any) => void;
  handleDelete: (id: string) => void;
  handleSave: () => Promise<void>;
  setIsPayOpen: (open: boolean) => void;
}

const DURATIONS = ["1 Week", "2 Weeks", "1 Month", "3 Months"];

const SectionHeader = ({ label }: { label: string }) => (
  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-5 select-none">{label}</h3>
);

const AdminInput = ({ placeholder, value, onChange, type = "text" }: any) => (
  <input
    type={type} 
    placeholder={placeholder} 
    value={value} 
    onChange={e => onChange(e.target.value)}
    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm text-zinc-800 placeholder:text-zinc-300 outline-none focus:border-emerald-400 focus:bg-white transition-all"
  />
);

export default function TracksTab({
  view, setView, programs, listLoading, uploading, editingId,
  formData, setFormData, modules, setModules, fetchPrograms,
  handleNew, handleEdit, handleDelete, handleSave, setIsPayOpen
}: TracksTabProps) {
  
  const handleUpdateModuleField = (index: number, key: string, value: string) => {
    setModules(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, [key]: value };
    }));
  };

  if (view === "list") {
    return (
      <div className="space-y-8 animate-in fade-in duration-150">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Track Management</h1>
            <p className="text-zinc-500 text-sm mt-1">{programs.length} published track variants</p>
          </div>
          <div className="flex items-center gap-3">
            <button title="Refresh tracks" onClick={fetchPrograms} className="p-3 rounded-2xl border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-700 transition-colors">
              <RefreshCw size={16} className={listLoading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setIsPayOpen(true)} className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 h-11">
              <CreditCardIcon size={14} /> New Payment
            </button>
            <button onClick={handleNew} className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 h-11">
              <Plus size={14} /> New Track
            </button>
          </div>
        </div>

        {listLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded-[2rem] border border-zinc-100 animate-pulse" />)}
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-32">
            <BookOpen className="mx-auto text-zinc-300 mb-4" size={24} />
            <p className="font-bold text-zinc-400 text-sm">No tracks yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map(p => (
              <div key={p._id} className="group bg-white rounded-[2rem] border border-zinc-100 hover:border-zinc-200 hover:shadow-xl transition-all overflow-hidden">
                <div className="h-36 bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center overflow-hidden">
                  {p.heroImg ? <img src={p.heroImg} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" /> : <BookOpen className="text-zinc-200" size={32} />}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h2 className="font-black text-zinc-900 text-sm leading-tight">{p.title}</h2>
                      {p.subtitle && <p className="text-zinc-400 text-[10px] line-clamp-1">{p.subtitle}</p>}
                    </div>
                    {p.duration && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full h-fit shrink-0">{p.duration}</span>}
                  </div>
                  <div className="flex gap-3 text-[10px] text-zinc-400 mb-5">
                    {p.price != null && <span className="flex items-center gap-0.5"><IndianRupee size={10} /> {p.price}</span>}
                    {p.syllabus?.length ? <span className="flex items-center gap-0.5"><Layers size={10} /> {p.syllabus.length} modules</span> : null}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-600">
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-150">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => setView("list")} className="p-2.5 rounded-2xl border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-700 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div><h1 className="text-3xl font-black text-zinc-900 tracking-tight">{editingId ? "Edit Track" : "New Track"}</h1></div>
        </div>
        <button onClick={handleSave} disabled={uploading} className="bg-zinc-900 text-white px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center gap-2 disabled:opacity-60">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
          {uploading ? "Saving..." : editingId ? "Save Changes" : "Publish Track"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-4">
            <SectionHeader label="Identity & Duration" />
            <AdminInput placeholder="Course Title" value={formData.title} onChange={(v: string) => setFormData((f: any) => ({ ...f, title: v }))} />
            <AdminInput placeholder="Slug" value={formData.slug} onChange={(v: string) => setFormData((f: any) => ({ ...f, slug: v }))} />
            <p className="px-1 text-[10px] text-zinc-400">Use track-duration, for example python-3-months.</p>
            <select value={formData.duration} onChange={e => setFormData((f: any) => ({ ...f, duration: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm text-zinc-800 outline-none">
              {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </section>
          <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-4">
            <SectionHeader label="Commercials & Visuals" />
            <AdminInput placeholder="Short Subtitle" value={formData.subtitle} onChange={(v: string) => setFormData((f: any) => ({ ...f, subtitle: v }))} />
            <AdminInput placeholder="Sale Price (₹)" type="number" value={formData.price} onChange={(v: string) => setFormData((f: any) => ({ ...f, price: v }))} />
            <AdminInput placeholder="Original Price (₹)" type="number" value={formData.originalPrice} onChange={(v: string) => setFormData((f: any) => ({ ...f, originalPrice: v }))} />
            <AdminInput placeholder="Hero Image URL" value={formData.heroImg} onChange={(v: string) => setFormData((f: any) => ({ ...f, heroImg: v }))} />
          </section>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-zinc-400" />
                <SectionHeader label="Curriculum" />
              </div>
              <button onClick={() => setModules(m => [...m, { label: `Day ${String(m.length + 1).padStart(2, "0")}`, title: "", topics: "", tools: "" }])} className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-600 hover:text-white transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {modules.map((m, i) => (
                <div key={i} className="p-6 bg-zinc-50 rounded-3xl space-y-3 relative group border border-transparent hover:border-zinc-200">
                  <div className="flex gap-4">
                    <input placeholder="Label" value={m.label} onChange={e => handleUpdateModuleField(i, "label", e.target.value)} className="w-24 font-bold text-[10px] text-emerald-600 bg-transparent outline-none uppercase" />
                    <input placeholder="Module Title" value={m.title} onChange={e => handleUpdateModuleField(i, "title", e.target.value)} className="flex-1 font-bold text-zinc-900 bg-transparent outline-none border-b border-zinc-200" />
                  </div>
                  <input placeholder="Topics (comma separated)" value={m.topics} onChange={e => handleUpdateModuleField(i, "topics", e.target.value)} className="w-full text-xs text-zinc-500 bg-transparent outline-none" />
                  <input placeholder="Tools (comma separated)" value={m.tools} onChange={e => handleUpdateModuleField(i, "tools", e.target.value)} className="w-full text-xs text-zinc-500 bg-transparent outline-none" />
                  <button onClick={() => setModules(modules.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline localized replacement icon
function CreditCardIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
