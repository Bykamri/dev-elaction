import type { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "Auction Requests",
  description:
    "Review and manage auction requests from customers. Approve, reject, or modify submitted auction proposals.",
});

export default function AdminRequestsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
