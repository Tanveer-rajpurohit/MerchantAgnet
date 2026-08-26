import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { satoshi, interTight, fontMono } from "./fonts";

export const metadata: Metadata = {
  title: "Merchant Agent",
  description: "Merchant Agent UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${interTight.variable} ${fontMono.variable}`}
    >
      <body className="font-satoshi antialiased">{children}</body>
    </html>
  );
}

