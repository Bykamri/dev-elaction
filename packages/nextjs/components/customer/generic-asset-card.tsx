"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { CategoryBadge } from "~~/utils/CategoryBadge";

/**
 * GenericAssetCard Component
 *
 * A versatile asset card component designed to display various types of auction items
 * with comprehensive information and status indicators. This component serves as a
 * general-purpose card for displaying assets across different categories and states,
 * providing a consistent visual interface for asset browsing and navigation.
 *
 * Key Features:
 * - Dynamic status badges with contextual styling
 * - Category-based visual indicators with icons
 * - Responsive image display with fallback support
 * - Conditional information display based on asset status
 * - Navigation integration with Next.js Link components
 * - Time remaining countdown for active auctions
 * - Price formatting with currency support
 * - Seller information display with user icons
 *
 * Status Types Supported:
 * - Active/Live: Currently running auctions with bidding enabled
 * - Sold: Successfully completed transactions
 * - Finished: Ended auctions without sales
 * - Default: Fallback for undefined statuses
 *
 * Visual Elements:
 * - Status badges with semantic color coding
 * - Category badges with icon integration
 * - Responsive card layout with hover effects
 * - Price display with emphasis styling
 * - Action buttons with conditional text and states
 *
 * @component
 * @category Customer
 * @subcategory Assets
 */

/**
 * Type definition for GenericAssetCard component props
 *
 * Defines the structure of asset data required for display, including
 * essential information like title, pricing, status, and optional metadata.
 */
type GenericAssetCardProps = {
  /** Asset data object containing all display information */
  asset: {
    /** Unique identifier for the asset */
    id: string;
    /** Display title of the asset */
    title: string;
    /** Detailed description of the asset */
    description: string;
    /** URL for the asset's primary image */
    imageUrl: string;
    /** Category classification of the asset */
    category: string;
    /** Current or final price with currency symbol */
    currentPrice: string;
    /** Current status of the asset (active, sold, finished, etc.) */
    status: string;
    /** Optional seller information */
    seller?: string;
    /** Optional time remaining for active auctions */
    timeLeft?: string;
    /** Optional custom navigation URL */
    linkUrl?: string;
  };
};

/**
 * GenericAssetCard - Reusable Asset Display Component
 *
 * Renders a comprehensive asset card with status indicators, category badges,
 * pricing information, and navigation capabilities. Adapts its display based
 * on the asset's current state and provides appropriate actions for each status.
 *
 * @param {GenericAssetCardProps} props - Component props containing asset data
 * @returns {JSX.Element} Rendered asset card component
 */
export const GenericAssetCard = ({ asset }: GenericAssetCardProps) => {
  // Generate default navigation URL if not provided
  const linkToDetails = asset.linkUrl || `/assets/${asset.id}`;

  // Determine if asset is in a finished state (sold or ended)
  const isFinished = asset.status === "sold" || asset.status === "finished";

  /**
   * Generates appropriate status badge based on asset status
   *
   * Provides visual indicators for different asset states:
   * - Live/Active: Blue badge for ongoing auctions
   * - Sold: Green badge for successful sales
   * - Finished: Gray badge for ended auctions
   *
   * @returns {JSX.Element | null} Status badge component or null if no status
   */
  const getStatusBadge = () => {
    // Active auction badge
    if (asset.status === "active" || asset.status === "live") {
      return <Badge className="absolute top-3 left-3 bg-blue-100 text-blue-800 border-blue-300">Live</Badge>;
    }

    // Sold asset badge
    if (asset.status === "sold") {
      return <Badge className="absolute top-3 left-3 bg-green-100 text-green-800 border-green-300">Sold</Badge>;
    }

    // Finished auction badge
    if (asset.status === "finished") {
      return (
        <Badge variant="secondary" className="absolute top-3 left-3">
          Finished
        </Badge>
      );
    }

    // No badge for unknown statuses
    return null;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {/* Main card container with hover effects and flexible layout */}
      <Link href={linkToDetails} passHref>
        {/* Image container with overlaid badges */}
        <div className="relative">
          <Image src={asset.imageUrl} alt={asset.title} width={400} height={300} className="w-full h-48 object-cover" />
          {getStatusBadge()}
          {/* Category badge positioned in top-right corner */}
          <div className="absolute top-3 right-3">
            <CategoryBadge category={asset.category} />
          </div>
        </div>
      </Link>

      {/* Asset information header */}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground truncate" title={asset.title}>
          {asset.title}
        </CardTitle>
        {/* Seller information with user icon */}
        {asset.seller && (
          <CardDescription className="text-sm flex items-center" title={asset.seller}>
            <User className="w-4 h-4 mr-1.5" />
            <span>By: {asset.seller}</span>
          </CardDescription>
        )}
      </CardHeader>

      {/* Main content area with pricing and time information */}
      <CardContent className="pt-0 flex-grow">
        <div className="flex justify-between items-center">
          {/* Price section with context-appropriate labeling */}
          <div>
            <p className="text-sm text-muted-foreground">{isFinished ? "Final Price" : "Current Price"}</p>
            <p className="text-2xl font-bold text-blue-600">{asset.currentPrice}</p>
          </div>

          {/* Time remaining section for active auctions */}
          <div className="text-right">
            {!isFinished && asset.timeLeft && (
              <>
                <p className="text-sm text-muted-foreground">Time Left</p>
                <p className="text-lg font-semibold flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {asset.timeLeft}
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>

      {/* Action button with conditional text and navigation */}
      <div className="p-4 pt-0 mt-auto">
        <Button asChild className="w-full" disabled={isFinished}>
          <Link href={linkToDetails}>
            {isFinished ? "View Details" : "View Asset"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};
