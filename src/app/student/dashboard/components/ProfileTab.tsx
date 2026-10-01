"use client";

import React, { useState } from "react";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Briefcase,
} from "lucide-react";

/* ────────────────── EXPORTED TYPE INTERFACES ────────────────── */

export interface ProfileData {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  domainTrack: string;
  image?: string;
  avatarUrl?: string;
}

export interface ProfileTabProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  loadingProfile: boolean;
  onSaveProfile: (e: React.FormEvent) => Promise<void>;
  savingProfile: boolean;
  profileMsg: { type: "success" | "error"; text: string } | null;
}

export default function ProfileTab({
  profile,
  setProfile,
  loadingProfile,
  onSaveProfile,
  savingProfile,
  profileMsg,
}: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Profile Picture URL
  const profilePhoto = profile.image || profile.avatarUrl;

  const hasExistingDetails = Boolean(profile.fullName && profile.phone && profile.college);

  const handleFormSubmit = async (e: React.FormEvent) => {
    await onSaveProfile(e);
    setIsEditing(false);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Student Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal and internship details.
          </p>
        </div>

        {!loadingProfile && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              isEditing
                ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            }`}
          >
            {isEditing ? (
              <>
                <X size={15} /> Cancel Editing
              </>
            ) : (
              <>
                <Edit3 size={15} /> Edit Profile
              </>
            )}
          </button>
        )}
      </div>

      {/* NOTIFICATIONS */}
      {profileMsg && (
        <div
          className={`flex items-center gap-2.5 rounded-xl border p-4 text-sm font-medium ${
            profileMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {profileMsg.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          {profileMsg.text}
        </div>
      )}

      {/* MAIN CONTENT */}
      {loadingProfile ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-24 text-sm text-slate-500">
          <Loader2 className="animate-spin text-blue-600" size={18} /> Loading profile details...
        </div>
      ) : !isEditing && hasExistingDetails ? (
        
        /* ────────────────── VIEW MODE WITH PROFILE PICTURE ────────────────── */
        <div className="space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              {/* Profile Photo Display */}
              {profilePhoto && !imgError ? (
                <img
                  src={profilePhoto}
                  alt={profile.fullName || "Student Profile"}
                  onError={() => setImgError(true)}
                  className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 shadow-sm shrink-0"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-lg font-semibold text-blue-700">
                  {profile.fullName.charAt(0) || "U"}
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-slate-950">{profile.fullName}</h3>
                <p className="mt-0.5 text-sm text-slate-500">{profile.degree} • {profile.domainTrack}</p>
              </div>
            </div>
            <span className="flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 size={12} className="text-emerald-600" /> Profile Complete
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Mail size={13} className="text-zinc-500" /> Email Address
              </span>
              <p className="text-sm font-semibold text-slate-900">{profile.email || "—"}</p>
            </div>

            <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Phone size={13} className="text-zinc-500" /> Phone Number
              </span>
              <p className="text-sm font-semibold text-slate-900">{profile.phone || "—"}</p>
            </div>

            <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Building size={13} className="text-zinc-500" /> College / Institution
              </span>
              <p className="text-sm font-semibold text-slate-900">{profile.college || "—"}</p>
            </div>

            <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <GraduationCap size={13} className="text-zinc-500" /> Degree Program
              </span>
              <p className="text-sm font-semibold text-slate-900">{profile.degree || "B.E / B.Tech"}</p>
            </div>

            <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:col-span-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Briefcase size={13} className="text-zinc-500" /> Primary Skill Track
              </span>
              <p className="text-sm font-semibold text-slate-900">{profile.domainTrack || "Web Development"}</p>
            </div>

          </div>
        </div>
      ) : (
        
        /* ────────────────── EDIT / FORM MODE ────────────────── */
        <form onSubmit={handleFormSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 [&_input]:text-sm [&_label]:text-sm [&_label]:font-medium [&_select]:text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">College / Institution *</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Loyola College"
                  value={profile.college}
                  onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">Degree / Qualification</label>
              <select
                value={profile.degree}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
              >
                <option value="B.E / B.Tech">B.E / B.Tech</option>
                <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="M.Tech">M.Tech</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">Primary Skill Track</label>
              <select
                value={profile.domainTrack}
                onChange={(e) => setProfile({ ...profile, domainTrack: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
              >
                <option value="Web Development">Web Development (MERN)</option>
                <option value="Python Development">Python Development</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="Java Full Stack">Java Full Stack</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-3">
            {hasExistingDetails && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
