"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { AuctionDetailMain } from "~~/components/auction/auction-detail-main";
import { useAdminRole } from "~~/hooks/useAdminRole";
import { useAuctionDetails } from "~~/hooks/useAuctionDetails";

/**
 * @title Auction Detail Page Component
 * @dev Dynamic page component for displaying individual auction details
 * @notice This page provides:
 *   - Real-time auction information including current bid, time remaining, and bid history
 *   - Interactive bidding functionality with token approval workflow
 *   - Auction metadata display including images, descriptions, and attributes
 *   - Asset-specific attributes display formatted according to category configuration
 *   - Automatic status updates and countdown timer for active auctions
 * @notice Accessible via route: /auctions/[auctionAddress] where auctionAddress is the deployed auction contract address
 */

/**
 * @dev Main auction detail page component
 * @param params Promise containing route parameters with auction contract address
 * @notice Uses Next.js 13+ app router with async params for dynamic routing
 * @returns Rendered auction detail page with interactive bidding interface
 */
export default function AuctionDetailPage({ params }: { params: Promise<{ auctionAddress: string }> }) {
  // ============ Route Parameter Resolution ============

  /**
   * @dev Resolve the async params to extract auction address
   * @notice Uses React's `use` hook to unwrap the Promise-based params
   * @notice Required for Next.js 13+ app router dynamic routes
   */
  const resolvedParams = use(params);

  // ============ Auction Data and Interaction Hooks ============

  /**
   * @dev Custom hook for fetching and managing auction state
   * @notice Provides comprehensive auction data and interaction handlers:
   *   - auction: Complete auction data including metadata, bids, and contract info
   *   - allowance: Current IDRX token allowance for the auction contract
   *   - isLoading: Loading state for initial data fetch
   *   - isRefetching: Loading state for data updates/refetches
   *   - timeLeft: Remaining time until auction ends (in seconds)
   *   - isFinished: Boolean indicating if auction has ended
   *   - isActionLoading: Loading state for user actions (bidding, approval)
   *   - handleApprove: Function to approve IDRX tokens for bidding
   *   - handleBid: Function to submit a bid to the auction
   *   - handleEndAuction: Function to finalize auctions (admin only)
   */
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
    handleEndAuction,
  } = useAuctionDetails(resolvedParams.auctionAddress as `0x${string}`);

  /**
   * @dev Custom hook for admin role verification
   * @notice Provides administrative permission checking:
   *   - canEndAuctions: Boolean indicating if user can finalize auctions
   */
  const { canEndAuctions } = useAdminRole();

  // ============ Loading State Handling ============

  /**
   * @dev Display loading message while fetching auction data from blockchain
   * @notice Shows centered loading text during initial data retrieval
   */
  if (isLoading) {
    return (
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center">Loading auction details...</div>
      </main>
    );
  }

  // ============ Error State Handling ============

  /**
   * @dev Handle case where auction doesn't exist or failed to load
   * @notice Triggers Next.js 404 page when auction data is unavailable
   * @notice This occurs when auction address is invalid or auction contract doesn't exist
   */
  if (!auction) {
    notFound();
  }

  // ============ Data Transformation for Component ============

  /**
   * @dev Transform auction data into format expected by AuctionDetailMain component
   * @notice Ensures proper data types and structure for component props
   * @notice Converts endTime to BigInt as required by the component interface
   */
  const auctionForComponent = {
    metadata: auction.metadata, // Asset metadata including name, description, images, attributes
    startingBid: auction.startingBid, // Minimum bid amount set when auction was created
    highestBid: auction.highestBid, // Current highest bid amount
    bidHistory: auction.bidHistory, // Array of all bids placed on this auction
    endTime: BigInt(auction.endTime), // Auction end timestamp as BigInt
    auctionAddress: auction.auctionAddress, // Contract address of this auction
  };

  // ============ Main Component Render ============

  /**
   * @dev Render the complete auction detail interface
   * @notice Passes all necessary data and handlers to the main auction component
   */
  return (
    <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
      <AuctionDetailMain
        auction={auctionForComponent} // Transformed auction data
        allowance={allowance} // Current IDRX token allowance for bidding
        timeLeft={timeLeft} // Remaining auction time in seconds
        isFinished={isFinished} // Whether auction has ended
        isActionLoading={isActionLoading} // Loading state for user actions
        isRefetching={isRefetching} // Loading state for data updates
        buttonText={
          isFinished
            ? "Auction Finished" // Show completion message for ended auctions
            : allowance > 0n
              ? "Place Bid" // Allow bidding when tokens are approved
              : "Approve Token" // Require token approval before bidding
        }
        onApprove={handleApprove} // Token approval handler
        onBid={handleBid} // Bid submission handler
        onEndAuction={handleEndAuction} // Admin auction finalization handler
        canEndAuctions={canEndAuctions} // Admin permission for auction ending
      />
    </main>
  );
}
