"use client";

import { Button } from "~~/components/ui/button";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from "~~/components/ui/sidebar";
import { useIsMobile } from "~~/hooks/use-mobile";

/**
 * @fileoverview Auction Filters Sidebar Component
 *
 * This component provides a mobile-responsive sidebar with filtering options for auctions.
 * It includes filters for auction status (all/open/closed), item categories, and price ranges.
 * The sidebar is specifically designed for mobile devices and includes collapsible functionality
 * with an offcanvas layout pattern. Users can filter auctions by multiple criteria and reset
 * all filters with a single action.
 *
 * @author Dev Team
 * @version 1.0.0
 */

/**
 * Props interface for AuctionFiltersSidebar component
 * @interface AuctionFiltersSidebarProps
 */
type AuctionFiltersSidebarProps = {
  /** Current auction status filter selection */
  filterStatus: "all" | "open" | "closed";
  /** Callback function to update auction status filter */
  setFilterStatus: (status: "all" | "open" | "closed") => void;
  /** Current category filter selection */
  filterCategory: string;
  /** Callback function to update category filter */
  setFilterCategory: (category: string) => void;
  /** Current minimum price filter value as string */
  minPrice: string;
  /** Callback function to update minimum price filter */
  setMinPrice: (price: string) => void;
  /** Current maximum price filter value as string */
  maxPrice: string;
  /** Callback function to update maximum price filter */
  setMaxPrice: (price: string) => void;
  /** Callback function to reset all filters to default values */
  onResetFilters: () => void;
  /** Array of unique categories available for filtering */
  uniqueCategories: string[];
};

/**
 * AuctionFiltersSidebar Component
 *
 * Renders a mobile-specific sidebar with comprehensive filtering options for auctions.
 * The component provides an intuitive interface for users to filter auctions by status,
 * category, and price range. It uses an offcanvas layout pattern for optimal mobile
 * user experience and includes responsive design considerations.
 *
 * Features:
 * - Mobile-only display (hidden on desktop)
 * - Auction status filtering (all, open, closed)
 * - Dynamic category filtering based on available categories
 * - Price range filtering with min/max inputs
 * - One-click filter reset functionality
 * - Collapsible offcanvas sidebar layout
 * - Screen reader accessible labels
 * - Responsive input controls
 *
 * @component
 * @param {AuctionFiltersSidebarProps} props - Component props containing filter states and callbacks
 * @returns {JSX.Element | null} The rendered sidebar component or null for desktop
 */
export function AuctionFiltersSidebar({
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onResetFilters,
  uniqueCategories,
}: AuctionFiltersSidebarProps) {
  // Check if current device is mobile for conditional rendering
  const isMobile = useIsMobile();

  // Only render sidebar on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    // Main collapsible sidebar container with offcanvas behavior
    <Sidebar collapsible="offcanvas">
      {/* Sidebar header with title */}
      <SidebarHeader className="p-4">
        <h3 className="text-lg font-semibold">Auction Filters</h3>
      </SidebarHeader>

      {/* Main sidebar content area */}
      <SidebarContent className="p-4">
        {/* Auction status filter section */}
        <SidebarGroup>
          <SidebarGroupLabel>Auction Status</SidebarGroupLabel>
          <SidebarGroupContent>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Visual separator between filter sections */}
        <SidebarSeparator className="my-4" />

        {/* Item category filter section */}
        <SidebarGroup>
          <SidebarGroupLabel>Item Category</SidebarGroupLabel>
          <SidebarGroupContent>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {/* Dynamically render category options */}
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Visual separator between filter sections */}
        <SidebarSeparator className="my-4" />

        {/* Price range filter section */}
        <SidebarGroup>
          <SidebarGroupLabel>Price Range (IDRX)</SidebarGroupLabel>
          <SidebarGroupContent className="grid grid-cols-2 gap-2">
            {/* Minimum price input */}
            <div>
              <Label htmlFor="min-price" className="sr-only">
                Min Price
              </Label>
              <Input
                id="min-price"
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
            </div>
            {/* Maximum price input */}
            <div>
              <Label htmlFor="max-price" className="sr-only">
                Max Price
              </Label>
              <Input
                id="max-price"
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer section with reset button */}
      <div className="p-4 border-t">
        <Button onClick={onResetFilters} className="w-full">
          Reset Filters
        </Button>
      </div>
    </Sidebar>
  );
}
