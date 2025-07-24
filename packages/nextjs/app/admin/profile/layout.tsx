import type { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "Admin Profile",
  description: "Admin dashboard for managing platform settings, viewing metrics, and managing reviewer access.",
});

export default function AdminProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
