"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleDotDashed, Clock, User, XCircle } from "lucide-react";
import { formatEther } from "viem";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { CategoryBadge } from "~~/utils/CategoryBadge";
import { shortenAddress } from "~~/utils/addressFormat";

/**
 * @fileoverview Auction Card Component
 *
 * This component displays individual auction cards in the main auction marketplace.
 * It shows active and completed auctions with their asset information, current bidding
 * status, time remaining, and provides navigation to detailed auction pages.
 * The component handles real-time countdown timers for live auctions and displays
 * appropriate status indicators and pricing information based on auction state.
 *
 * @author Dev Team
 * @version 1.0.0
 */

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
 * Type definition for auction card properties
 * @typedef {Object} AuctionCardProps
 */
type AuctionCardProps = {
  /** Auction object containing all auction-related data */
  auction: {
    /** Unique identifier for the auction proposal */
    proposalId: bigint;
    /** Wallet address of the auction proposer/seller */
    proposer: string;
    /** Name/title of the asset being auctioned */
    assetName: string;
    /** Short description of the asset */
    shortDescription?: string;
    /** URL of the asset image for display */
    imageUrl: string;
    /** Category classification of the asset */
    category: string;
    /** Initial bid amount set by the seller */
    startingBid: bigint;
    /** Current highest bid amount */
    highestBid: bigint;
    /** Current status of the auction */
    status: ProposalStatus;
    /** Smart contract address of the auction */
    auctionAddress: string;
    /** Unix timestamp when the auction ends */
    endTime: bigint;
  };
};

/**
 * AuctionCard Component
 *
 * Renders an individual auction card with comprehensive auction information
 * including asset details, current bidding status, time remaining for live
 * auctions, and navigation controls. The component provides real-time updates
 * for active auctions and displays appropriate visual indicators for different
 * auction states.
 *
 * Features:
 * - Real-time countdown timer for live auctions
 * - Status-based visual indicators (Live, Finished)
 * - Dynamic pricing display (starting bid vs highest bid)
 * - Asset image with fallback handling
 * - Category and seller information
 * - Responsive card layout with hover effects
 * - Conditional action buttons based on auction status
 * - Automatic navigation to detailed auction view
 *
 * @component
 * @param {AuctionCardProps} props - Component props containing auction data
 * @returns {JSX.Element} The rendered auction card
 */
export const AuctionCard = ({ auction }: AuctionCardProps) => {
  // State for tracking real-time countdown
  const [timeLeft, setTimeLeft] = useState("");

  // Check if auction has finished
  const isFinished = auction.status === ProposalStatus.Finished;

  // Effect hook for managing real-time countdown timer
  useEffect(() => {
    // Skip timer setup for finished or non-live auctions
    if (isFinished || auction.status !== ProposalStatus.Live) {
      if (isFinished) setTimeLeft("Auction Ended");
      return;
    }

    // Set up interval for countdown timer updates
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Number(auction.endTime) - now;

      // Check if auction has ended
      if (remaining <= 0) {
        setTimeLeft("Auction Ended");
        clearInterval(interval);
        return;
      }

      // Calculate and format remaining time (days, hours, minutes, seconds)
      const d = Math.floor(remaining / 86400);
      const h = Math.floor((remaining % 86400) / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [auction.endTime, auction.status, isFinished]);

  /**
   * Determines the appropriate price to display
   * Shows highest bid if available, otherwise shows starting bid
   * @returns {bigint} The price to display in the card
   */
  const getDisplayPrice = () => {
    if (auction.highestBid > 0n) {
      return auction.highestBid;
    }
    return auction.startingBid;
  };

  // Get the price to display and create navigation link
  const displayPrice = getDisplayPrice();
  const linkToDetails = `/auctions/${auction.auctionAddress}`;

  /**
   * Generates appropriate status badge based on auction status
   * Returns different badges with colors and icons for Live and Finished states
   * @returns {JSX.Element | null} Status badge component or null
   */
  const getStatusBadge = () => {
    if (auction.status === ProposalStatus.Live) {
      return (
        <Badge className="absolute top-3 left-3 bg-green-100 text-green-800 border-green-300">
          <CircleDotDashed className="w-3 h-3 mr-1" /> Live
        </Badge>
      );
    }
    if (auction.status === ProposalStatus.Finished) {
      return (
        <Badge variant="secondary" className="absolute top-3 left-3">
          <XCircle className="w-3 h-3 mr-1" /> Finished
        </Badge>
      );
    }
    return null;
  };

  return (
    // Main card container with hover effects and flexible layout
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {/* Clickable image section with navigation to auction details */}
      <Link href={linkToDetails} passHref>
        <div className="relative">
          <Image
            src={auction.imageUrl}
            alt={auction.assetName}
            width={400}
            height={300}
            className="w-full h-48 object-cover"
          />
          {/* Status badge overlay (top-left) */}
          {getStatusBadge()}
          {/* Category badge overlay (top-right) */}
          <div className="absolute top-3 right-3">
            <CategoryBadge category={auction.category} />
          </div>
        </div>
      </Link>

      {/* Card header with asset name and seller information */}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground truncate" title={auction.assetName}>
          {auction.assetName}
        </CardTitle>
        {/* Short description */}
        {auction.shortDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1" title={auction.shortDescription}>
            {auction.shortDescription}
          </p>
        )}
        <CardDescription className="text-sm flex items-center" title={auction.proposer}>
          <User className="w-4 h-4 mr-1.5" />
          <span>By: {shortenAddress(auction.proposer)}</span>
        </CardDescription>
      </CardHeader>

      {/* Card content with pricing and time information */}
      <CardContent className="pt-0 flex-grow">
        <div className="flex justify-between items-center">
          {/* Price information section */}
          <div>
            <p className="text-sm text-muted-foreground">
              {isFinished
                ? auction.highestBid > 0n
                  ? "Final Price"
                  : "Unsold"
                : auction.highestBid > 0n
                  ? "Highest Bid"
                  : "Starting Price"}
            </p>
            <p className="text-2xl font-bold text-primary">{formatEther(displayPrice)} IDRX</p>
          </div>

          {/* Time remaining section (only for active auctions) */}
          <div className="text-right">
            {!isFinished && (
              <>
                <p className="text-sm text-muted-foreground">Time Left</p>
                <p className="text-lg font-semibold flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {timeLeft || "Loading..."}
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>

      {/* Action button section */}
      <div className="p-4 pt-0 mt-auto">
        <Button asChild className="w-full" disabled={isFinished}>
          <Link href={linkToDetails}>
            {isFinished ? "Auction Ended" : "View Auction"}
            {!isFinished && <ArrowRight className="ml-2 h-4 w-4" />}
          </Link>
        </Button>
      </div>
    </Card>
  );
};
