"use client";

import { useEffect, useState } from "react";

export function NetworkStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  if (online) return null;
  return <div className="fixed inset-x-3 top-3 z-[100] mx-auto max-w-md rounded-full bg-[var(--soft-ink)] px-5 py-3 text-center text-xs font-bold text-white shadow-2xl" role="status">You’re offline. Saved changes will sync when you reconnect.</div>;
}
