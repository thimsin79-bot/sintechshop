import type { Metadata } from "next";
import { SignupPage } from "@/components/auth/SignupPage";

export const metadata: Metadata = {
  title: "Sign up • SINTech",
  description: "Create an account for the SINTech inventory system.",
};

export default function Page() {
  return <SignupPage />;
}
