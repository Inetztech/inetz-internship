"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2, ArrowLeftRight, Calendar, User, CreditCard,
  Building, Eye, X, Printer, FileText, ChevronLeft, ChevronRight, Search
} from "lucide-react";
import { generateReceiptHtml } from "./receiptTemplate";

// ── Types ──────────────────────────────────────────────────────────────────────

type PaymentMethod = "Cash" | "GPay" | "UPI" | "Card" | "Netbanking" | "Wallet" | "EMI" | "Razorpay Online";

interface Transaction {
  receiptNo: string;
  date: string;
  name: string;
  phone: string;
  college: string;
  domain: string;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  billingBy: string;
  totalCoursePayment: number;
  alreadyPaid: number;
  courseName: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const METHOD_STYLES: Record<PaymentMethod, string> = {
  GPay: "bg-blue-50 text-blue-700 border border-blue-100",
  UPI: "bg-blue-50 text-blue-700 border border-blue-100",
  Card: "bg-violet-50 text-violet-700 border border-violet-100",
  Netbanking: "bg-cyan-50 text-cyan-700 border border-cyan-100",
  Wallet: "bg-purple-50 text-purple-700 border border-purple-100",
  EMI: "bg-orange-50 text-orange-700 border border-orange-100",
  "Razorpay Online": "bg-emerald-50 text-emerald-700 border border-emerald-100",
  Cash: "bg-amber-50 text-amber-700 border border-amber-100",
};

const TABLE_HEADERS = [
  "Receipt / Date",
  "Student Information",
  "Course Domain",
  "Payment Stream",
  "Authority",
  "Actions",
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function normalizeTransaction(item: any): Transaction {
  const num = (v: any) => Number(v) || 0;
  
  // Extracting keys safely using standard logical short-circuits
  const totalCoursePayment = num(item.totalCoursePayment || item.paidAmount || 0);
  const alreadyPaid = num(item.alreadyPaidAmount || item.alreadyPaid || 0);

  let rawMethod = item.paymentMethod || item.method || "Cash";
  if (rawMethod === 0 || rawMethod === "0" || typeof rawMethod !== "string") {
    rawMethod = "Cash";
  }
  
  const paymentMethod = (rawMethod === "G-Pay" ? "GPay" : rawMethod) as PaymentMethod;

  return {
    receiptNo:          String(item.receiptNo          || "MIG-DATA"),
    date:               String(item.date               || "N/A"),
    name:               String(item.name               || "N/A"),
    phone:              String(item.phone              || "N/A"),
    college:            String(item.college            || "N/A"),
    domain:             String(item.domain             || "Web development"),
    paidAmount:         num(item.paidAmount),
    paymentMethod,
    transactionId:      String(item.transactionId      || "N/A"),
    billingBy:          String(item.billingBy          || "SYSTEM"),
    totalCoursePayment,
    alreadyPaid,
    courseName:         String(item.courseName         || "1 Month"),
  };
}

function inr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="w-full py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
      <Loader2 className="animate-spin text-emerald-600" size={32} />
      <span className="text-sm font-medium">Loading live transactions registry...</span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="w-full my-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-center text-sm font-semibold text-red-800">
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-zinc-400 text-sm font-medium">
      No dynamic transaction entries discovered inside active databases.
    </div>
  );
}

interface ModalProps {
  tx: Transaction;
  onClose: () => void;
  onPrint: () => void;
  onDownload: () => void;
}

function AuditModal({ tx, onClose, onPrint, onDownload }: ModalProps) {
  const fields: [string, React.ReactNode][] = [
    ["Receipt",           <span key="receipt" className="font-mono text-zinc-900">{tx.receiptNo}</span>],
    ["Student",           <span key="student" className="text-zinc-900 font-semibold">{tx.name} ({tx.phone})</span>],
    ["College",           tx.college],
    ["Domain",            tx.domain],
    ["Amount Processed",  <span key="amount" className="text-emerald-600 font-bold text-sm">{inr(tx.paidAmount)} ({tx.paymentMethod})</span>],
    ...(tx.alreadyPaid > 0
      ? [["Previously Paid", <span key="previous" className="text-zinc-700 font-semibold">{inr(tx.alreadyPaid)}</span>] as [string, React.ReactNode]]
      : []),
    ["Authorized By",     tx.billingBy],
  ];

  return (
    <div className="fixed inset-0 z-[1000] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-zinc-100 p-6 space-y-4">

        <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider text-emerald-600">
            Audit Verification
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <dl className="space-y-2.5 text-xs text-zinc-600">
          {fields.map(([label, value]) => (
            <div key={label}>
              <strong>{label}:</strong> {value}
            </div>
          ))}
        </dl>

        <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100">
          <button onClick={onClose} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl">
            Close
          </button>
          <button onClick={onPrint} className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all">
            <Printer size={13} /> Print
          </button>
          <button onClick={onDownload} className="px-4 py-2 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all">
            <FileText size={13} /> Download
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [selectedTx, setSelectedTx]     = useState<Transaction | null>(null);

  // Server-Side Search and Pagination Controls
  const [search, setSearch]                   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage]         = useState(1);
  const [totalPages, setTotalPages]           = useState(1);
  const [totalLogs, setTotalLogs]             = useState(0);

  // Debounce search input text entry
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page marker safely if search parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      // 🎯 Passes filters and page offsets straight to your updated API route
      const response = await fetch(
        `/api/payments?search=${encodeURIComponent(debouncedSearch)}&page=${currentPage}&limit=20`
      );
      const result = await response.json();

      if (result.success) {
        const rawData = result.data || [];
        const normalized = rawData.map((item: any) => normalizeTransaction(item));
        
        setTransactions(normalized);
        setTotalLogs(result.pagination?.total ?? normalized.length);
        setTotalPages(result.pagination?.totalPages ?? 1);
        setError(null);
      } else {
        setError(result.error ?? "Failed to download transaction data.");
      }
    } catch {
      setError("Network exception error occurred while pulling live data grids.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  function buildReceiptHtml(tx: Transaction) {
    return generateReceiptHtml({
      receiptNo:      tx.receiptNo,
      displayDate:    tx.date,
      name:           tx.name,
      phone:          tx.phone,
      college:        tx.college,
      domain:         tx.domain,
      courseName:     tx.courseName,
      numTotal:       tx.totalCoursePayment,
      numAlreadyPaid: tx.alreadyPaid,
      numPaid:        tx.paidAmount,
      method:         tx.paymentMethod,
      txn:            tx.transactionId,
      billing:        tx.billingBy,
    });
  }

  function handlePrint(tx: Transaction) {
    const pWin = window.open("", "_blank");
    if (!pWin) return alert("Pop-up window blocked. Please authorize popups for this portal.");
    pWin.document.write(buildReceiptHtml(tx));
    pWin.document.close();
  }

  function handleDownload(tx: Transaction) {
    const blob = new Blob([buildReceiptHtml(tx)], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), {
      href:     url,
      download: `Receipt_${tx.receiptNo}_${tx.name.replace(/\s+/g, "_")}.html`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white w-full rounded-3xl border border-zinc-100 shadow-sm overflow-hidden space-y-4">

      {/* Header and Live Search Input Bar */}
      <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-zinc-900 text-white rounded-xl">
            <ArrowLeftRight size={18} />
          </span>
          <div>
            <h2 className="text-base font-bold text-zinc-900">Real-time Transaction Audits</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Historical verification ledger of processed student enrollment fees
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
            <input
              type="text"
              placeholder="Search receipt, name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 text-xs font-medium rounded-xl text-zinc-800 outline-none focus:border-zinc-400 focus:bg-white transition-all"
            />
          </div>
          <div className="text-xs font-mono px-3 py-2 bg-zinc-100 text-zinc-600 rounded-lg font-semibold whitespace-nowrap">
            Total Logs: {totalLogs}
          </div>
        </div>
      </div>

      {/* Render Data Streams Viewport */}
      <div className="w-full overflow-x-auto">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : transactions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400 select-none">
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className={`py-4 px-6${h === "Actions" ? " text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                {transactions.map((tx, idx) => (
                  // 🎯 OPTIMIZED COMPOSITE DOM KEY: Combines ID string with current loop position index to ensure stable UI mapping profiles
                  <tr key={`${tx.receiptNo}_${idx}`} className="hover:bg-zinc-50/70 transition-colors duration-150">

                    <td className="py-4 px-6 space-y-1">
                      <div className="font-mono text-xs font-bold text-zinc-800 tracking-tight">{tx.receiptNo}</div>
                      <div className="text-zinc-400 text-xs flex items-center gap-1">
                        <Calendar size={12} /> {tx.date}
                      </div>
                    </td>

                    <td className="py-4 px-6 space-y-1">
                      <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <User size={13} className="text-zinc-400" /> {tx.name}
                      </div>
                      <div className="text-zinc-400 text-xs font-mono">{tx.phone}</div>
                      <div className="text-zinc-500 text-xs flex items-center gap-1 truncate max-w-[200px]">
                        <Building size={12} className="text-zinc-300" /> {tx.college}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-lg border border-zinc-200/50">
                        {tx.domain}
                      </span>
                    </td>

                    <td className="py-4 px-6 space-y-1">
                      <div className="font-bold text-emerald-600 text-base">{inr(tx.paidAmount)}</div>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${METHOD_STYLES[tx.paymentMethod] || METHOD_STYLES["Cash"]}`}>
                        {tx.paymentMethod}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-zinc-500 text-xs font-medium">
                      <div className="flex items-center gap-1 text-zinc-700 font-semibold">
                        <CreditCard size={12} className="text-zinc-400" /> {tx.billingBy}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 border border-zinc-100 bg-white shadow-sm hover:border-zinc-300 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Eye size={14} /> Show
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {/* Server-Side Pagination Footer Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-zinc-50/50 px-8 py-4 border-t border-zinc-100 text-xs font-bold text-zinc-500">
                <span>Showing Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-zinc-200 bg-white rounded-xl hover:bg-zinc-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-zinc-200 bg-white rounded-xl hover:bg-zinc-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal View */}
      {selectedTx && (
        <AuditModal
          tx={selectedTx}
          onClose={()      => setSelectedTx(null)}
          onPrint={()      => handlePrint(selectedTx)}
          onDownload={()   => handleDownload(selectedTx)}
        />
      )}

    </div>
  );
}
