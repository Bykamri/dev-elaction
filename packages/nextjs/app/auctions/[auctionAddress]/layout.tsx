import type { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "Auction Details",
  description: "View detailed information about this auction, place bids, and track auction progress in real-time.",
});

export default function AuctionDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
