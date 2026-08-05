type ActivityIconProps = { activity: string; className?: string };

export function ActivityIcon({ activity, className = "size-5" }: ActivityIconProps) {
  const value = activity.toLowerCase();
  const common = { className, fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8, viewBox: "0 0 24 24", "aria-hidden": true };

  if (value.includes("walk") || value.includes("fitness")) return <svg {...common}><circle cx="13" cy="4" r="2" /><path d="m10 22 1-7-3-3 2-5 4 3 4 1M11 15l5 7M8 12l-4 3" /></svg>;
  if (value.includes("read") || value.includes("learning")) return <svg {...common}><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22zM20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22z" /></svg>;
  if (value.includes("meditat") || value.includes("mind")) return <svg {...common}><circle cx="12" cy="5" r="2" /><path d="M7 12c1.5-2 3-3 5-3s3.5 1 5 3M4 20c2-4 5-6 8-6s6 2 8 6M8 20l4-6 4 6" /></svg>;
  if (value.includes("work") || value.includes("career") || value.includes("portfolio")) return <svg {...common}><rect height="14" rx="2" width="18" x="3" y="7" /><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" /></svg>;
  if (value.includes("water")) return <svg {...common}><path d="M12 2S5.5 9.2 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 9.2 12 2 12 2zM9 16c.7 1.3 1.7 2 3 2" /></svg>;
  return <svg {...common}><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>;
}
