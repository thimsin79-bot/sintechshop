import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/lib/auth";
import { CompanyProvider } from "@/lib/company";
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
      <body className={`${inter.className} app-background text-slate-800 antialiased`}>
        <DataProvider>
          <CompanyProvider>
            <ToastProvider>
              <AuthProvider>
                <AppShell>{children}</AppShell>
              </AuthProvider>
            </ToastProvider>
          </CompanyProvider>
        </DataProvider>
      </body>
    </html>
  );
}
