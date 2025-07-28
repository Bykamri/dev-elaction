"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, DollarSign, Hourglass, User, XCircle } from "lucide-react";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { auctionAbi } from "~~/contracts/auctionAbi";
import { useProposalData } from "~~/hooks/useProposalData";
import { CategoryBadge } from "~~/utils/CategoryBadge";
import { shortenAddress } from "~~/utils/addressFormat";

/**
 * @fileoverview Auction Request Card Component
 *
 * This component displays individual auction request cards in the admin dashboard.
 * It shows auction proposals with their current status, asset information, bidding details,
 * and allows administrators to view detailed information about each auction request.
 * The component handles real-time auction data including highest bids and time remaining
 * for live auctions, and provides visual status indicators for different auction states.
 *
 * @author Dev Team
 * @version 1.0.0
 */

/**
 * Props interface for AuctionRequestCard component
 * @interface AuctionRequestCardProps
 */
interface AuctionRequestCardProps {
  /** The unique identifier for the auction proposal */
  proposalId: bigint;
  /** The auction factory contract instance for blockchain interactions */
  auctionFactoryContract: any;
}

/**
 * Enumeration of possible auction proposal statuses
 * @enum {number}
 */
enum ProposalStatus {
  /** Proposal is waiting for admin review */
  Pending,
  /** Proposal has been rejected by admin */
  Rejected,
  /** Auction is currently live and accepting bids */
  Live,
  /** Auction has ended */
  Finished,
}

/**
 * AuctionRequestCard Component
 *
 * Renders an individual auction request card with comprehensive information
 * about the auction proposal including asset details, current status, bidding
 * information, and administrative controls. The component provides real-time
 * updates for live auctions and displays appropriate status indicators.
 *
 * Features:
 * - Real-time auction data updates (highest bid, time remaining)
 * - Status-based visual indicators with color-coded badges
 * - Asset image display with fallback placeholder
 * - Responsive card layout with hover effects
 * - Category and seller information display
 * - Loading states with skeleton animations
 * - Direct navigation to detailed auction view
 * - Automatic countdown timer for live auctions
 * - Blockchain integration for live auction data
 *
 * @component
 * @param {AuctionRequestCardProps} props - Component props
 * @returns {JSX.Element} The rendered auction request card
 */
export function AuctionRequestCard({ proposalId, auctionFactoryContract }: AuctionRequestCardProps) {
  // Extract proposal data using custom hook
  const { proposal, assetName, description, imageUrl, isLoading, categories } = useProposalData(
    proposalId,
    auctionFactoryContract,
  );

  // State for tracking real-time auction data
  const [highestBid, setHighestBid] = useState(0n);
  const [timeLeft, setTimeLeft] = useState("");

  // Blockchain client for reading contract data
  const publicClient = usePublicClient();

  // Effect hook for fetching and updating real-time auction data
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    /**
     * Fetches live auction data from the blockchain
     * Updates highest bid and starts countdown timer for live auctions
     */
    const fetchAuctionData = async () => {
      if (proposal && publicClient) {
        const status: ProposalStatus = proposal[4];
        const auctionAddress: `0x${string}` = proposal[5];

        // Only fetch data for live or finished auctions with valid addresses
        if (
          auctionAddress &&
          auctionAddress !== "0x0000000000000000000000000000000000000000" &&
          (status === ProposalStatus.Live || status === ProposalStatus.Finished)
        ) {
          try {
            // Read highest bid from auction contract
            const bid = await publicClient.readContract({
              address: auctionAddress,
              abi: auctionAbi,
              functionName: "highestBid",
            });

            // Read auction end time from contract
            const end = await publicClient.readContract({
              address: auctionAddress,
              abi: auctionAbi,
              functionName: "endTime",
            });

            setHighestBid(bid as bigint);

            // Set up countdown timer for live auctions
            interval = setInterval(() => {
              const remaining = Number(end) - Math.floor(Date.now() / 1000);
              if (remaining <= 0) {
                setTimeLeft("Finished");
                clearInterval(interval);
              } else {
                // Calculate and format remaining time (days, hours, minutes)
                const d = Math.floor(remaining / 86400);
                const h = Math.floor((remaining % 86400) / 3600);
                const m = Math.floor((remaining % 3600) / 60);
                setTimeLeft(`${d}d ${h}h ${m}m`);
              }
            }, 1000);
          } catch {
            // Silently handle auction data fetch errors
            // This prevents console spam during normal operation
          }
        }
      }
    };

    fetchAuctionData();

    // Cleanup interval on component unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [proposal, publicClient]);

  // Loading state with skeleton animation
  if (isLoading || !proposal) {
    return (
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Skeleton for image area */}
          <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
        </div>
        <CardHeader className="pb-2">
          {/* Skeleton for title */}
          <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded"></div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Skeleton for content */}
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Extract proposal data for display
  const currentStatus: ProposalStatus = proposal[4];
  const sellerAddress = proposal[0];
  const startingBid = proposal[2];

  // Status badge configuration with appropriate colors and icons
  const statusBadge = {
    [ProposalStatus.Pending]: (
      <Badge className="absolute top-3 left-3 bg-yellow-100 text-yellow-800">
        <Hourglass className="w-3 h-3 mr-1" /> Pending Review
      </Badge>
    ),
    [ProposalStatus.Rejected]: (
      <Badge className="absolute top-3 left-3 bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" /> Rejected
      </Badge>
    ),
    [ProposalStatus.Live]: (
      <Badge className="absolute top-3 left-3 bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" /> Live
      </Badge>
    ),
    [ProposalStatus.Finished]: (
      <Badge className="absolute top-3 left-3 bg-gray-200 text-gray-800">
        <CheckCircle className="w-3 h-3 mr-1" /> Finished
      </Badge>
    ),
  }[currentStatus];

  return (
    // Main card container with hover effects
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image section with overlay badges */}
      <div className="relative">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={assetName}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
        {/* Status badge overlay (top-left) */}
        {statusBadge}
        {/* Category badge overlay (top-right) */}
        <div className="absolute top-3 right-3">
          <CategoryBadge category={categories} />
        </div>
      </div>

      {/* Card header with asset information */}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground truncate" title={assetName}>
          {assetName || "Loading name..."}
        </CardTitle>
        <CardDescription className="text-muted-foreground line-clamp-2 text-sm">{description || "..."}</CardDescription>
      </CardHeader>

      {/* Card content with auction details */}
      <CardContent className="pt-0 space-y-4">
        {/* Seller information display */}
        <div className="flex items-center text-muted-foreground text-sm">
          <User className="w-4 h-4 mr-1" />
          <span className="truncate">Proposed by: {shortenAddress(sellerAddress)}</span>
        </div>

        {/* Conditional pricing information based on auction status */}
        {currentStatus === ProposalStatus.Pending && (
          <div className="flex items-center text-muted-foreground text-sm">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>Starting Price: {formatEther(startingBid)} IDRX</span>
          </div>
        )}

        {/* Live auction pricing with real-time updates */}
        {currentStatus === ProposalStatus.Live && (
          <div className="flex items-center text-muted-foreground text-sm">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>
              {highestBid > 0n
                ? `Highest Bid: ${formatEther(highestBid)} IDRX`
                : `Starting Price: ${formatEther(startingBid)} IDRX`}
            </span>
            {/* Real-time countdown timer */}
            <p className="ml-auto text-xs font-semibold">{timeLeft}</p>
          </div>
        )}

        {/* Finished auction final pricing */}
        {currentStatus === ProposalStatus.Finished && (
          <div className="flex items-center text-muted-foreground text-sm">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>{highestBid > 0n ? `Final Price: ${formatEther(highestBid)} IDRX` : "Unsold (No bidders)"}</span>
          </div>
        )}

        {/* Action button for viewing detailed auction information */}
        <div className="flex flex-col gap-2 pt-2">
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href={`/admin/requests/${proposalId.toString()}`}>
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
