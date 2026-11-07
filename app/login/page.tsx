import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Sign in • SINTech",
  description: "Sign in to the SINTech inventory system.",
};

export default function Page() {
  return <LoginPage />;
}
