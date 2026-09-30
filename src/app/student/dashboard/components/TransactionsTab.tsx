"use client";

import { CreditCard, Download, ReceiptText } from "lucide-react";
import { generateReceiptHtml } from "@/components/receiptTemplate";

interface TransactionRecord {
  _id: string;
  receiptNo: string;
  paymentId: string;
  description: string;
  amount: string;
  date: string;
  paymentMethod: string;
  studentName: string;
  phone: string;
  college: string;
  domain: string;
  courseName: string;
  totalFee: number;
  previouslyPaid: number;
  paidAmount: number;
  billingBy: string;
  status: "Success" | "Pending" | "Failed";
}

const statusStyle = {
  Success: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-rose-50 text-rose-700",
};

export default function TransactionsTab({ transactions }: { transactions: TransactionRecord[] }) {
  const downloadReceipt = (transaction: TransactionRecord) => {
    const receiptWindow = window.open("", "_blank");
    if (!receiptWindow) return alert("Please allow pop-ups to download the receipt PDF.");
    receiptWindow.document.write(generateReceiptHtml({
      receiptNo: transaction.receiptNo,
      displayDate: transaction.date,
      name: transaction.studentName,
      phone: transaction.phone,
      college: transaction.college,
      domain: transaction.domain,
      courseName: transaction.courseName,
      numTotal: transaction.totalFee,
      numAlreadyPaid: transaction.previouslyPaid,
      numPaid: transaction.paidAmount,
      method: transaction.paymentMethod,
      txn: transaction.paymentId,
      billing: transaction.billingBy,
    }));
    receiptWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Billing</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Payment History</h1>
        <p className="mt-1 text-sm text-slate-500">Review your payment and receipt records.</p>
      </header>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <CreditCard size={22} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">No payment records</h2>
          <p className="mt-1 text-sm text-slate-500">Completed transactions will appear here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-900">
            <ReceiptText size={17} className="text-blue-600" /> Receipts
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-5 py-3">Payment ID</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="transition-colors hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-medium text-slate-700">{transaction.paymentId}</td>
                    <td className="px-5 py-4 text-slate-700">{transaction.description}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">{transaction.date}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-950">{transaction.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[transaction.status]}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => downloadReceipt(transaction)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                      >
                        <Download size={14} /> Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
