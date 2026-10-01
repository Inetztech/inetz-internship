"use client";

import React, { useState } from "react";
import { Plus, Loader2, FileSpreadsheet, Calendar, RotateCcw } from "lucide-react";
import TransactionsList from "./TransactionLists";

interface CollectionsTabProps {
  setIsPayOpen: (open: boolean) => void;
}

export default function CollectionsTab({ setIsPayOpen }: CollectionsTabProps) {
  // ─── LOCAL STATE MATRICES ───────────────────────────────────────────────────
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [exporting, setExporting] = useState<boolean>(false);

  // ─── 🎯 SECURE FULL UNPAGINATED EXCEL DISK EXPORTER ───────────────────────
  const handleExportToExcel = async () => {
    setExporting(true);
    try {
      // Direct absolute request mapping bypasses the 20-row UI constraints seamlessly
      const queryUrl = `/api/payments?download=true&startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(queryUrl);
      const result = await response.json();
      const transactions = result.data || [];

      if (!transactions || transactions.length === 0) {
        alert("No transaction ledger records discovered within this filter period to export.");
        setExporting(false);
        return;
      }

      // Build spreadsheet structural rows layout matrix
      const headers = [
        "Receipt Number",
        "Date",
        "Student Name",
        "Mobile Number",
        "Institution/College",
        "Domain Selected",
        "Course Track Duration",
        "Total Course Fee (INR)",
        "Previously Paid (INR)",
        "Current Paid Now (INR)",
        "Outstanding Balance (INR)",
        "Channel Mode",
        "UPI Reference Token Id",
        "Billing Authority"
      ];

      const rows = transactions.map((t: any) => [
        t.receiptNo || "N/A",
        t.date || "N/A",
        t.name || "N/A",
        t.phone ? `'${t.phone}` : "N/A", // The apostrophe prevents Excel from dropping leading zeros
        t.college || "N/A",
        t.domain || "Web development",
        t.courseName || "1 Month",
        t.totalCoursePayment || 0,
        t.alreadyPaidAmount || 0,
        t.paidAmount || 0,
        t.balanceAmount || 0,
        t.paymentMethod || "Cash",
        t.transactionId || "N/A",
        t.billingBy || "SYSTEM"
      ]);

      // Compile content blocks into standard string characters stream matrices
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

      // Set explicit Byte Order Mark (BOM) to parse Indian Rupee Unicode signs cleanly
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), matrixContent], {
        type: "text/csv;charset=utf-8;"
      });
      
      const dlUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = dlUrl;
      
      const dateString = new Date().toISOString().split("T")[0];
      downloadAnchor.download = `iNetz_Financial_Audit_Ledger_${dateString}.csv`;
      
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(dlUrl);
    } catch (err) {
      console.error("Excel generation pipeline failure: ", err);
      alert("System runtime failure compiling spreadsheet ledger matrices.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* HEADER CONTROL BOARD CONTROL SYSTEM */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm gap-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Financial Audit Panel</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Real-time verification ledger records</p>
        </div>

        {/* CONTROLS AREA: ACTIONS & DATE INPUT WRAPPERS */}
        <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
          <div className="space-y-1">
            <label htmlFor="audit-start-date" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Payment from</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input id="audit-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-36 pl-8 pr-2 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="audit-end-date" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Payment until</label>
              {(startDate || endDate) && <button onClick={() => { setStartDate(""); setEndDate(""); }} className="text-[10px] font-bold text-red-600 hover:text-red-700 cursor-pointer" title="Clear payment date filter"><RotateCcw size={11} /> Clear</button>}
            </div>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input id="audit-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-36 pl-8 pr-2 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer" />
            </div>
          </div>

          {/* ⚡ SECTION: ACTION BUTTON GATES */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button 
              onClick={handleExportToExcel}
              disabled={exporting}
              className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-5 py-3 rounded-xl text-xs font-semibold hover:bg-emerald-600 hover:text-white flex items-center gap-2 transition-all disabled:opacity-50 h-10 shrink-0"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} 
              {exporting ? "Compiling Report..." : "Export Excel"}
            </button>
            <button 
              onClick={() => setIsPayOpen(true)} 
              className="bg-zinc-900 text-white px-5 py-3 rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-all flex items-center gap-2 h-10 shrink-0 shadow-sm"
            >
              <Plus size={14} /> New Payment
            </button>
          </div>

        </div>
      </div>

      {/* DATA MATRIX WINDOW INBOUND STREAMS LINKED TO SYSTEM TARGET FILTERS */}
      <TransactionsList startDate={startDate} endDate={endDate} />
      
    </div>
  );
}
