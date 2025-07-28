"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Clock, DollarSign, Gavel, History, Info, User, Users } from "lucide-react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { Separator } from "~~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { categoryConfig, dynamicAssetFields } from "~~/lib/asset-configs";

/**
 * @fileoverview Auction Detail Main Component
 *
 * This component renders the comprehensive auction detail page with all auction information,
 * bidding functionality, asset details, and interactive features. It handles both active
 * and completed auctions, providing real-time bidding capabilities, attribute displays,
 * bidding history, and responsive layout for optimal user experience across devices.
 * The component integrates with blockchain for real-time auction data and bidding operations.
 *
 * @author Dev Team
 * @version 1.0.0
 */

/**
 * Type definition for individual bid data
 * @typedef {Object} Bid
 */
type Bid = {
  /** Wallet address of the bidder */
  bidder: string;
  /** Bid amount in wei (bigint format) */
  amount: bigint;
};

/**
 * Props interface for AuctionDetailMain component
 * @interface AuctionDetailMainProps
 */
interface AuctionDetailMainProps {
  /** Complete auction object containing all auction data and metadata */
  auction: any;
  /** Current IDRX token allowance for the connected user */
  allowance: bigint;
  /** Formatted time remaining string for active auctions */
  timeLeft: string;
  /** Boolean indicating if the auction has finished */
  isFinished: boolean;
  /** Boolean indicating if the auction has been finalized by admin */
  isFinalized: boolean;
  /** Loading state for auction-related actions (approve/bid) */
  isActionLoading: boolean;
  /** Loading state for data refetching operations */
  isRefetching: boolean;
  /** Dynamic button text based on current action state */
  buttonText: string;
  /** Callback function to handle IDRX token approval */
  onApprove: (amount: string) => void;
  /** Callback function to handle bid placement */
  onBid: (amount: string) => void;
  /** Callback function to handle admin auction ending */
  onEndAuction: () => void;
  /** Boolean indicating if current user can end auctions (admin or deployer) */
  canEndAuctions: boolean;
}

/**
 * AuctionDetailMain Component
 *
 * Renders the comprehensive auction detail page with full auction information,
 * interactive bidding functionality, asset galleries, detailed descriptions,
 * and bidding history. The component handles both active and completed auctions,
 * providing seamless user experience for viewing and participating in auctions.
 *
 * Features:
 * - Responsive image gallery with thumbnail navigation
 * - Real-time bidding interface with approval workflow
 * - Dynamic pricing display based on auction status
 * - Comprehensive asset attribute display
 * - Complete bidding history with participant information
 * - Category-based styling and icons
 * - Loading states and data refetching indicators
 * - Navigation back to auction listings
 * - Token approval and bidding workflow integration
 *
 * @component
 * @param {AuctionDetailMainProps} props - Component props containing auction data and callbacks
 * @returns {JSX.Element} The rendered auction detail page
 */
export function AuctionDetailMain({
  auction,
  allowance,
  timeLeft,
  isFinished,
  isFinalized,
  isActionLoading,
  isRefetching,
  buttonText,
  onApprove,
  onBid,
  onEndAuction,
  canEndAuctions,
}: AuctionDetailMainProps) {
  // Navigation and wallet connection hooks
  const router = useRouter();
  const { address: connectedAddress } = useAccount();

  // Debug: Log auction data to check participant count
  console.log("🔍 Auction Detail Main - Auction Data:", {
    auctionAddress: auction.auctionAddress,
    participantCount: auction.participantCount,
    bidHistoryLength: auction.bidHistory?.length || 0,
    seller: auction.seller,
  });

  /**
   * Formats asset attributes based on category configuration
   * Maps raw attribute data to user-friendly labels based on asset category
   * @param {Array<{name: string, value: string}>} attributesData - Raw attribute data from metadata
   * @param {string} assetCategory - Asset category for field mapping
   * @returns {Array<{label: string, value: string}>} Formatted attributes with proper labels
   */
  const getFormattedAttributes = (attributesData: Array<{ name: string; value: string }>, assetCategory: string) => {
    const categoryFields = dynamicAssetFields[assetCategory] || dynamicAssetFields["Default"];

    return attributesData.map(attr => {
      const fieldConfig = categoryFields.find(
        field =>
          field.id === attr.name ||
          field.label.toLowerCase().replace(/[^a-z0-9]/g, "") === attr.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
      );

      return {
        label: fieldConfig?.label || attr.name,
        value: attr.value,
      };
    });
  };

  // Local state for user bid input
  const [bidAmount, setBidAmount] = useState<string>("");

  /**
   * Handles IDRX token approval action
   * Calls the parent component's approve function with current bid amount
   */
  const handleApproveClick = () => {
    onApprove(bidAmount);
  };

  /**
   * Handles bid placement action
   * Calls the parent component's bid function with current bid amount
   */
  const handleBidClick = () => {
    onBid(bidAmount);
  };

  // Extract and prepare auction data for rendering
  const metadata = auction.metadata;
  const biddingHistory: Bid[] = auction.bidHistory || [];

  // Calculate participant count from bid history as fallback
  const calculatedParticipantCount = new Set(biddingHistory.map(bid => bid.bidder.toLowerCase())).size;
  const participantCount = auction.participantCount ?? calculatedParticipantCount;

  console.log("🧮 Participant Count Calculation:", {
    fromAuction: auction.participantCount,
    calculated: calculatedParticipantCount,
    final: participantCount,
    bidHistoryLength: biddingHistory.length,
  });

  const categoryInfo = categoryConfig[metadata.category] || categoryConfig["Default"];
  const IconComponent = categoryInfo.icon;
  const top5BiddingHistory = biddingHistory.slice(0, 5);
  const mainImage = metadata.image || "/placeholder.svg";

  // Determine price to display based on auction state
  // Shows highest bid if available, otherwise shows starting bid
  const displayBidAmount = auction.highestBid > 0n ? auction.highestBid : auction.startingBid;

  // Convert user bid input to wei for comparison
  const bidInWei = parseEther(bidAmount || "0");

  // Determine if token approval is needed before bidding
  // Required when user has insufficient allowance for their bid amount
  const needsApproval = connectedAddress && bidInWei > 0n && bidInWei > allowance;

  return (
    <>
      {/* Navigation back to auction listings */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/auctions")} className="flex items-center">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Auction List
        </Button>
      </div>

      {/* Main auction detail layout - responsive grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left section: Image gallery (2/3 width on desktop) */}
        <div className="md:col-span-2 space-y-4">
          {/* Main asset image display */}
          <Card className="overflow-hidden">
            <div className="relative w-full h-[450px] md:h-[550px]">
              <Image src={mainImage} alt={metadata.name} layout="fill" objectFit="cover" className="rounded-lg" />
            </div>
          </Card>

          {/* Thumbnail gallery for additional images */}
          {metadata.images && metadata.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {metadata.images.slice(0, 4).map((url: string, index: number) => (
                <div key={index} className="relative w-full h-24 cursor-pointer">
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`${metadata.name} thumbnail ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md border-2 border-transparent hover:border-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right section: Auction information and bidding interface (1/3 width on desktop) */}
        <div className="md:col-span-1 space-y-6">
          {/* Auction Status Banner - Prominent visual indicator */}
          {isFinished && (
            <div
              className={`p-4 rounded-lg shadow-lg border-2 text-white ${
                isFinalized
                  ? "bg-gradient-to-r from-green-500 to-green-600 border-green-300"
                  : "bg-gradient-to-r from-red-500 to-red-600 border-red-300"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {isFinalized ? <Check className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                <span className="text-xl font-bold">{isFinalized ? "AUCTION FINALIZED" : "AUCTION ENDED"}</span>
              </div>
              <div className="text-center text-sm opacity-90">
                {auction.highestBid > 0n
                  ? isFinalized
                    ? `Completed! Won by ${auction.highestBidder.substring(0, 8)}... for ${formatEther(auction.highestBid)} IDRX`
                    : `Won by ${auction.highestBidder.substring(0, 8)}... for ${formatEther(auction.highestBid)} IDRX`
                  : isFinalized
                    ? "Finalized - No bids were placed, item remains with owner"
                    : "No bids were placed during this auction"}
              </div>
            </div>
          )}

          <Card className="relative">
            {/* Loading overlay for data refetching */}
            {isRefetching && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
                <span className="loading loading-spinner"></span>
                <p className="ml-2">Loading...</p>
              </div>
            )}

            {/* Auction header with title and category */}
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">{metadata.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge className={categoryInfo.className}>
                    <IconComponent className="w-4 h-4 mr-1" />
                    {metadata.category}
                  </Badge>
                  {/* Auction status badge - prominent indicator */}
                  {isFinished ? (
                    <Badge variant="destructive" className="bg-red-600 text-white font-semibold">
                      <Clock className="w-4 h-4 mr-1" />
                      ENDED
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600 text-white font-semibold animate-pulse">
                      <Clock className="w-4 h-4 mr-1" />
                      LIVE
                    </Badge>
                  )}
                </div>
              </div>

              {/* Asset proposer information */}
              <div className="flex items-center text-muted-foreground mb-2">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  Proposed by:{" "}
                  <span className="font-mono font-semibold">
                    {auction.seller.substring(0, 8)}...{auction.seller.substring(auction.seller.length - 6)}
                  </span>
                </span>
              </div>

              <CardDescription className="text-muted-foreground text-base">{metadata.shortDescription}</CardDescription>
            </CardHeader>

            {/* Main auction content */}
            <CardContent className="space-y-4">
              {/* Auction status and participant count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="font-semibold">
                    {participantCount} Participant{participantCount !== 1 ? "s" : ""}
                  </span>
                </div>
                {/* Enhanced status badge with different styling */}
                {!isFinished ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-3 py-1 animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></div>
                    Live Auction
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-semibold px-3 py-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Auction Closed
                  </Badge>
                )}
              </div>
              <Separator />

              {/* Active auction interface */}
              {!isFinished ? (
                <div className="space-y-4">
                  {/* Current bid information */}
                  <p className="text-lg text-muted-foreground">
                    {isFinished ? (auction.highestBid > 0n ? "Final Price" : "Unsold") : "Current Bid"}
                  </p>
                  <div className="relative">
                    <p className="text-5xl font-bold text-primary">{formatEther(displayBidAmount)} IDRX</p>
                    {/* Final price indicator for ended auctions */}
                    {isFinished && (
                      <div className="absolute -top-2 -right-2">
                        <Badge variant="destructive" className="text-xs px-2 py-1">
                          FINAL
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Time remaining display */}
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-6 h-6 mr-2" />
                    <span className="text-xl font-semibold">
                      {isFinished ? "Auction Ended" : `${timeLeft} remaining`}
                    </span>
                  </div>

                  {/* Bidding interface for active auctions */}
                  {!isFinished && (
                    <div className="space-y-2 mt-6">
                      <Label htmlFor="bid-amount" className="text-lg font-medium">
                        Place Your Bid
                      </Label>
                      <div className="flex flex-col gap-2">
                        {/* Bid amount input field */}
                        <Input
                          id="bid-amount"
                          type="number"
                          placeholder={`More than ${formatEther(displayBidAmount)} IDRX`}
                          value={bidAmount}
                          onChange={e => setBidAmount(e.target.value)}
                          disabled={isActionLoading}
                        />

                        {/* Conditional button: Approve or Bid */}
                        {needsApproval ? (
                          <Button onClick={handleApproveClick} disabled={isActionLoading || !bidAmount}>
                            {isActionLoading ? (
                              buttonText
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Approve IDRX
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleBidClick}
                            disabled={isActionLoading || !bidAmount || parseEther(bidAmount) <= displayBidAmount}
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                          >
                            {isActionLoading ? (
                              buttonText
                            ) : (
                              <>
                                <Gavel className="w-4 h-4 mr-2" /> Place Bid
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent bidding history preview (top 5) */}
                  {top5BiddingHistory.length > 0 && (
                    <div className="mt-6 space-y-3 border-t pt-4">
                      <h3 className="text-lg font-semibold text-foreground">Recent Bids</h3>
                      <ul className="space-y-2">
                        {top5BiddingHistory.map((bid: Bid, index: number) => (
                          <li key={index} className="flex items-center justify-between text-muted-foreground text-sm">
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              <span>{bid.bidder.substring(0, 8)}...</span>
                            </div>
                            <div className="font-semibold text-foreground">{formatEther(bid.amount)} IDRX</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                /* Finished auction display */
                <div className="space-y-4">
                  {auction.highestBid > 0n ? (
                    /* Auction with winner */
                    <>
                      <p className="text-lg text-muted-foreground">Final Bid</p>
                      <p className="text-5xl font-bold text-primary">{formatEther(auction.highestBid)} IDRX</p>

                      {/* Winner Information */}
                      <div className="flex items-center text-muted-foreground">
                        <User className="w-6 h-6 mr-2" />
                        <span className="text-xl font-semibold">
                          Winner: {auction.highestBidder.substring(0, 8)}...
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Auction without bids */
                    <>
                      <p className="text-lg text-muted-foreground">Auction Status</p>
                      <p className="text-3xl font-bold text-gray-500">Unsold</p>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-6 h-6 mr-2" />
                        <span className="text-xl font-semibold">No bidders</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Admin Finalize Auction Button - Shows when auction is finished but not yet finalized */}
              {isFinished && !isFinalized && (
                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">Admin Controls</span>
                    </div>

                    {/* Asset Owner Information for Admin Reference */}
                    <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
                      <strong>Asset Owner:</strong>{" "}
                      <span className="font-mono">
                        {auction.seller.substring(0, 12)}...{auction.seller.substring(auction.seller.length - 8)}
                      </span>
                    </div>

                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      {canEndAuctions
                        ? "The auction time has expired. As a platform administrator, you can finalize this auction to complete the transaction."
                        : "The auction time has expired. Only platform administrators can finalize expired auctions."}
                    </p>
                    <Button
                      onClick={() => {
                        console.log("🔴 Admin Finalize Auction button clicked");
                        console.log("📊 Button state:", {
                          canEndAuctions,
                          isActionLoading,
                          isFinished,
                          disabled: isActionLoading || !canEndAuctions,
                        });
                        onEndAuction();
                      }}
                      disabled={isActionLoading || !canEndAuctions}
                      variant="outline"
                      size="sm"
                      className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/20"
                    >
                      {isActionLoading
                        ? buttonText
                        : canEndAuctions
                          ? "Finalize Auction"
                          : "Finalize Auction (Admin Only)"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Auction Finalized Status - Shows when auction has been finalized */}
              {isFinished && isFinalized && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Auction Finalized</span>
                    </div>

                    {/* Asset Owner Information for Reference */}
                    <div className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-2 rounded">
                      <strong>Original Owner:</strong>{" "}
                      <span className="font-mono">
                        {auction.seller.substring(0, 12)}...{auction.seller.substring(auction.seller.length - 8)}
                      </span>
                    </div>

                    <p className="text-sm text-green-600 dark:text-green-400">
                      {auction.highestBid > 0n
                        ? "This auction has been successfully finalized by the platform administrator. The ownership transfer process has been completed and the winner can now claim their asset."
                        : "This auction has been finalized by the platform administrator. Since there were no bids, the item remains with the original owner."}
                    </p>

                    {/* Show transaction completion status */}
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Transaction completed successfully</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed information tabs section */}
      <div className="mt-8">
        <Tabs defaultValue="description" className="w-full">
          {/* Tab navigation with icons */}
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">
              <Info className="w-4 h-4 mr-2" /> Description
            </TabsTrigger>
            <TabsTrigger value="attributes">
              <Info className="w-4 h-4 mr-2" /> Attributes
            </TabsTrigger>
            <TabsTrigger value="bidding-history">
              <History className="w-4 h-4 mr-2" /> Bidding History
            </TabsTrigger>
          </TabsList>

          {/* Asset description tab content */}
          <TabsContent value="description" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Item Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{metadata.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Asset attributes tab content */}
          <TabsContent value="attributes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Details</CardTitle>
              </CardHeader>
              <CardContent>
                {metadata.attributes && metadata.attributes.length > 0 ? (
                  <div className="space-y-4">
                    {/* Render formatted attributes with proper labels */}
                    {getFormattedAttributes(metadata.attributes, metadata.category).map((attr, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-medium">{attr.label}:</span>
                        <span className="text-sm font-semibold text-foreground">{attr.value}</span>
                      </div>
                    ))}

                    {/* Asset ownership information separator */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium text-foreground mb-3">Auction Information</h4>

                      {/* Asset Owner */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-medium">Asset Owner:</span>
                        <span className="text-sm font-mono font-semibold text-foreground">
                          {auction.seller.substring(0, 8)}...{auction.seller.substring(auction.seller.length - 6)}
                        </span>
                      </div>

                      {/* Auction Address */}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-muted-foreground font-medium">Auction Contract:</span>
                        <span className="text-sm font-mono font-semibold text-foreground">
                          {auction.auctionAddress.substring(0, 8)}...
                          {auction.auctionAddress.substring(auction.auctionAddress.length - 6)}
                        </span>
                      </div>

                      {/* Show winner information for finished auctions with bids */}
                      {isFinished && auction.highestBid > 0n && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-muted-foreground font-medium">Auction Winner:</span>
                          <span className="text-sm font-mono font-semibold text-green-600 dark:text-green-400">
                            {auction.highestBidder.substring(0, 8)}...
                            {auction.highestBidder.substring(auction.highestBidder.length - 6)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">No specific attributes available for this asset.</p>

                    {/* Asset ownership information for assets without attributes */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium text-foreground mb-3">Auction Information</h4>

                      {/* Asset Owner */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-medium">Asset Owner:</span>
                        <span className="text-sm font-mono font-semibold text-foreground">
                          {auction.seller.substring(0, 8)}...{auction.seller.substring(auction.seller.length - 6)}
                        </span>
                      </div>

                      {/* Auction Address */}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-muted-foreground font-medium">Auction Contract:</span>
                        <span className="text-sm font-mono font-semibold text-foreground">
                          {auction.auctionAddress.substring(0, 8)}...
                          {auction.auctionAddress.substring(auction.auctionAddress.length - 6)}
                        </span>
                      </div>

                      {/* Show winner information for finished auctions with bids */}
                      {isFinished && auction.highestBid > 0n && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-muted-foreground font-medium">Auction Winner:</span>
                          <span className="text-sm font-mono font-semibold text-green-600 dark:text-green-400">
                            {auction.highestBidder.substring(0, 8)}...
                            {auction.highestBidder.substring(auction.highestBidder.length - 6)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Complete bidding history tab content */}
          <TabsContent value="bidding-history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Complete Bidding History</CardTitle>
              </CardHeader>
              <CardContent>
                {biddingHistory.length > 0 ? (
                  <ul className="space-y-3">
                    {/* Display all bidding history with bidder and amount */}
                    {biddingHistory.map((bid: Bid, index: number) => (
                      <li key={index} className="flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>{bid.bidder.substring(0, 8)}...</span>
                        </div>
                        <div className="flex items-center font-semibold text-foreground">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatEther(bid.amount)} IDRX
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No bidding history yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
