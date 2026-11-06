import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Sign in • TechVault",
  description: "Sign in to the TechVault computer shop inventory system.",
};

export default function Page() {
  return <LoginPage />;
}
