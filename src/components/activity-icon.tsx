type ActivityIconProps = { activity: string; className?: string };

export function ActivityIcon({ activity, className = "size-5" }: ActivityIconProps) {
  const value = activity.toLowerCase();
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.65,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  if (value.includes("walk") || value.includes("fitness") || value.includes("run")) {
    return <svg {...common}><circle cx="13.5" cy="4.25" r="1.75" /><path d="m11.4 8.1 2.1 2.1 3.5 1.2M10.8 7.8 8.2 12l-3.4 1.8M11.2 11.4l-1 4.1-3.1 4.2M11.7 15.2l3 1.8 2.2 3.1" /></svg>;
  }
  if (value.includes("read") || value.includes("learning") || value.includes("book")) {
    return <svg {...common}><path d="M3.75 5.5A3.25 3.25 0 0 1 7 2.25h3.75v16.5H7a3.25 3.25 0 0 0-3.25 3.25zM20.25 5.5A3.25 3.25 0 0 0 17 2.25h-3.75v16.5H17A3.25 3.25 0 0 1 20.25 22z" /><path d="M7 6h1.5M15.5 6H17" opacity=".55" /></svg>;
  }
  if (value.includes("meditat") || value.includes("mind") || value.includes("yoga")) {
    return <svg {...common}><circle cx="12" cy="4.5" r="1.75" /><path d="M8.2 11.1c.9-1.8 2.2-2.7 3.8-2.7s2.9.9 3.8 2.7M12 8.6v5.1M5 19.5c1.8-3.4 4.1-5.1 7-5.1s5.2 1.7 7 5.1M8.2 19.5 12 14.4l3.8 5.1M5 19.5h14" /></svg>;
  }
  if (value.includes("work") || value.includes("career") || value.includes("portfolio") || value.includes("project")) {
    return <svg {...common}><rect height="13.5" rx="2.25" width="18.5" x="2.75" y="7.25" /><path d="M8.25 7.25V4.5h7.5v2.75M2.75 12.25c2.9 1.2 5.98 1.8 9.25 1.8s6.35-.6 9.25-1.8M10 13.85v2.15h4v-2.15" /></svg>;
  }
  if (value.includes("water") || value.includes("drink") || value.includes("hydrate")) {
    return <svg {...common}><path d="M12 2.25S5.75 9.1 5.75 14.25a6.25 6.25 0 0 0 12.5 0C18.25 9.1 12 2.25 12 2.25z" /><path d="M9 15.25a3.25 3.25 0 0 0 3 2" opacity=".65" /></svg>;
  }
  if (value.includes("sleep") || value.includes("bed")) {
    return <svg {...common}><path d="M4 19.5V5M20 19.5v-8a2 2 0 0 0-2-2H9v7M4 13h5M4 16.5h16" /><path d="M7 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg>;
  }
  if (value.includes("music") || value.includes("practice")) {
    return <svg {...common}><path d="M9 18V5l11-2v13M9 8l11-2" /><ellipse cx="6.5" cy="18" rx="2.5" ry="2" /><ellipse cx="17.5" cy="16" rx="2.5" ry="2" /></svg>;
  }
  if (value.includes("budget") || value.includes("finance") || value.includes("money")) {
    return <svg {...common}><rect height="15.5" rx="2.5" width="19" x="2.5" y="4.25" /><path d="M16 9.25h5.5v5.5H16a2.75 2.75 0 0 1 0-5.5z" /><circle cx="16.25" cy="12" r=".6" fill="currentColor" stroke="none" /></svg>;
  }
  return <svg {...common}><path d="M12 2.75a6.75 6.75 0 0 0-3.9 12.27c.65.46 1.15 1.22 1.15 2.03v.2h5.5v-.2c0-.81.5-1.57 1.15-2.03A6.75 6.75 0 0 0 12 2.75zM9.5 20h5M10.25 17.25h3.5M12 6v5M9.5 8.5h5" /></svg>;
}
