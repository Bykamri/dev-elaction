"use client";

import { useMemo, useState } from "react";
import { formatEther } from "viem";
import { AuctionFiltersSidebar } from "~~/components/auction/auction-filters-sidebar";
import { AuctionListGrid } from "~~/components/auction/auction-list-grid";
import { DesktopFilters } from "~~/components/auction/desktop-filters";
import { SidebarProvider } from "~~/components/ui/sidebar";
import { useAuctions } from "~~/hooks/useAuction";
import { categoryConfig } from "~~/lib/categoryConfig";

/**
 * @title Auctions Listing Page Component
 * @dev Main page component for displaying and filtering available auctions
 * @notice This page provides:
 *   - Grid view of all available auctions with filtering capabilities
 *   - Real-time status filtering (all, open, closed auctions)
 *   - Category-based filtering by asset type
 *   - Price range filtering with min/max price inputs
 *   - Responsive design with mobile sidebar and desktop filter bar
 *   - Search and discovery interface for auction participants
 * @notice Accessible via route: /auctions for browsing all available auctions
 */
const AuctionsPage = () => {
  // ============ Data Fetching ============

  /**
   * @dev Fetch all available auctions from the blockchain
   * @notice Uses custom hook to retrieve auction data and loading state
   * @notice Returns array of auctions with metadata, status, and pricing information
   */
  const { auctions: allAuctions, isLoading } = useAuctions();

  // ============ Filter State Management ============

  /**
   * @dev State for filtering auctions by their current status
   * @notice Options: "all" (show all), "open" (active auctions), "closed" (finished auctions)
   */
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">("all");

  /**
   * @dev State for filtering auctions by asset category
   * @notice Uses category keys from categoryConfig (e.g., "Comics", "Watches", "Books")
   * @notice "all" shows auctions from all categories
   */
  const [filterCategory, setFilterCategory] = useState("all");

  /**
   * @dev State for minimum price filter
   * @notice String value for price input, converted to number during filtering
   */
  const [minPrice, setMinPrice] = useState("");

  /**
   * @dev State for maximum price filter
   * @notice String value for price input, converted to number during filtering
   */
  const [maxPrice, setMaxPrice] = useState("");

  // ============ Category Management ============

  /**
   * @dev Generates unique categories for filter dropdown
   * @notice Memoized to prevent unnecessary recalculation
   * @returns Array of category strings including "all" option
   *
   * Process:
   * 1. Extract all category keys from categoryConfig
   * 2. Filter out "Default" category (internal use only)
   * 3. Prepend "all" option for showing all categories
   */
  const uniqueCategories = useMemo(() => {
    const allCategoryKeys = Object.keys(categoryConfig);
    const categories = allCategoryKeys.filter(key => key !== "Default");
    return ["all", ...categories];
  }, []);

  // ============ Auction Filtering Logic ============

  /**
   * @dev Filters and sorts auctions based on user-selected criteria and optimal display order
   * @notice Memoized to optimize performance during filter changes
   * @returns Array of filtered and sorted auction objects
   *
   * Filtering Process:
   * 1. Status Filter: Check auction status (Live=2, Finished=3)
   * 2. Category Filter: Match auction category with selected filter
   * 3. Price Range Filter: Compare current bid/starting bid with price range
   *
   * Sorting Logic:
   * 1. Live auctions (status=2) appear first, sorted by end time (ending soonest first)
   * 2. Finished auctions (status=3) appear last, sorted by end time (most recently ended first)
   * 3. Other statuses appear in between, sorted by end time
   *
   * Price Logic:
   * - Uses highestBid if available, otherwise falls back to startingBid
   * - Converts from Wei to Ether for human-readable comparison
   */
  const filteredAuctions = useMemo(() => {
    const filtered = allAuctions.filter(auction => {
      // Status Filter: Check if auction matches selected status
      if (filterStatus === "open" && auction.status !== 2 /* Live */) return false;
      if (filterStatus === "closed" && auction.status !== 3 /* Finished */) return false;

      // Category Filter: Check if auction category matches selected filter
      if (filterCategory !== "all" && auction.category !== filterCategory) return false;

      // Price Range Filter: Convert price from Wei to Ether and apply constraints
      const price = parseFloat(formatEther(auction.highestBid > 0n ? auction.highestBid : auction.startingBid));
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;

      return true; // Auction passes all filter criteria
    });

    // Sort auctions for optimal display order
    const sorted = filtered.sort((a, b) => {
      // Priority 1: Live auctions (status=2) come first
      if (a.status === 2 && b.status !== 2) return -1;
      if (b.status === 2 && a.status !== 2) return 1;

      // Priority 2: Finished auctions (status=3) come last
      if (a.status === 3 && b.status !== 3) return 1;
      if (b.status === 3 && a.status !== 3) return -1;

      // For auctions of the same status, sort by end time
      if (a.status === 2 && b.status === 2) {
        // Live auctions: sort by end time (ending soonest first)
        return Number(a.endTime) - Number(b.endTime);
      } else if (a.status === 3 && b.status === 3) {
        // Finished auctions: sort by end time (most recently ended first)
        return Number(b.endTime) - Number(a.endTime);
      } else {
        // Other statuses: sort by end time (ascending)
        return Number(a.endTime) - Number(b.endTime);
      }
    });

    // Debug: Log sorting results
    console.log("📋 Auction Sorting Results:", {
      totalAuctions: allAuctions.length,
      filteredCount: filtered.length,
      sortedOrder: sorted.map(auction => ({
        address: auction.auctionAddress.substring(0, 8) + "...",
        status: auction.status === 2 ? "LIVE" : auction.status === 3 ? "FINISHED" : "OTHER",
        endTime: new Date(Number(auction.endTime) * 1000).toLocaleString(),
        name: auction.assetName || "Unnamed",
      })),
    });

    return sorted;
  }, [allAuctions, filterStatus, filterCategory, minPrice, maxPrice]);

  // ============ Filter Management Functions ============

  /**
   * @dev Resets all filter states to their default values
   * @notice Clears status, category, and price range filters
   */
  const onResetFilters = () => {
    setFilterStatus("all");
    setFilterCategory("all");
    setMinPrice("");
    setMaxPrice("");
  };

  // ============ Component Render ============

  return (
    <SidebarProvider>
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Auction Listings</h1>
          <p className="text-lg text-base-content/70 mt-2">Discover and bid on the assets you desire.</p>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Sidebar */}
          <AuctionFiltersSidebar
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            onResetFilters={onResetFilters}
            uniqueCategories={uniqueCategories}
          />

          {/* Desktop Filter Panel */}
          <DesktopFilters
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            onResetFilters={onResetFilters}
            uniqueCategories={uniqueCategories}
          />

          {/* Auction Display Area */}
          <div className="flex-1">
            {isLoading ? (
              // Loading State: Show spinner while fetching auction data
              <div className="flex justify-center items-center h-96">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              // Auction Grid: Display filtered auctions in responsive grid layout
              <AuctionListGrid auctions={filteredAuctions} />
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

/**
 * @dev Default export for the auction listing page
 * @notice Main page component for browsing and filtering auctions
 */
export default AuctionsPage;
