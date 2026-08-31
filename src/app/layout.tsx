import type { Metadata } from "next";
import { Archivo, Cormorant_Garamond, Inter, Lora, Manrope, STIX_Two_Text } from "next/font/google";
import type { ReactNode } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { AppDataProvider } from "@/lib/app-data";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { NetworkStatus } from "@/components/network-status";
import "./globals.css";

// Keeps PaletteChooser/TypographyChooser's storage keys and fallbacks in sync.
// Runs before hydration so a saved theme applies on first paint instead of
// waiting for the account menu (the only place those components mount) to open.
const THEME_INIT_SCRIPT = `(function () {
  try {
    var palettes = ["forest", "coastal", "clay", "lavender", "blue-hour"];
    var typographies = ["modern", "soft-journal", "quiet-literary", "grounded-classic"];
    var palette = window.localStorage.getItem("aduvia-palette");
    document.documentElement.dataset.palette = palettes.indexOf(palette) !== -1 ? palette : "forest";
    var typography = window.localStorage.getItem("aduvia-typography");
    document.documentElement.dataset.typography = typographies.indexOf(typography) !== -1 ? typography : "modern";
  } catch (error) {}
})();`;

const inter = Inter({ subsets: ["latin"], variable: "--type-inter" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--type-cormorant", weight: ["500", "600", "700"] });
const manrope = Manrope({ subsets: ["latin"], variable: "--type-manrope" });
const lora = Lora({ subsets: ["latin"], variable: "--type-lora" });
const archivo = Archivo({ subsets: ["latin"], variable: "--type-archivo" });
const stix = STIX_Two_Text({ subsets: ["latin"], variable: "--type-stix" });

export const metadata: Metadata = {
  metadataBase: new URL("https://aduvia-chi.vercel.app"),
  title: { default: "Aduvia — a calmer way to build consistency", template: "%s · Aduvia" },
  description: "Track daily habits, finish meaningful monthly side quests, and understand your consistency without turning life into a scoreboard.",
  applicationName: "Aduvia",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg?v=6", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg?v=6", type: "image/svg+xml" }],
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Aduvia" },
  formatDetection: { telephone: false },
  openGraph: { type: "website", siteName: "Aduvia", title: "Aduvia — a calmer way to build consistency", description: "Daily habits and monthly side quests in one calm place.", url: "/" },
  twitter: { card: "summary", title: "Aduvia", description: "Daily habits and monthly side quests in one calm place." },
};

export const viewport = { themeColor: "#143d31", colorScheme: "light" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full antialiased ${inter.variable} ${cormorant.variable} ${manrope.variable} ${lora.variable} ${archivo.variable} ${stix.variable}`}>
      <body className="min-h-full flex flex-col"><Script id="theme-init" strategy="beforeInteractive">{THEME_INIT_SCRIPT}</Script><ServiceWorkerRegistration /><NetworkStatus /><AppDataProvider>{children}</AppDataProvider><Analytics /></body>
    </html>
  );
}
