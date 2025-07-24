import type { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "Admin Dashboard",
  description:
    "Administrative dashboard for managing the auction platform, reviewing requests, and monitoring performance.",
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
