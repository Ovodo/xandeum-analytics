import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xandeum pNode Analytics | Real-time Network Dashboard",
  description: "Track and analyze Xandeum pNode network performance, storage utilization, and node health in real-time. The leading analytics platform for Xandeum storage providers.",
  keywords: ["Xandeum", "pNode", "analytics", "Solana", "storage", "blockchain", "decentralized"],
  openGraph: {
    title: "Xandeum pNode Analytics",
    description: "Real-time analytics dashboard for Xandeum storage provider nodes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xandeum pNode Analytics",
    description: "Real-time analytics dashboard for Xandeum storage provider nodes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white min-h-screen`}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1f2937",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
      </body>
    </html>
  );
}
