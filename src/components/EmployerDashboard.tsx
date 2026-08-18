"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Briefcase,
  Users,
  Search,
  Plus,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  Trash2,
  Edit,
  X,
  Loader2,
  Globe,
  Award,
} from "lucide-react";

export interface EmployerRecord {
  _id: string;
  companyName: string;
  website?: string;
  industry: string;
  location: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  openingsCount: number;
  placedCount: number;
  partnershipStatus: "Active" | "Partnered" | "Under Review" | "Inactive";
  joinedDate?: string;
}

const DEFAULT_EMPLOYERS: EmployerRecord[] = [
  {
    _id: "emp_1",
    companyName: "Zoho Corporation",
    website: "https://zoho.com",
    industry: "SaaS / Cloud Software",
    location: "Chennai, TN",
    contactPerson: "Rajesh Kannan",
    contactEmail: "careers@zohocorp.com",
    contactPhone: "+91 98401 23456",
    openingsCount: 8,
    placedCount: 24,
    partnershipStatus: "Partnered",
    joinedDate: "12 Jan 2026",
  },
  {
    _id: "emp_2",
    companyName: "Freshworks",
    website: "https://freshworks.com",
    industry: "Enterprise Product",
    location: "Chennai, TN",
    contactPerson: "Swetha Narayanan",
    contactEmail: "talent@freshworks.com",
    contactPhone: "+91 97910 88231",
    openingsCount: 5,
    placedCount: 16,
    partnershipStatus: "Partnered",
    joinedDate: "05 Feb 2026",
  },
  {
    _id: "emp_3",
    companyName: "Cognizant Technology Solutions",
    website: "https://cognizant.com",
    industry: "IT Services & Consulting",
    location: "Chennai, TN",
    contactPerson: "Anand Sundaram",
    contactEmail: "campus.hiring@cognizant.com",
    contactPhone: "+91 94440 19283",
    openingsCount: 12,
    placedCount: 42,
    partnershipStatus: "Active",
    joinedDate: "20 Nov 2025",
  },
  {
    _id: "emp_4",
    companyName: "Paymob Tech",
    website: "https://paymob.com",
    industry: "FinTech & Payments",
    location: "Bangalore, KA",
    contactPerson: "Dinesh Babu",
    contactEmail: "hr@paymobtech.io",
    contactPhone: "+91 90030 55412",
    openingsCount: 3,
    placedCount: 7,
    partnershipStatus: "Under Review",
    joinedDate: "01 Aug 2026",
  },
];

export default function EmployerDashboard() {
  const [employers, setEmployers] = useState<EmployerRecord[]>(DEFAULT_EMPLOYERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    industry: "IT Services & Software",
    location: "Chennai, TN",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    openingsCount: 1,
    partnershipStatus: "Active" as EmployerRecord["partnershipStatus"],
  });

  // Extract unique industries for filter dropdown
  const availableIndustries = useMemo(() => {
    const set = new Set(employers.map((e) => e.industry).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [employers]);

  // Client-Side Filter Matrix
  const filteredEmployers = useMemo(() => {
    return employers.filter((emp) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        emp.companyName.toLowerCase().includes(q) ||
        emp.contactPerson.toLowerCase().includes(q) ||
        emp.location.toLowerCase().includes(q) ||
        emp.contactEmail.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "All" ||
        emp.partnershipStatus.toLowerCase() === statusFilter.toLowerCase();

      const matchIndustry =
        industryFilter === "All" ||
        emp.industry.toLowerCase() === industryFilter.toLowerCase();

      return matchSearch && matchStatus && matchIndustry;
    });
  }, [employers, search, statusFilter, industryFilter]);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalCompanies = employers.length;
    const totalOpenings = employers.reduce((acc, e) => acc + (Number(e.openingsCount) || 0), 0);
    const totalPlaced = employers.reduce((acc, e) => acc + (Number(e.placedCount) || 0), 0);
    const activePartners = employers.filter(
      (e) => e.partnershipStatus === "Partnered" || e.partnershipStatus === "Active"
    ).length;

    return { totalCompanies, totalOpenings, totalPlaced, activePartners };
  }, [employers]);

  const handleAddEmployer = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: EmployerRecord = {
      _id: `emp_${Date.now()}`,
      ...formData,
      placedCount: 0,
      joinedDate: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
    setEmployers((prev) => [newRecord, ...prev]);
    setIsAddModalOpen(false);
    setFormData({
      companyName: "",
      website: "",
      industry: "IT Services & Software",
      location: "Chennai, TN",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      openingsCount: 1,
      partnershipStatus: "Active",
    });
  };

  const handleDeleteEmployer = (id: string) => {
    if (!confirm("Are you sure you want to remove this employer record?")) return;
    setEmployers((prev) => prev.filter((e) => e._id !== id));
  };

  return (
    <div className="space-y-6">
      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              Corporate Network
            </p>
            <h3 className="text-2xl font-black text-zinc-900 mt-1">
              {summary.totalCompanies}
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600 mt-0.5 inline-flex items-center gap-1">
              <CheckCircle2 size={11} /> {summary.activePartners} Active MoUs
            </span>
          </div>
          <div className="w-12 h-12 bg-zinc-100 text-zinc-700 rounded-2xl flex items-center justify-center">
            <Building2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
              Active Job Openings
            </p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">
              {summary.totalOpenings}
            </h3>
            <span className="text-[10px] font-semibold text-zinc-400 mt-0.5 block">
              Across partner portals
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sky-100/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-sky-600 tracking-wider">
              Students Placed
            </p>
            <h3 className="text-2xl font-black text-sky-700 mt-1">
              {summary.totalPlaced}
            </h3>
            <span className="text-[10px] font-semibold text-zinc-400 mt-0.5 block">
              Verified campus conversions
            </span>
          </div>
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
            <Award size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
              Placement Rate
            </p>
            <h3 className="text-2xl font-black text-amber-700 mt-1">
              94.2%
            </h3>
            <span className="text-[10px] font-semibold text-zinc-400 mt-0.5 block">
              Direct recruitment drive
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* ── MAIN DIRECTORY CARD ── */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden space-y-4">
        {/* Controls & Search Strip */}
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-md text-[9px] font-black uppercase tracking-widest">
                Placements
              </span>
              <h2 className="text-base font-black text-zinc-900 uppercase tracking-tight">
                Corporate Hiring Partners
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Manage enterprise relationships, recruitment contacts, and open vacancies
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input
                type="text"
                placeholder="Search company, HR, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:text-zinc-400"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Partnered">Partnered</option>
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>

            {/* Add Employer Trigger Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus size={15} /> Add Employer
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="w-full overflow-x-auto">
          {filteredEmployers.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 text-xs font-medium space-y-2">
              <Building2 size={32} className="mx-auto text-zinc-300" />
              <p>No employer records match the current filter parameters.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black uppercase tracking-wider text-zinc-400 select-none">
                  <th className="py-4 px-6">Company & Domain</th>
                  <th className="py-4 px-6">HR / Talent Contact</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Hiring Pipeline</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredEmployers.map((emp) => (
                  <tr key={emp._id} className="hover:bg-zinc-50/70 transition-colors duration-150 group">
                    {/* Company Info */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                        <span>{emp.companyName}</span>
                        {emp.website && (
                          <a
                            href={emp.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-400 hover:text-emerald-600"
                            title="Visit website"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-zinc-100 text-zinc-600 font-semibold rounded text-[10px]">
                        {emp.industry}
                      </span>
                    </td>

                    {/* Contact Person */}
                    <td className="py-4 px-6 space-y-0.5">
                      <div className="font-semibold text-zinc-800">{emp.contactPerson}</div>
                      <div className="text-zinc-400 text-[11px] flex items-center gap-1">
                        <Mail size={11} /> {emp.contactEmail}
                      </div>
                      <div className="text-zinc-400 text-[11px] font-mono flex items-center gap-1">
                        <Phone size={11} /> {emp.contactPhone}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6 text-zinc-600 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="text-zinc-400" />
                        {emp.location}
                      </div>
                    </td>

                    {/* Pipeline / Stats */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {emp.openingsCount} Openings
                        </span>
                        <span className="text-zinc-400 text-[11px]">
                          • {emp.placedCount} Placed
                        </span>
                      </div>
                    </td>

                    {/* Partnership Badge */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          emp.partnershipStatus === "Partnered"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : emp.partnershipStatus === "Active"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {emp.partnershipStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedEmployer(emp)}
                          className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 rounded-xl transition-all"
                          title="View partner dossier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployer(emp._id)}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Remove employer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── ADD EMPLOYER MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
                  Network Onboarding
                </span>
                <h3 className="text-xl font-black text-zinc-900">Add New Hiring Partner</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg text-sm font-bold"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEmployer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Infosys, TCS, Startup"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Industry Track *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SaaS / Product Development"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai, TN"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Contact Person (HR/Lead) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya R"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="talent@company.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98400 00000"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Initial Openings</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.openingsCount}
                    onChange={(e) => setFormData({ ...formData, openingsCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW EMPLOYER DOSSIER MODAL ── */}
      {selectedEmployer && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedEmployer(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-zinc-900">{selectedEmployer.companyName}</h3>
                <p className="text-xs text-zinc-400 font-medium">{selectedEmployer.industry}</p>
              </div>
              <button
                onClick={() => setSelectedEmployer(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Primary Recruiter</span>
                <p className="font-bold text-zinc-800">{selectedEmployer.contactPerson}</p>
                <p className="text-zinc-500">{selectedEmployer.contactEmail} • {selectedEmployer.contactPhone}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Openings</span>
                  <p className="text-xl font-black text-emerald-700 mt-0.5">{selectedEmployer.openingsCount}</p>
                </div>
                <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-sky-600 uppercase">Students Placed</span>
                  <p className="text-xl font-black text-sky-700 mt-0.5">{selectedEmployer.placedCount}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setSelectedEmployer(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}