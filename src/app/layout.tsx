import type { Metadata } from "next";
import { Archivo, Cormorant_Garamond, Inter, Lora, Manrope, STIX_Two_Text } from "next/font/google";
import type { ReactNode } from "react";
import { AppDataProvider } from "@/lib/app-data";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--type-inter" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--type-cormorant", weight: ["500", "600", "700"] });
const manrope = Manrope({ subsets: ["latin"], variable: "--type-manrope" });
const lora = Lora({ subsets: ["latin"], variable: "--type-lora" });
const archivo = Archivo({ subsets: ["latin"], variable: "--type-archivo" });
const stix = STIX_Two_Text({ subsets: ["latin"], variable: "--type-stix" });

export const metadata: Metadata = {
  title: "Aduvia",
  description: "Build routines. Finish meaningful side quests.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${cormorant.variable} ${manrope.variable} ${lora.variable} ${archivo.variable} ${stix.variable}`}>
      <body className="min-h-full flex flex-col"><AppDataProvider>{children}</AppDataProvider></body>
    </html>
  );
}
