import type { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "Revenue Results",
  description: "View platform revenue metrics, completed auctions data, and financial performance analytics.",
});

export default function AdminRevenueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
