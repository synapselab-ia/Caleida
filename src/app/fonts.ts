import { Manrope, Newsreader } from "next/font/google";

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-caleida-interface",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-caleida-editorial",
  display: "swap",
  fallback: ["Georgia", "serif"],
  style: ["normal", "italic"],
  preload: false,
});
