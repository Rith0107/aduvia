import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/login", "/signup", "/reset-password"].map((path) => ({ url: `https://aduvia-chi.vercel.app${path}`, lastModified: new Date(), changeFrequency: path ? "monthly" : "weekly", priority: path ? 0.6 : 1 }));
}
