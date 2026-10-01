"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Check, CreditCard, UserPlus, X } from "lucide-react";

type NotificationItem = {
  _id: string;
  type: "registration" | "enrollment" | "payment";
  title: string;
  message: string;
  amount?: number;
  readAt?: string;
  createdAt: string;
};

export default function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = useCallback(async (targetPage = page) => {
    const response = await fetch(`/api/admin/notifications?page=${targetPage}&limit=10`, {
      cache: "no-store",
    });
    if (!response.ok) return;
    const data = await response.json();
    setItems(data.notifications || []);
    setUnread(data.unread || 0);
    setPages(data.pagination?.pages || 1);
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const source = new EventSource("/api/admin/notifications/stream");
    source.onmessage = () => {
      setPage(1);
      load(1);
    };
    return () => source.close();
  }, [load]);

  const markRead = async (id?: string) => {
    const response = await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { all: true }),
    });
    if (response.ok) await load();
  };

  return (
    <div className="relative z-[110]">
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50"
        aria-label="Admin notifications"
        aria-expanded={open}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <section className="absolute right-0 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Notifications</h2>
              <p className="text-xs text-zinc-500">{unread} unread</p>
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={() => markRead()} className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100" aria-label="Close notifications">
                <X size={16} />
              </button>
            </div>
          </header>

          <div className="max-h-[28rem] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-zinc-500">No notifications yet.</p>
            ) : items.map((item) => (
              <button
                key={item._id}
                onClick={() => !item.readAt && markRead(item._id)}
                className={`flex w-full items-start gap-3 border-b border-zinc-100 px-4 py-3 text-left hover:bg-zinc-50 ${item.readAt ? "bg-white" : "bg-blue-50/60"}`}
              >
                <span className={`mt-0.5 shrink-0 rounded-full p-2 ${item.type === "payment" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                  {item.type === "payment" ? <CreditCard size={15} /> : <UserPlus size={15} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-900">{item.title}</span>
                    {item.readAt && <Check size={14} className="shrink-0 text-emerald-600" />}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-zinc-600">{item.message}</span>
                  <span className="mt-1 block text-[10px] text-zinc-400">{new Date(item.createdAt).toLocaleString("en-IN")}</span>
                </span>
              </button>
            ))}
          </div>

          {pages > 1 && (
            <footer className="flex items-center justify-between px-4 py-2 text-xs">
              <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="font-semibold text-blue-700 disabled:text-zinc-300">Previous</button>
              <span className="text-zinc-500">Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage((value) => value + 1)} className="font-semibold text-blue-700 disabled:text-zinc-300">Next</button>
            </footer>
          )}
        </section>
      )}
    </div>
  );
}
