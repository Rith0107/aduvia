import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppDataProvider } from "@/lib/app-data";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aduvia",
  description: "Build routines. Finish meaningful side quests.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><AppDataProvider>{children}</AppDataProvider></body>
    </html>
  );
}
