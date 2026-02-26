import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { RouteTransition } from "@/components/layout/route-transition";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resume Generator",
  description: "Single-user resume builder with live preview and PDF export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RouteTransition>{children}</RouteTransition>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
