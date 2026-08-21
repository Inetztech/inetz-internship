"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, RefreshCw, BookOpen, Save, ArrowLeft, Loader2, Image as ImageIcon, Video, Star } from "lucide-react";

interface BlogsTabProps {
  view: "list" | "form";
  setView: (view: "list" | "form") => void;
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Activities",
  author: "Inetz Admin",
  readTime: "5 min read",
  date: new Date().toISOString().substring(0, 10),
  isFeatured: false,
  image: "",
  videoUrl: "",
  galleryImages: [] as string[],
};

const CATEGORIES = ["PROJECTS", "ACHIEVEMENTS", "WEB DEVELOPMENT", "JAVA FULL STACK", "DATA ANALYTICS","DATA SCIENCE","JAVASCRIPT","REACT JS","ARTIFICIAL INTELLIGENCE","MACHINE LEARNING"];

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

const AdminTextarea = ({ placeholder, value, onChange, rows = 4 }: any) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(e.target.value)}
    rows={rows}
    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm text-zinc-800 placeholder:text-zinc-300 outline-none focus:border-emerald-400 focus:bg-white transition-all resize-y"
  />
);

export default function BlogsTab({ view, setView }: BlogsTabProps) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchBlogs = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/blogs");
      if (res.ok) setBlogs(await res.json());
    } catch { /* silent */ }
    finally { setListLoading(false); }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleNew = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, date: new Date().toISOString().substring(0, 10) });
    setView("form");
  };

  const handleEdit = (p: any) => {
    setEditingId(p._id);
    setFormData({
      title: p.title || "",
      slug: p.slug || "",
      excerpt: p.excerpt || "",
      content: p.content || "",
      category: p.category || "Activities",
      author: p.author || "Inetz Admin",
      readTime: p.readTime || "5 min read",
      date: p.date ? new Date(p.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
      isFeatured: p.isFeatured || false,
      image: p.image || p.mediaUrl || "",
      videoUrl: p.videoUrl || "",
      galleryImages: p.galleryImages || [],
    });
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog entry?")) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.ok) setBlogs(prev => prev.filter(p => p._id !== id));
    } catch { alert("Network error."); }
  };

  const handleSave = async () => {
    if (!formData.title) return alert("Title is required.");
    
    // Auto-generate slug from title if missing
    let finalSlug = formData.slug;
    if (!finalSlug) {
      finalSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(f => ({ ...f, slug: finalSlug }));
    }
    
    const payload = { ...formData, slug: finalSlug };
    
    setUploading(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/blogs/${editingId}` : "/api/blogs";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchBlogs();
        setView("list");
      } else {
        alert("Failed to save journal");
      }
    } catch (e) {
      console.error(e);
      alert("Network error.");
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "galleryImages") => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (field === "image") {
          setFormData(prev => ({ ...prev, image: base64String }));
        } else {
          setFormData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, base64String] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  if (view === "list") {
    return (
      <div className="space-y-8 animate-in fade-in duration-150">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Blogs & Events</h1>
            <p className="text-zinc-400 text-sm mt-1">{blogs.length} posts published</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchBlogs} className="p-3 rounded-2xl border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-700 transition-colors">
              <RefreshCw size={16} className={listLoading ? "animate-spin" : ""} />
            </button>
            <button onClick={handleNew} className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 h-11">
              <Plus size={14} /> New Post
            </button>
          </div>
        </div>

        {listLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded-[2rem] border border-zinc-100 animate-pulse" />)}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-32">
            <BookOpen className="mx-auto text-zinc-300 mb-4" size={24} />
            <p className="font-bold text-zinc-400 text-sm">No blog entries yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(p => (
              <div key={p._id} className="group bg-white rounded-[2rem] border border-zinc-100 hover:border-zinc-200 hover:shadow-xl transition-all overflow-hidden">
                <div className="h-36 bg-gradient-to-br from-zinc-100 to-zinc-50 relative flex items-center justify-center overflow-hidden">
                  {p.isFeatured && (
                    <span className="absolute top-3 left-3 bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1">
                      <Star size={10} /> Featured
                    </span>
                  )}
                  {p.image || p.mediaUrl ? (
                    <img src={p.image || p.mediaUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                  ) : (
                    <BookOpen className="text-zinc-200" size={32} />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h2 className="font-black text-zinc-900 text-sm leading-tight line-clamp-1">{p.title}</h2>
                      <p className="text-zinc-400 text-[10px] line-clamp-1 mt-1">{p.category} • {new Date(p.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
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
          <div><h1 className="text-3xl font-black text-zinc-900 tracking-tight">{editingId ? "Edit Post" : "New Post"}</h1></div>
        </div>
        <button onClick={handleSave} disabled={uploading} className="bg-zinc-900 text-white px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center gap-2 disabled:opacity-60">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
          {uploading ? "Saving..." : "Publish Post"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-4">
            <SectionHeader label="Post Content" />
            <AdminInput placeholder="Post Title" value={formData.title} onChange={(v: string) => setFormData((f: any) => ({ ...f, title: v }))} />
            <AdminTextarea placeholder="Excerpt (Short summary)" value={formData.excerpt} onChange={(v: string) => setFormData((f: any) => ({ ...f, excerpt: v }))} />
            <div className="pt-2">
              <label className="text-xs font-semibold text-zinc-600 mb-2 block">Main Content (HTML/Markdown supported)</label>
              <AdminTextarea placeholder="<p>Full article content goes here...</p>" value={formData.content} onChange={(v: string) => setFormData((f: any) => ({ ...f, content: v }))} rows={12} />
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <SectionHeader label="Gallery Images (Optional)" />
              <label className="cursor-pointer text-[10px] font-bold uppercase tracking-widest bg-zinc-100 px-4 py-2 rounded-xl hover:bg-zinc-200 flex items-center gap-2">
                <Plus size={12} /> Add Images
                <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "galleryImages")} />
              </label>
            </div>
            {formData.galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.galleryImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video bg-zinc-100 border border-zinc-200">
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeGalleryImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400 text-xs">No gallery images added</div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-4">
            <SectionHeader label="Settings" />

            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 cursor-pointer" onClick={() => setFormData(f => ({ ...f, isFeatured: !f.isFeatured }))}>
              <div className={`w-5 h-5 rounded flex items-center justify-center border ${formData.isFeatured ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-300 bg-white'}`}>
                {formData.isFeatured && <Star size={12} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800">Featured Story</p>
                <p className="text-[10px] text-zinc-500">Show prominently on the blog page</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-zinc-600 mb-1 block">Category</label>
              <select value={formData.category} onChange={e => setFormData((f: any) => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm text-zinc-800 outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600 mb-1 block">Publish Date</label>
              <AdminInput type="date" value={formData.date} onChange={(v: string) => setFormData((f: any) => ({ ...f, date: v }))} />
            </div>

            <AdminInput placeholder="Author Name" value={formData.author} onChange={(v: string) => setFormData((f: any) => ({ ...f, author: v }))} />
            <AdminInput placeholder="Read Time (e.g., 5 min read)" value={formData.readTime} onChange={(v: string) => setFormData((f: any) => ({ ...f, readTime: v }))} />
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-4">
            <SectionHeader label="Media" />

            <div>
              <label className="text-xs font-semibold text-zinc-600 mb-2 flex justify-between items-center">
                Featured Image
                <span className="relative overflow-hidden cursor-pointer text-[10px] bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded">
                  Upload <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImageUpload(e, "image")} />
                </span>
              </label>
              {formData.image ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 group">
                  <img src={formData.image} alt="Featured" className="w-full h-full object-cover" />
                  <button onClick={() => setFormData(f => ({ ...f, image: "" }))} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-zinc-50 rounded-xl border border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400">
                  <ImageIcon size={24} className="mb-2" />
                  <span className="text-[10px]">No image selected</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-zinc-600 mb-1 block flex items-center gap-1">
                <Video size={12} /> Video Embed URL
              </label>
              <AdminInput placeholder="https://youtube.com/..." value={formData.videoUrl} onChange={(v: string) => setFormData((f: any) => ({ ...f, videoUrl: v }))} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
