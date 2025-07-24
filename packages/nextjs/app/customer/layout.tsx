import type { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "Customer Area",
  description: "Access your customer dashboard to manage auctions, assets, and profile settings.",
});

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
