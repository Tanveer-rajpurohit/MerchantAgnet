import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { satoshi, interTight, fontMono, instrumentSerif } from "./fonts";
import ThemeProvider from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "MerchantAgent | AI Growth for Indian Merchants",
    template: "%s | MerchantAgent",
  },
  description:
    "AI agent that runs day-to-day growth actions for small Indian merchants, including payment links, campaigns, checkout, while exposing their catalog for agentic commerce.",
  keywords: [
    "MerchantAgent",
    "AI agent",
    "Indian merchants",
    "Razorpay",
    "payment links",
    "agentic commerce",
    "merchant growth",
    "kirana",
    "D2C",
    "checkout",
    "campaign automation",
  ],
  authors: [{ name: "Tanveer Singh" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "MerchantAgent",
    title: "MerchantAgent | AI Growth for Indian Merchants",
    description:
      "An AI agent that handles payment links, campaigns, and checkout for small Indian merchants. Agentic commerce for the long tail.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MerchantAgent | AI Growth for Indian Merchants",
    description:
      "AI-powered growth actions for small Indian merchants, including payment links, campaigns, and checkout.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${satoshi.variable} ${interTight.variable} ${fontMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="font-satoshi antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
