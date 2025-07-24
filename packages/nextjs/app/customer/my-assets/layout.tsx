import type { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "My Assets",
  description: "View and manage your owned assets, items you've won in auctions, and assets you've put up for auction.",
});

export default function MyAssetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
