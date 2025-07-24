import type { Metadata } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata: Metadata = getMetadata({
  title: "Request Details",
  description: "Review detailed information about this auction request and take administrative actions.",
});

export default function RequestDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
