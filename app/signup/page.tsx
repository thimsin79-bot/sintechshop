import type { Metadata } from "next";
import { SignupPage } from "@/components/auth/SignupPage";

export const metadata: Metadata = {
  title: "Sign up • SINTechshop",
  description: "Create an account for the SINTechshop inventory system.",
};

export default function Page() {
  return <SignupPage />;
}
