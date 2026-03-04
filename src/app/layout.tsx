import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import AppLayout from "@/components/Layout";

export const metadata: Metadata = {
  title: "PinkDesign - Ideas",
  description: "PinkDesign Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        style={{ margin: 0, padding: 0 }}
      >
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
