import type { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "Auctions",
  description:
    "Browse and participate in live blockchain auctions for high-value assets. Find rare collectibles, real estate, and more.",
});

export default function AuctionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
