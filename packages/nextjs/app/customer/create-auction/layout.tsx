import type { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "Create Auction",
  description:
    "Create a new auction for your high-value assets. Submit your asset for review and approval by our admin team.",
});

export default function CreateAuctionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
