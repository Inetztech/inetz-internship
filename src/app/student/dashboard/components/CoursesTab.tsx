"use client";

import { useState } from "react";
import { Award, CalendarDays, CheckCircle2, Clock, GraduationCap, Receipt } from "lucide-react";
import RazorpayCheckout from "@/components/RazorpayCheckout";

interface EnrolledCourse {
  _id: string;
  courseTitle?: string;
  domain: string;
  duration?: string;
  enrolledDate?: string;
  status?: "Active" | "Completed";
  totalBilling?: number;
  totalCollection?: number;
  pendingAmount?: number;
  feesStatus?: "Pending" | "Fully Paid" | "Clear";
  certificateStatus?: "Pending" | "Issued";
}

interface StudentPaymentProfile {
  fullName: string;
  email: string;
  phone: string;
  college: string;
}

export default function CoursesTab({
  courses,
  student,
  onPaymentSuccess,
}: {
  courses: EnrolledCourse[];
  student: StudentPaymentProfile;
  onPaymentSuccess: () => void;
}) {
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  return (
    <div className="space-y-6">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Learning</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">My Courses</h1>
        <p className="mt-1 text-sm text-slate-500">Your registered internship programs and fee status.</p>
      </header>

      {paymentMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          <CheckCircle2 size={17} /> {paymentMessage}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <GraduationCap size={22} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">No registered courses</h2>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
            Your course details will appear here after your registration is processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const paid = course.feesStatus === "Clear" || course.feesStatus === "Fully Paid";
            const completed = course.status === "Completed";
            const balance = course.pendingAmount || 0;
            const enteredAmount = Number(paymentAmounts[course._id]);
            const validAmount = enteredAmount > 0 && enteredAmount <= balance;

            return (
              <article key={course._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <span className="text-xs font-medium text-blue-600">{course.domain || "Internship Program"}</span>
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">
                      {course.courseTitle || `${course.domain} Internship`}
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <CalendarDays size={14} /> Enrolled {course.enrolledDate || "date unavailable"}
                    </p>
                  </div>
                  <span className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${completed ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                    {completed ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {completed ? "Completed" : "Active"}
                  </span>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-medium text-slate-500"><Receipt size={14} /> Fee summary</p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-4"><dt className="text-slate-500">Program fee</dt><dd className="font-semibold text-slate-900">₹{course.totalBilling ?? 0}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-slate-500">Paid</dt><dd className="font-semibold text-emerald-700">₹{course.totalCollection ?? 0}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-slate-500">Balance</dt><dd className="font-semibold text-slate-900">₹{course.pendingAmount ?? 0}</dd></div>
                    </dl>
                    {balance > 0 && student.email && student.phone && (
                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <label htmlFor={`payment-${course._id}`} className="mb-1.5 block text-xs font-medium text-slate-700">
                          Installment amount (maximum ₹{balance.toLocaleString("en-IN")})
                        </label>
                        <input
                          id={`payment-${course._id}`}
                          type="number"
                          min="1"
                          max={balance}
                          step="1"
                          inputMode="numeric"
                          placeholder="Enter amount"
                          value={paymentAmounts[course._id] || ""}
                          onChange={(event) => setPaymentAmounts((current) => ({
                            ...current,
                            [course._id]: event.target.value,
                          }))}
                          className="mb-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        {paymentAmounts[course._id] && !validAmount && (
                          <p className="mb-2 text-xs font-medium text-red-600">
                            Enter an amount from ₹1 to ₹{balance.toLocaleString("en-IN")}.
                          </p>
                        )}
                        <RazorpayCheckout
                          formData={{
                            fullName: student.fullName,
                            email: student.email,
                            phone: student.phone,
                            college: student.college,
                            domain: course.domain,
                            duration: course.duration,
                            totalBilling: course.totalBilling || 0,
                            amountToPay: validAmount ? enteredAmount : 0,
                            balancePayment: true,
                          }}
                          onSuccess={(emailSent) => {
                            setPaymentAmounts((current) => ({ ...current, [course._id]: "" }));
                            setPaymentMessage(emailSent
                              ? "Payment received. Your receipt was sent by email."
                              : "Payment received. Your receipt is recorded; email delivery is pending.");
                            onPaymentSuccess();
                          }}
                        />
                        <p className="mt-2 text-center text-xs text-slate-500">Secure payment powered by Razorpay</p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-medium text-slate-500"><Award size={14} /> Program status</p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-4"><dt className="text-slate-500">Payment</dt><dd className={`font-semibold ${paid ? "text-emerald-700" : "text-amber-700"}`}>{paid ? "Paid" : "Pending"}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-slate-500">Certificate</dt><dd className="font-semibold text-slate-900">{course.certificateStatus || "Pending"}</dd></div>
                    </dl>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
