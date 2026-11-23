"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowDownRight, ArrowUpRight, BookOpen, CalendarDays, Minus, RefreshCw, Users, Wallet, X } from "lucide-react";
import StudentTable, { StudentRecord } from "@/components/students/StudentTable";
import StudentPagination from "@/components/students/StudentPagination";
import EditStudentModal from "@/components/students/EditStudentModal";

interface MoneyStats {
  count: number;
  billing: number;
  collected: number;
  pending: number;
}

interface OverviewData {
  totals: { students: number; billing: number; collected: number; pending: number };
  today: { admissions: number; collected: number };
  monthAdmissions: number;
  admissionTrend: { direction: "up" | "down" | "flat"; label: string; previous: number };
  studentsByStatus: { active: number; inactive: number };
  durations: { sixMonths: MoneyStats; threeMonths: MoneyStats; other: MoneyStats };
  series: { key: string; label: string; admissions: number; collected: number }[];
}

type StudentList = "sixMonths" | "threeMonths" | "other" | "outstanding";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function MonthlyChart({ title, subtitle, series, field, currency, variant = "bar" }: {
  title: string;
  subtitle: string;
  series: OverviewData["series"];
  field: "admissions" | "collected";
  currency?: boolean;
  variant?: "bar" | "line";
}) {
  const peak = Math.max(1, ...series.map((item) => item[field]));
  const linePoints = series.map((item, index) => ({
    ...item,
    x: series.length <= 1 ? 50 : (index / (series.length - 1)) * 100,
    y: 92 - (item[field] / peak) * 74,
  }));
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      {variant === "line" ? (
        <div className="relative mt-7 h-56 border-b border-slate-200" role="img" aria-label={`${title}: ${series.map((item) => `${item.label} ${item[field]}`).join(", ")}`}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id={`chart-area-${field}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[18, 55, 92].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="0.45" vectorEffect="non-scaling-stroke" />)}
            <polygon points={`0,92 ${linePoints.map((point) => `${point.x},${point.y}`).join(" ")} 100,92`} fill={`url(#chart-area-${field})`} />
            <polyline points={linePoints.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {linePoints.map((point) => (
            <span
              key={point.key}
              role="img"
              tabIndex={0}
              aria-label={`${point.key}: ${point[field]} admissions`}
              className="group absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <span className="block h-3 w-3 rounded-full border-2 border-emerald-600 bg-white shadow-sm transition-transform group-hover:scale-125 group-focus:scale-125" />
              <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                {point.label}: {point[field]} admissions
              </span>
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-7 flex h-56 items-end gap-1 sm:gap-2 border-b border-slate-200" role="img" aria-label={`${title}: ${series.map((item) => `${item.label} ${currency ? money(item[field]) : item[field]}`).join(", ")}`}>
          {series.map((item) => (
            <div key={item.key} className="flex h-full min-w-0 flex-1 flex-col justify-end group">
              <div className="mb-2 text-center text-[10px] font-semibold text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 tabular-nums">
                {currency ? money(item[field]) : item[field]}
              </div>
              <div
                className="mx-auto w-full max-w-9 rounded-t-md bg-blue-600"
                style={{ height: `${Math.max(item[field] ? 5 : 0, item[field] / peak * 88)}%` }}
                title={`${item.key}: ${money(item[field])}`}
              />
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-1 sm:gap-2">
        {series.map((item) => <span key={item.key} className="min-w-0 flex-1 text-center text-[10px] text-slate-500">{item.label}</span>)}
      </div>
    </section>
  );
}

export default function CeoOverviewTab() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<StudentList | null>(null);
  const [durationPage, setDurationPage] = useState(1);
  const [durationStudents, setDurationStudents] = useState<StudentRecord[]>([]);
  const [durationPages, setDurationPages] = useState(1);
  const [durationTotal, setDurationTotal] = useState(0);
  const [durationLoading, setDurationLoading] = useState(false);
  const [durationError, setDurationError] = useState("");
  const [durationRefresh, setDurationRefresh] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Could not load overview.");
      setData(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!selectedDuration || selectedStudent) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedDuration(null); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selectedDuration, selectedStudent]);

  useEffect(() => {
    if (!selectedDuration) return;
    const controller = new AbortController();
    setDurationLoading(true);
    setDurationError("");
    const isOutstandingList = selectedDuration === "outstanding";
    const params = new URLSearchParams({ status: isOutstandingList ? "outstanding" : "current", page: String(durationPage), limit: "15" });
    if (!isOutstandingList) params.set("durationGroup", selectedDuration);
    fetch(`/api/students?${params}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "Could not load students.");
        if (!controller.signal.aborted) {
          setDurationStudents(result.students || []);
          setDurationPages(result.pagination?.totalPages || 1);
          setDurationTotal(result.pagination?.totalStudents || 0);
        }
      })
      .catch((cause) => { if (!controller.signal.aborted) setDurationError(cause instanceof Error ? cause.message : "Could not load students."); })
      .finally(() => { if (!controller.signal.aborted) setDurationLoading(false); });
    return () => controller.abort();
  }, [selectedDuration, durationPage, durationRefresh]);

  if (loading && !data) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading executive overview…</div>;
  if (!data) return <div className="rounded-2xl border border-rose-200 bg-white p-8 text-sm text-rose-700"><AlertCircle className="mb-3" size={22} />{error}<button onClick={refresh} className="ml-3 font-semibold underline">Try again</button></div>;

  const cards = [
    { label: "Total students", value: data.totals.students.toLocaleString("en-IN"), icon: Users, tone: "text-blue-700 bg-blue-50" },
    { label: "Total billing", value: money(data.totals.billing), icon: BookOpen, tone: "text-violet-700 bg-violet-50" },
    { label: "Fees collected", value: money(data.totals.collected), icon: Wallet, tone: "text-emerald-700 bg-emerald-50" },
    { label: "Outstanding balance", value: money(data.totals.pending), icon: AlertCircle, tone: "text-amber-700 bg-amber-50" },
    { label: "Admissions this month", value: data.monthAdmissions.toLocaleString("en-IN"), icon: CalendarDays, tone: "text-sky-700 bg-sky-50" },
    { label: "Active students", value: data.studentsByStatus.active.toLocaleString("en-IN"), icon: Users, tone: "text-emerald-700 bg-emerald-50" },
  ];
  const durationCards = [
    { group: "sixMonths", label: "6 months", stats: data.durations.sixMonths, tone: "text-violet-700 bg-violet-50" },
    { group: "threeMonths", label: "3 months", stats: data.durations.threeMonths, tone: "text-blue-700 bg-blue-50" },
    { group: "other", label: "Other durations", stats: data.durations.other, tone: "text-emerald-700 bg-emerald-50" },
  ] as const;

  return (
    <>
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Executive dashboard</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">CEO Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Admissions and collections across the enrollment portfolio.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4"><CalendarDays size={21} className="text-blue-700" /><span className="text-sm font-bold text-slate-900">Today’s summary</span></div>
          <div className="px-2"><p className="text-xs text-slate-500">Admissions</p><p className="text-lg font-bold text-slate-950 tabular-nums">{data.today.admissions}</p></div>
          <div className="px-2"><p className="text-xs text-slate-500">Fees collected</p><p className="text-lg font-bold text-slate-950 tabular-nums">{money(data.today.collected)}</p></div>
          <button onClick={refresh} disabled={loading} aria-label="Refresh overview" title="Refresh overview" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Showing last loaded figures. {error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <section key={label} className="relative flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className={`inline-flex shrink-0 rounded-xl p-2 ${tone}`}><Icon size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <p className="text-xl font-bold tracking-tight text-slate-950 tabular-nums">{value}</p>
                {label === "Admissions this month" && (
                  <span title="Compared with the same dates last month" className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-bold ${data.admissionTrend.direction === "up" ? "bg-emerald-50 text-emerald-700" : data.admissionTrend.direction === "down" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                    {data.admissionTrend.direction === "up" ? <ArrowUpRight size={15} /> : data.admissionTrend.direction === "down" ? <ArrowDownRight size={15} /> : <Minus size={15} />}
                    {data.admissionTrend.label}<span className="sr-only"> compared with the same dates last month</span>
                  </span>
                )}
              </div>
            </div>
            {label === "Outstanding balance" && <button type="button" aria-label="View enrollments with outstanding balances" onClick={() => { setDurationStudents([]); setDurationTotal(0); setDurationLoading(true); setDurationPage(1); setSelectedDuration("outstanding"); }} className="absolute inset-0 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" />}
          </section>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {durationCards.map(({ group, label, stats, tone }) => (
          <section key={label} className="relative min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className={`rounded-xl px-3 py-1.5 text-sm font-bold ${tone}`}>{label}</span><span className="text-lg font-bold text-slate-950 tabular-nums">{stats.count} <small className="text-xs font-medium text-slate-500">enrollments</small></span></div>
            <div className="mt-3 border-t border-slate-100 pt-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total billing</p><p className="mt-0.5 text-lg font-bold text-slate-950 tabular-nums">{money(stats.billing)}</p></div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm"><div className="min-w-0 rounded-xl bg-emerald-50 p-2.5"><p className="text-slate-600">Collected</p><p className="mt-0.5 font-bold text-emerald-700 tabular-nums">{money(stats.collected)}</p></div><div className="min-w-0 rounded-xl bg-amber-50 p-2.5"><p className="text-slate-600">Outstanding</p><p className="mt-0.5 font-bold text-amber-700 tabular-nums">{money(stats.pending)}</p></div></div>
            <button type="button" aria-label={`View ${label} students`} onClick={() => { setDurationStudents([]); setDurationTotal(stats.count); setDurationLoading(true); setDurationPage(1); setSelectedDuration(group); }} className="absolute inset-0 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" />
          </section>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyChart title="Monthly fee collection" subtitle="Payments by recorded date · last 12 months" series={data.series} field="collected" currency />
        <MonthlyChart title="Monthly admissions" subtitle="Enrollments by joining month · last 12 months" series={data.series} field="admissions" variant="line" />
      </div>
      <p className="text-xs text-slate-500">Lifetime totals include all recorded installments. For migrated payments without a timestamp, the chart uses the recorded payment date.</p>
    </div>
      {selectedDuration && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">
          <div role="dialog" aria-modal="true" aria-labelledby="duration-students-heading" className="flex max-h-[90dvh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h3 id="duration-students-heading" className="text-lg font-bold text-slate-950">{selectedDuration === "outstanding" ? "Outstanding balances" : `${durationCards.find((card) => card.group === selectedDuration)?.label} students`}</h3>
                <p className="text-xs text-slate-500">{durationTotal.toLocaleString("en-IN")} enrollments{selectedDuration === "outstanding" ? ` · ${money(data.totals.pending)} outstanding` : ""} · newest joining date first</p>
              </div>
              <button type="button" onClick={() => setSelectedDuration(null)} aria-label="Close student list" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X size={20} /></button>
            </div>
            <div className="min-h-0 overflow-y-auto p-3 sm:p-5">
              {durationError ? <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span>{durationError}</span><button type="button" onClick={() => setDurationRefresh((value) => value + 1)} className="font-semibold underline">Retry</button></div> : <StudentTable students={durationStudents} loading={durationLoading} onOpenEditModal={setSelectedStudent} />}
              {!durationError && <div className="mt-3"><StudentPagination page={durationPage} totalPages={durationPages} onPageChange={setDurationPage} /></div>}
            </div>
          </div>
        </div>
      )}
      <EditStudentModal isOpen={Boolean(selectedStudent)} student={selectedStudent} onClose={() => setSelectedStudent(null)} onSuccess={() => { setDurationRefresh((value) => value + 1); void refresh(); }} />
    </>
  );
}
