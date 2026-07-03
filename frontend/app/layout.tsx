import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReWear AI — Repair & Restyle Your Clothes",
  description:
    "Upload a photo of any damaged or unworn clothing item. AI identifies the issue and gives you step-by-step repair instructions or fresh styling ideas. Save clothes from landfill.",
  keywords: ["sustainable fashion", "clothing repair", "upcycling", "AI styling"],
  openGraph: {
    title: "ReWear AI",
    description: "Repair or restyle your clothes with AI — not the landfill.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
