import type { Metadata } from "next";
import type { ReactNode } from "react";
import { manrope, newsreader } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caleida",
  description: "Organização, acompanhamento e descoberta cultural.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
