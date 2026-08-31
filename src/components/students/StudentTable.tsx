"use client";

import React from "react";
import { Eye, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Installment {
  receiptNo: string;
  date: string;
  paidAmount: number;
  paymentMethod: string;
  transactionId?: string;
  billingBy: string;
}

export interface StudentRecord {
  _id: string;
  sNo: number;
  studentId?: string;
  doj: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  domain: string;
  duration: string;
  totalBilling: number;
  totalCollection: number;
  pendingAmount: number;
  feesStatus: "Pending" | "Fully Paid" | "Clear" | string;
  certificateStatus: "Pending" | "Issued" | string;
  installments: Installment[];
  createdAt?: string;
}

interface StudentTableProps {
  students: StudentRecord[];
  loading: boolean;
  onOpenEditModal: (student: StudentRecord) => void;
}

export default function StudentTable({ students, loading, onOpenEditModal }: StudentTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm h-64 flex flex-col items-center justify-center text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
        <p className="text-xs font-bold uppercase tracking-wider">Syncing Student Directory...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm py-16 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-zinc-300 mx-auto" />
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">No Student Records Found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/60 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              <th className="py-3.5 px-4">Student ID</th>
              <th className="py-3.5 px-4">Student Name</th>
              <th className="py-3.5 px-4">Contact Info</th>
              <th className="py-3.5 px-4">Domain</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Total Fees</th>
              <th className="py-3.5 px-4">Fee Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs font-medium text-zinc-700">
            {students.map((st) => (
              <tr key={st._id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-800">
                    {st.studentId || `#${st.sNo || "N/A"}`}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-zinc-900">{st.name}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-mono text-zinc-800">{st.phone}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-zinc-800 truncate max-w-[180px]">{st.domain}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-zinc-800 truncate max-w-[180px]">{st.duration}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-zinc-800 truncate max-w-[180px]">{st.totalBilling}</p>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider",
                      st.pendingAmount <= 0 || st.feesStatus === "Clear" || st.feesStatus === "Fully Paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}
                  >
                    {st.pendingAmount <= 0 ? "Clear" : `Due: ₹${st.pendingAmount}`}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onOpenEditModal(st)}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ml-auto cursor-pointer"
                  >
                    <Eye size={12} /> View / Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}