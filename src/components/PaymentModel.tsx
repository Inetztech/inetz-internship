"use client";

import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Printer, 
  FileText, 
  Save, 
  Loader2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Search 
} from "lucide-react";
import { generateReceiptHtml } from "./receiptTemplate";

interface PaymentModalProps {
  programs?: unknown[]; 
  onClose: () => void;
}

interface FormState {
  name: string;
  phone: string;
  college: string;
  billing: string;
  courseName: string;
  domain: string; 
  total: string;
  alreadyPaid: string;
  paid: string;
  type: "Full Payment" | "Part Payment";
  method: "Cash" | "GPay";
  txn: string;
  customDate: string;
}

const BILLING_STAFF = [
  "Preethi", 
  "Senthil Sir", 
  "Amal", 
  "Naresh", 
  "Boomika", 
  "Anbu", 
  "Aravindh", 
  "Dhanalakshmi", 
  "Esther"
] as const;

const SectionHeader = ({ label }: { label: string }) => (
  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 select-none">
    {label}
  </h3>
);

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  value: string;
  onChangeText?: (val: string) => void;
}

const AdminInput = ({ placeholder, value, onChangeText, type = "text", disabled, ...props }: AdminInputProps) => (
  <input
    {...props}
    type={type}
    disabled={disabled}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChangeText && onChangeText(e.target.value)}
    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
      disabled 
        ? "bg-zinc-100/70 border-zinc-200 text-zinc-600 font-semibold cursor-not-allowed" 
        : "bg-zinc-50 border-zinc-200 text-zinc-800 placeholder:text-zinc-300 focus:border-emerald-500 focus:bg-white"
    }`}
  />
);

export default function PaymentModal({ onClose }: PaymentModalProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    college: "",
    billing: "",
    courseName: "",
    domain: "",
    total: "",
    alreadyPaid: "",
    paid: "",
    type: "Part Payment",
    method: "Cash",
    txn: "",
    customDate: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [studentFound, setStudentFound] = useState<boolean | null>(null);
  const [receiptNo, setReceiptNo] = useState("");
  const [currentTimestamp, setCurrentTimestamp] = useState<Date | null>(null);

  // Endpoint routes
  const studentApiUrl = "/api/students";
  const paymentApiUrl = "/api/payments";

  useEffect(() => {
    const now = new Date();
    setCurrentTimestamp(now);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    
    setForm(f => ({ ...f, customDate: `${year}-${month}-${day}` }));

    const sequentialSerial = 
      year + month + day + "-" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");

    setReceiptNo(`IT-${sequentialSerial}`);
  }, []);

  // Numerical calculations
  const numTotal = Number(form.total) || 0;
  const numAlreadyPaid = Number(form.alreadyPaid) || 0;
  const numPaid = Number(form.paid) || 0;
  
  const remainingBalance = Math.max(0, numTotal - numAlreadyPaid);
  const rawBalance = Math.max(0, numTotal - (numAlreadyPaid + numPaid));
  const isPaidInFull = numTotal > 0 && numAlreadyPaid >= numTotal;

  // Handle classification toggle
  const handleTypeChange = (newType: "Full Payment" | "Part Payment") => {
    if (isPaidInFull) {
      setForm((f) => ({ ...f, type: newType, paid: "0" }));
      return;
    }

    if (newType === "Full Payment") {
      setForm((f) => ({ ...f, type: newType, paid: remainingBalance.toString() }));
    } else {
      setForm((f) => ({ ...f, type: newType, paid: "" }));
    }
  };

  // Fetch Student profile strictly by phone number
 // Fetch Student profile strictly by phone number match
  const checkPhoneExistence = async () => {
    const cleanPhone = form.phone.trim();
    const inputDigits = cleanPhone.replace(/\D/g, "").slice(-10);

    if (inputDigits.length < 10) return;

    setIsCheckingPhone(true);
    try {
      // Query students endpoint
      const response = await fetch(`${studentApiUrl}?phone=${encodeURIComponent(cleanPhone)}&search=${encodeURIComponent(cleanPhone)}`);
      const data = await response.json();

      let matchedStudent: any = null;

      // 1. If API returns a single student object directly ({ success: true, student: {...} })
      if (data.student && typeof data.student === "object" && !Array.isArray(data.student)) {
        const studentPhoneDigits = String(data.student.phone || "").replace(/\D/g, "").slice(-10);
        if (studentPhoneDigits === inputDigits) {
          matchedStudent = data.student;
        }
      } 
      
      // 2. If API returns an array of students ({ success: true, data: [...] }), find the EXACT phone match
      if (!matchedStudent) {
        const studentList = Array.isArray(data.data) 
          ? data.data 
          : Array.isArray(data.students) 
            ? data.students 
            : [];

        matchedStudent = studentList.find((s: any) => {
          if (!s.phone) return false;
          const sDigits = String(s.phone).replace(/\D/g, "").slice(-10);
          return sDigits === inputDigits;
        });
      }

      // If a matching student is verified in the database
      if (matchedStudent) {
        setStudentFound(true);

        const fetchedTotal = Number(matchedStudent.totalBilling ?? matchedStudent.totalCoursePayment ?? matchedStudent.total ?? 0);

        // Sum previous payments from installments array if present
        let fetchedAlreadyPaid = 0;
        if (Array.isArray(matchedStudent.installments) && matchedStudent.installments.length > 0) {
          fetchedAlreadyPaid = matchedStudent.installments.reduce(
            (sum: number, item: { paidAmount?: number | string }) => sum + (Number(item.paidAmount) || 0),
            0
          );
        } else {
          fetchedAlreadyPaid = Number(matchedStudent.totalCollection ?? matchedStudent.alreadyPaidAmount ?? matchedStudent.alreadyPaid ?? 0);
        }

        const alreadyFull = fetchedTotal > 0 && fetchedAlreadyPaid >= fetchedTotal;

        setForm((f) => ({
          ...f,
          name: matchedStudent.name || "",
          college: matchedStudent.college || "",
          domain: matchedStudent.domain || "",
          courseName: matchedStudent.duration || matchedStudent.courseName || "",
          total: fetchedTotal.toString(),
          alreadyPaid: fetchedAlreadyPaid.toString(),
          paid: "",
          type: alreadyFull ? "Full Payment" : "Part Payment",
        }));
      } else {
        // Clear fields when phone number does not exist
        setStudentFound(false);
        setForm((f) => ({
          ...f,
          name: "",
          college: "",
          domain: "",
          courseName: "",
          total: "",
          alreadyPaid: "",
          paid: "",
        }));
      }
    } catch (error) {
      console.error("Failed to fetch student record:", error);
      setStudentFound(false);
      setForm((f) => ({
        ...f,
        name: "",
        college: "",
        domain: "",
        courseName: "",
        total: "",
        alreadyPaid: "",
        paid: "",
      }));
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const getCleanDisplayDate = () => {
    if (!form.customDate) return "";
    const dateObj = new Date(form.customDate);
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const displayTime = currentTimestamp 
    ? currentTimestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) 
    : "";

  const handleSave = async () => {
    if (!studentFound) {
      return alert("Please enter a registered student's mobile number first.");
    }
    if (!form.billing || !form.customDate) {
      return alert("Please select a billing authority and date.");
    }
    if (!isPaidInFull && (numPaid <= 0 || isNaN(numPaid))) {
      return alert("Please enter a valid payment amount.");
    }
    if (numPaid > remainingBalance) {
      return alert(`Payment amount (₹${numPaid}) cannot exceed remaining balance (₹${remainingBalance}).`);
    }

    setIsSaving(true);

    try {
      const response = await fetch(paymentApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptNo,
          name: form.name.trim(),
          phone: form.phone.trim(),
          college: form.college.trim(),
          courseName: form.courseName, 
          domain: form.domain,
          totalCoursePayment: numTotal,
          alreadyPaidAmount: numAlreadyPaid,
          paidAmount: numPaid,
          balanceAmount: rawBalance, 
          paymentType: form.type,
          paymentMethod: form.method,
          transactionId: form.method === "GPay" ? form.txn.trim() : "N/A",
          billingBy: form.billing,
          displayDate: getCleanDisplayDate(),
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert(result.emailSent
          ? `Payment recorded under Bill No: ${receiptNo}. The receipt was emailed to the student.`
          : `Payment recorded under Bill No: ${receiptNo}. No receipt email was sent.`);
        onClose();
      } else {
        alert(`Failed to save payment: ${result.error}`);
      }
    } catch {
      alert("Network exception occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const getCompiledDataPayload = () => ({
    receiptNo,
    displayDate: getCleanDisplayDate(),
    displayTime,
    name: form.name.trim(),
    phone: form.phone.trim(),
    college: form.college.trim(),
    domain: form.domain,
    courseName: form.courseName || "1 Month",
    numTotal,
    numAlreadyPaid,
    numPaid,
    method: form.method,
    txn: form.txn.trim(),
    billing: form.billing,
  });

  const handlePrintReceipt = () => {
    if (!studentFound) return alert("Please fetch a registered student first.");
    const pWin = window.open("", "_blank");
    if (!pWin) return alert("Pop-up window blocked.");
    pWin.document.write(generateReceiptHtml(getCompiledDataPayload()));
    pWin.document.close();
  };

  const handleDownloadPdf = () => {
    if (!studentFound) return alert("Please fetch a registered student first.");
    const htmlString = generateReceiptHtml(getCompiledDataPayload());
    const blob = new Blob([htmlString], { type: "text/html" });
    const fileUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = fileUrl;
    downloadAnchor.download = `Receipt_${receiptNo}_${form.name.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(fileUrl);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-zinc-100 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CreditCard size={16} /></span>
            <h2 className="text-base font-bold text-zinc-900">Fee Payment Entry</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"><X size={18} /></button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 tracking-tight">
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl font-sans text-zinc-600 font-semibold shadow-sm">
              <Calendar size={14} className="text-zinc-400" />
              <span>Billing Date:</span>
              <input 
                type="date"
                value={form.customDate}
                onChange={e => setForm({...form, customDate: e.target.value})}
                className="bg-transparent border-none outline-none font-bold text-zinc-800 cursor-pointer text-xs"
              />
            </div>

            <div>Bill No: <span className="font-semibold text-zinc-700">{receiptNo || "Generating..."}</span></div>
          </div>

          {/* Student Search Section */}
          <div>
            <SectionHeader label="1. Find Registered Student" />
            <div className="relative flex items-center">
              <AdminInput 
                placeholder="Enter Registered Mobile Phone Number" 
                type="tel"
                value={form.phone} 
                onChangeText={(v) => {
                  setStudentFound(null);
                  setForm(f => ({ ...f, phone: v, name: "", college: "", domain: "", courseName: "", total: "", alreadyPaid: "", paid: "" }));
                }} 
                onBlur={checkPhoneExistence}
              />
              <button 
                onClick={checkPhoneExistence}
                className="absolute right-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-zinc-800"
              >
                {isCheckingPhone ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />} Fetch
              </button>
            </div>

            {studentFound === true && (
              <div className="mt-2 text-[11px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <CheckCircle2 size={14} /> Student profile found and details populated!
              </div>
            )}

            {studentFound === false && (
              <div className="mt-2 text-[11px] text-red-600 font-bold flex items-center gap-1 bg-red-50 p-2.5 rounded-xl border border-red-100">
                <AlertCircle size={14} /> Student not found in database. Please register the student first.
              </div>
            )}
          </div>

          {/* Auto-populated Student Details (Read-only) */}
          {studentFound && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <SectionHeader label="Student Details (Fetched)" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminInput placeholder="Student Name" value={form.name} disabled />
                <AdminInput placeholder="College / Institution" value={form.college} disabled />
                <AdminInput placeholder="Domain" value={form.domain} disabled />
                <AdminInput placeholder="Duration" value={form.courseName} disabled />
              </div>

              <div className="space-y-1">
                <select 
                  value={form.billing} 
                  onChange={e => setForm(f => ({ ...f, billing: e.target.value }))} 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-800 outline-none focus:border-emerald-500 focus:bg-white transition-all h-[46px] appearance-none"
                >
                  <option value="">-- Select Allocated Billing Authority --</option>
                  {BILLING_STAFF.map(staff => <option key={staff} value={staff}>{staff}</option>)}
                </select>
              </div>

              <hr className="border-zinc-100" />

              {/* Payment Details */}
              <SectionHeader label="2. Payment Specifications" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Total Fee</label>
                  <AdminInput placeholder="Total Cost" type="number" value={form.total} disabled />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Collected</label>
                  <AdminInput placeholder="Already Paid" type="number" value={form.alreadyPaid} disabled />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-600 uppercase ml-1">Paying Now</label>
                  <AdminInput 
                    placeholder="Amount Paid Now" 
                    type="number" 
                    value={form.paid} 
                    onChangeText={(v) => {
                      const numVal = Number(v) || 0;
                      if (numVal <= remainingBalance) {
                        setForm(f => ({ ...f, paid: v }));
                      }
                    }} 
                    disabled={isPaidInFull || form.type === "Full Payment"}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs font-semibold">
                <span className="text-zinc-500">Remaining Balance After This Transaction:</span>
                <span className={`font-mono font-bold ${rawBalance === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  ₹{rawBalance}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Classification</span>
                  <div className="flex gap-4 mt-1">
                    {(["Full Payment", "Part Payment"] as const).map(opt => (
                      <label key={opt} className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 cursor-pointer select-none">
                        <input 
                          type="radio" 
                          name="paymentType"
                          checked={form.type === opt} 
                          onChange={() => handleTypeChange(opt)} 
                          className="w-4 h-4 text-emerald-600 border-zinc-300 focus:ring-emerald-500 accent-emerald-600" 
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Channel Engine</span>
                  <div className="flex gap-4 mt-1">
                    {(["Cash", "GPay"] as const).map(opt => (
                      <label key={opt} className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 cursor-pointer select-none">
                        <input 
                          type="radio" 
                          name="paymentMethod"
                          checked={form.method === opt} 
                          onChange={() => setForm(f => ({ ...f, method: opt }))} 
                          className="w-4 h-4 text-emerald-600 border-zinc-300 focus:ring-emerald-500 accent-emerald-600" 
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {form.method === "GPay" && (
                <div className="mt-4 p-4 bg-emerald-50/10 border border-emerald-100/50 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider pl-1">UPI / GPay Transaction Reference</label>
                  <AdminInput placeholder="Enter TXN ID / Reference Token" value={form.txn} onChangeText={(v) => setForm(f => ({ ...f, txn: v }))} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-4 border-t border-zinc-100 bg-zinc-50 flex gap-3 justify-end items-center rounded-b-3xl">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">Cancel</button>
          
          <button 
            onClick={handlePrintReceipt} 
            disabled={!studentFound}
            className="px-5 py-2.5 border border-zinc-200 bg-white text-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
          >
            <Printer size={14} /> Print Receipt
          </button>

          <button 
            onClick={handleDownloadPdf} 
            disabled={!studentFound}
            className="px-5 py-2.5 border border-zinc-200 bg-white text-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
          >
            <FileText size={14} /> Download PDF
          </button>
          
          <button 
            onClick={handleSave} 
            disabled={isSaving || !studentFound} 
            className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Payment
          </button>
        </div>

      </div>
    </div>
  );
}
