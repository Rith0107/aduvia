import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aduvia — habits and side quests",
    short_name: "Aduvia",
    description: "A calm daily routine and monthly side-quest tracker.",
    start_url: "/today",
    display: "standalone",
    background_color: "#e7e8e3",
    theme_color: "#143d31",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon.svg?v=3", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/maskable-icon.svg?v=3", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
