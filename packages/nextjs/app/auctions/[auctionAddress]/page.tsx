"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { AuctionDetailMain } from "~~/components/auction/auction-detail-main";
import { useAuctionDetails } from "~~/hooks/useAuctionDetails";

export default function AuctionDetailPage({ params }: { params: Promise<{ auctionAddress: string }> }) {
  const resolvedParams = use(params);

  // Use the improved auction details hook
  const {
    auction,
    allowance,
    isLoading,
    isRefetching,
    timeLeft,
    isFinished,
    isActionLoading,
    handleApprove,
    handleBid,
  } = useAuctionDetails(resolvedParams.auctionAddress as `0x${string}`);

  // Loading state
  if (isLoading) {
    return (
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center">Memuat detail lelang...</div>
      </main>
    );
  }

  // Check if auction exists
  if (!auction) {
    notFound();
  }

  // Prepare auction object for the component
  const auctionForComponent = {
    metadata: auction.metadata,
    startingBid: auction.startingBid,
    highestBid: auction.highestBid,
    bidHistory: auction.bidHistory,
    endTime: BigInt(auction.endTime),
    auctionAddress: auction.auctionAddress,
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
      <AuctionDetailMain
        auction={auctionForComponent}
        allowance={allowance}
        timeLeft={timeLeft}
        isFinished={isFinished}
        isActionLoading={isActionLoading}
        isRefetching={isRefetching}
        buttonText={isFinished ? "Lelang Selesai" : allowance > 0n ? "Place Bid" : "Approve Token"}
        onApprove={handleApprove}
        onBid={handleBid}
      />
    </main>
  );
}
