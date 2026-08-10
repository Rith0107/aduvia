import type { Metadata } from "next";
import { Archivo, Bodoni_Moda, Cormorant_Garamond, DM_Serif_Display, Inter, Lora, Manrope, Space_Grotesk, STIX_Two_Text } from "next/font/google";
import type { ReactNode } from "react";
import { AppDataProvider } from "@/lib/app-data";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--type-inter" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--type-cormorant", weight: ["500", "600", "700"] });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], variable: "--type-dm-serif", weight: "400" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--type-bodoni" });
const manrope = Manrope({ subsets: ["latin"], variable: "--type-manrope" });
const lora = Lora({ subsets: ["latin"], variable: "--type-lora" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--type-space" });
const archivo = Archivo({ subsets: ["latin"], variable: "--type-archivo" });
const stix = STIX_Two_Text({ subsets: ["latin"], variable: "--type-stix" });

export const metadata: Metadata = {
  title: "Aduvia",
  description: "Build routines. Finish meaningful side quests.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${cormorant.variable} ${dmSerif.variable} ${bodoni.variable} ${manrope.variable} ${lora.variable} ${spaceGrotesk.variable} ${archivo.variable} ${stix.variable}`}>
      <body className="min-h-full flex flex-col"><AppDataProvider>{children}</AppDataProvider></body>
    </html>
  );
}
