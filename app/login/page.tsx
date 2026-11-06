import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Sign in • SINTechshop",
  description: "Sign in to the SINTechshop inventory system.",
};

export default function Page() {
  return <LoginPage />;
}
