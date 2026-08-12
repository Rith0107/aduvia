import type { Metadata } from "next";
import { Archivo, Cormorant_Garamond, Inter, Lora, Manrope, STIX_Two_Text } from "next/font/google";
import type { ReactNode } from "react";
import { AppDataProvider } from "@/lib/app-data";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

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
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Aduvia" },
  formatDetection: { telephone: false },
  openGraph: { type: "website", siteName: "Aduvia", title: "Aduvia — a calmer way to build consistency", description: "Daily habits and monthly side quests in one calm place.", url: "/" },
  twitter: { card: "summary", title: "Aduvia", description: "Daily habits and monthly side quests in one calm place." },
};

export const viewport = { themeColor: "#143d31", colorScheme: "light" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${cormorant.variable} ${manrope.variable} ${lora.variable} ${archivo.variable} ${stix.variable}`}>
      <body className="min-h-full flex flex-col"><ServiceWorkerRegistration /><AppDataProvider>{children}</AppDataProvider></body>
    </html>
  );
}
