import type { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "My Profile",
  description: "Manage your profile, view wallet balance, and track your auction activity and transaction history.",
});

export default function CustomerProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
