import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  href?: string;
  inverse?: boolean;
  markOnly?: boolean;
};

export function BrandLogo({ className = "", href = "/", inverse = false, markOnly = false }: BrandLogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg aria-hidden="true" className="h-9 w-9 shrink-0" fill="none" viewBox="0 0 44 44">
        <rect fill={inverse ? "#F4E9D2" : "var(--chart-deep)"} height="42" rx="14" width="42" x="1" y="1" />
        <path d="m10.5 32 9.6-20.7a2.1 2.1 0 0 1 3.8 0L33.5 32" stroke={inverse ? "#173F32" : "var(--theme-paper)"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.1" />
        <path d="M15.5 25.5h13" stroke={inverse ? "#D99B43" : "var(--chart-primary)"} strokeDasharray="1 5" strokeLinecap="round" strokeWidth="3.2" />
        <circle cx="33.5" cy="32" fill={inverse ? "#D99B43" : "var(--chart-primary)"} r="2.5" />
      </svg>
      {!markOnly && <span className={`text-xl font-black tracking-[-0.06em] ${inverse ? "text-white" : "text-[var(--soft-ink)]"}`}>aduv<span className={inverse ? "text-[#c47b60]" : "text-[var(--soft-accent)]"}>i</span>a</span>}
    </span>
  );

  return href ? <Link aria-label="Aduvia home" href={href}>{content}</Link> : content;
}
