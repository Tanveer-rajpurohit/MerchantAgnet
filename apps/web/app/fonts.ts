import localFont from "next/font/local";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";

export const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/satoshi/Satoshi-Variable.woff2",
      style: "normal",
      weight: "300 900",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-VariableItalic.woff2",
      style: "italic",
      weight: "300 900",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
