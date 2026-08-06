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
        <rect fill={inverse ? "#F4E9D2" : "#173F32"} height="42" rx="14" width="42" x="1" y="1" />
        <path d="M29.2 28.6A12 12 0 1 1 32.8 20" stroke={inverse ? "#173F32" : "#F8F4EA"} strokeLinecap="round" strokeWidth="3.2" />
        <path d="m26.7 26.7 7 7" stroke="#D99B43" strokeLinecap="round" strokeWidth="3.2" />
        <circle cx="33.5" cy="12" fill="#D99B43" r="2.5" />
      </svg>
      {!markOnly && <span className={`text-xl font-black tracking-[-0.06em] ${inverse ? "text-white" : "text-[#24302a]"}`}>quest<span className="text-[#c47b60]">/</span>log</span>}
    </span>
  );

  return href ? <Link aria-label="QuestLog home" href={href}>{content}</Link> : content;
}
