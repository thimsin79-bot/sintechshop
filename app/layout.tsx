import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { DataProvider } from "@/lib/store";
import { ToastProvider } from "@/lib/toast";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "TechVault • Computer Shop Inventory",
  description: "Inventory, sales and warranty management for a computer shop.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-slate-800 antialiased`}>
        <DataProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </DataProvider>
      </body>
    </html>
  );
}
