"use client";

import { useState } from "react";
import { AuctionCard } from "~~/components/auction/auction-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~~/components/ui/pagination";

/**
 * @fileoverview Auction List Grid Component
 *
 * This component renders a responsive grid of auction cards with pagination functionality.
 * It displays auctions in a grid layout that adapts to different screen sizes and provides
 * pagination controls for large datasets. The component handles items per page selection,
 * page navigation, and empty state display when no auctions match the current filters.
 * It serves as the main display component for auction listings with optimal user experience.
 *
 * @author Dev Team
 * @version 1.0.0
 */

/**
 * Props interface for AuctionListGrid component
 * @interface AuctionListGridProps
 */
type AuctionListGridProps = {
  /** Array of auction objects to display in the grid */
  auctions: any[];
};

/**
 * AuctionListGrid Component
 *
 * Renders a responsive grid of auction cards with comprehensive pagination functionality.
 * The component automatically calculates pagination based on the provided auction data
 * and offers customizable items per page options. It provides an optimal viewing
 * experience across different device sizes with responsive grid layouts.
 *
 * Features:
 * - Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
 * - Dynamic pagination with configurable items per page
 * - Page navigation with previous/next controls
 * - Direct page number navigation
 * - Items per page selection (4, 8, 12, 16)
 * - Empty state handling with user-friendly messages
 * - Accessible pagination controls with ARIA attributes
 * - Automatic page reset when changing items per page
 *
 * @component
 * @param {AuctionListGridProps} props - Component props containing auction data
 * @returns {JSX.Element} The rendered auction grid with pagination
 */
export const AuctionListGrid = ({ auctions }: AuctionListGridProps) => {
  // Pagination state management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Calculate pagination values based on current settings
  const totalPages = Math.ceil(auctions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAuctions = auctions.slice(indexOfFirstItem, indexOfLastItem);

  /**
   * Navigates to a specific page number
   * Validates page number is within valid range before updating
   * @param {number} pageNumber - Target page number to navigate to
   */
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  /**
   * Handles previous page navigation
   * Prevents default link behavior and navigates to previous page
   * @param {React.MouseEvent<HTMLAnchorElement>} e - Click event
   */
  const handlePrevious = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    paginate(currentPage - 1);
  };

  /**
   * Handles next page navigation
   * Prevents default link behavior and navigates to next page
   * @param {React.MouseEvent<HTMLAnchorElement>} e - Click event
   */
  const handleNext = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    paginate(currentPage + 1);
  };

  /**
   * Handles items per page selection change
   * Updates items per page and resets to first page
   * @param {React.ChangeEvent<HTMLSelectElement>} e - Select change event
   */
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Display empty state message when no auctions match filters
  if (auctions.length === 0) {
    return <div className="text-center col-span-full py-20">No auctions match your current filters.</div>;
  }

  return (
    <>
      {/* Responsive auction grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
        {currentAuctions.map(auction => (
          <AuctionCard key={auction.proposalId} auction={auction} />
        ))}
      </div>

      {/* Pagination controls - only show if more than one page */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm font-medium whitespace-nowrap">
              Items per Page:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="p-2 border rounded-md bg-base-100 text-base-content"
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
            </select>
          </div>

          {/* Main pagination navigation */}
          <Pagination>
            <PaginationContent>
              {/* Previous page button */}
              <PaginationItem>
                <PaginationPrevious href="#" onClick={handlePrevious} aria-disabled={currentPage === 1} />
              </PaginationItem>

              {/* Individual page number buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={e => {
                      e.preventDefault();
                      paginate(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Next page button */}
              <PaginationItem>
                <PaginationNext href="#" onClick={handleNext} aria-disabled={currentPage === totalPages} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};
