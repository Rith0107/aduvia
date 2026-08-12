import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/account", "/check-in", "/habits", "/insights", "/onboarding", "/quests", "/today"] }, sitemap: "https://aduvia-chi.vercel.app/sitemap.xml" };
}
