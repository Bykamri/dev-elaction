"use client";

import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/ui/select";

/**
 * @fileoverview Desktop Filters Component
 *
 * This component provides a desktop-specific sidebar with filtering options for auctions.
 * It includes filters for auction status (all/open/closed), item categories, and price ranges.
 * The component is designed specifically for desktop layouts with sticky positioning and
 * full-height scrollable content. It offers a comprehensive filtering interface that allows
 * users to refine auction listings by multiple criteria with an intuitive card-based design.
 *
 * @author Dev Team
 * @version 1.0.0
 */

/**
 * Props interface for DesktopFilters component
 * @interface DesktopFiltersProps
 */
type DesktopFiltersProps = {
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
 * DesktopFilters Component
 *
 * Renders a desktop-specific sticky sidebar with comprehensive filtering options for auctions.
 * The component provides an intuitive card-based interface for users to filter auctions by
 * multiple criteria including status, category, and price range. It features a full-height
 * sticky layout that remains visible during scrolling for optimal user experience on desktop devices.
 *
 * Features:
 * - Desktop-only display (hidden on mobile/tablet)
 * - Sticky positioning that follows page scroll
 * - Full-height layout with scrollable content
 * - Auction status filtering (all, open, closed)
 * - Dynamic category filtering based on available categories
 * - Price range filtering with min/max inputs
 * - One-click filter reset functionality
 * - Card-based design with proper spacing
 * - Accessible form controls with labels
 *
 * @component
 * @param {DesktopFiltersProps} props - Component props containing filter states and callbacks
 * @returns {JSX.Element} The rendered desktop filters sidebar
 */
export function DesktopFilters({
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
}: DesktopFiltersProps) {
  return (
    // Main container - hidden on mobile, sticky positioned for desktop
    <div className="hidden md:flex flex-col sticky top-16 w-[280px] h-[calc(100vh-5.5rem)] overflow-y-auto z-10">
      {/* Filter card with full height layout */}
      <Card className="h-full flex flex-col">
        {/* Card header with title */}
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Auction Filters</CardTitle>
        </CardHeader>

        {/* Main content area with filter sections */}
        <CardContent className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Auction status filter section */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="status-filter">Auction Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Item category filter section */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="category-filter">Item Category</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger id="category-filter" className="w-full">
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
          </div>

          {/* Price range filter section */}
          <div className="flex flex-col gap-2">
            <Label>Price Range (IDRX)</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              <Input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
          </div>
        </CardContent>

        {/* Footer with reset button */}
        <CardFooter className="mt-auto">
          <Button onClick={onResetFilters} variant="outline" className="w-full bg-transparent">
            Reset Filters
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
