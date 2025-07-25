"use client";

import Image from "next/image";
import { Calendar, Trophy, XCircle } from "lucide-react";
import { Badge } from "~~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { RejectedProposal, WonAuction } from "~~/hooks/useAssetsData";

/**
 * Asset Cards Component
 *
 * A collection of specialized card components for displaying different types of auction assets
 * and proposals within the customer dashboard. This module provides two distinct card types:
 * won auction cards for successful bids and rejected proposal cards for declined submissions.
 * Each card type is optimized for its specific use case with appropriate visual styling,
 * status indicators, and contextual information display.
 *
 * Key Features:
 * - Responsive card design with hover effects and smooth transitions
 * - Status-specific styling and color coding for visual differentiation
 * - Image display with overlay badges for quick status identification
 * - Comprehensive information layout including prices, categories, and dates
 * - Error handling with placeholder images for missing assets
 * - Accessibility features with proper semantic structure
 * - Conditional content display based on data availability
 *
 * Card Types:
 * - WonAuctionCard: Displays successfully won auctions with final prices and win dates
 * - RejectedProposalCard: Shows rejected proposals with rejection reasons and submission dates
 *
 * Visual Design Elements:
 * - Card overlays with status badges (trophy for wins, X for rejections)
 * - Color-coded borders and backgrounds based on card type
 * - Professional typography with text truncation for long content
 * - Responsive image sizing with object-fit cover for consistent layout
 * - Contextual styling for different information types
 *
 * @component
 * @category Customer
 * @subcategory Assets
 */

/**
 * Props interface for the WonAuctionCard component
 *
 * @interface WonAuctionCardProps
 * @property {WonAuction} auction - The won auction data object containing all display information
 */
interface WonAuctionCardProps {
  /** Won auction data containing title, description, final price, category, and timing information */
  auction: WonAuction;
}

/**
 * WonAuctionCard Component
 *
 * Displays a won auction item in an attractive card format with success indicators and
 * comprehensive auction details. This component is specifically designed to showcase
 * auctions that the user has successfully won, featuring a trophy badge and celebratory
 * visual styling to highlight the achievement.
 *
 * Visual Features:
 * - Trophy badge overlay indicating successful auction win
 * - High-quality image display with hover effects
 * - Blue color scheme emphasizing success and achievement
 * - Professional card layout with proper spacing and typography
 * - Final price display highlighting the winning bid amount
 *
 * @param {WonAuctionCardProps} props - Component props containing the won auction data
 * @returns {JSX.Element} The rendered won auction card with success indicators
 */
export function WonAuctionCard({ auction }: WonAuctionCardProps) {
  return (
    // Main card container with hover effects and smooth transitions
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image section with overlay badge */}
      <div className="relative">
        {/* Auction item image with Next.js optimization */}
        <Image
          src={auction.imageUrl || "/placeholder.svg"}
          alt={auction.title}
          width={400}
          height={192}
          className="w-full h-48 object-cover"
        />
        {/* Success badge with trophy icon positioned in top-right corner */}
        <Badge className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700">
          <Trophy className="w-3 h-3 mr-1" />
          Won
        </Badge>
      </div>

      {/* Card header with title and description */}
      <CardHeader>
        {/* Auction title with text truncation for long titles */}
        <CardTitle className="text-lg line-clamp-1">{auction.title}</CardTitle>
        {/* Auction description with multi-line truncation */}
        <CardDescription className="line-clamp-2">{auction.description}</CardDescription>
      </CardHeader>

      {/* Card content with detailed auction information */}
      <CardContent>
        <div className="space-y-2">
          {/* Final price section highlighting the winning bid amount */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Final Price:</span>
            <span className="font-bold text-blue-600">
              {auction.finalPrice} {auction.currency}
            </span>
          </div>

          {/* Category information with badge styling */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Badge variant="outline">{auction.category}</Badge>
          </div>

          {/* Win date information with calendar icon */}
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Calendar className="w-4 h-4 mr-1" />
            Won on {auction.endTime.toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Props interface for the RejectedProposalCard component
 *
 * @interface RejectedProposalCardProps
 * @property {RejectedProposal} proposal - The rejected proposal data object containing all display information
 */
interface RejectedProposalCardProps {
  /** Rejected proposal data containing title, description, starting price, category, rejection reason, and submission date */
  proposal: RejectedProposal;
}

/**
 * RejectedProposalCard Component
 *
 * Displays a rejected auction proposal in a card format with clear rejection indicators
 * and detailed feedback information. This component is specifically designed to show
 * proposals that have been declined during the review process, featuring rejection
 * reasoning and visual cues to help users understand the outcome.
 *
 * Visual Features:
 * - Red color scheme indicating rejection status
 * - X-circle badge overlay clearly marking the rejection
 * - Dimmed image opacity to visually indicate inactive status
 * - Red border styling to emphasize the rejection state
 * - Rejection reason display in a highlighted alert box
 * - Starting price display showing the original proposal amount
 *
 * User Experience:
 * - Clear visual distinction from successful items
 * - Detailed rejection reasoning for user learning
 * - Submission date tracking for reference
 * - Professional styling that maintains dignity despite rejection
 *
 * @param {RejectedProposalCardProps} props - Component props containing the rejected proposal data
 * @returns {JSX.Element} The rendered rejected proposal card with rejection indicators and feedback
 */
export function RejectedProposalCard({ proposal }: RejectedProposalCardProps) {
  return (
    // Main card container with rejection-specific styling and red border
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-red-200">
      {/* Image section with dimmed opacity and rejection badge */}
      <div className="relative">
        {/* Proposal image with reduced opacity to indicate inactive status */}
        <Image
          src={proposal.imageUrl || "/placeholder.svg"}
          alt={proposal.title}
          width={400}
          height={192}
          className="w-full h-48 object-cover opacity-75"
        />
        {/* Rejection badge with X icon positioned in top-right corner */}
        <Badge className="absolute top-2 right-2 bg-red-600 hover:bg-red-700">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      </div>

      {/* Card header with title and description */}
      <CardHeader>
        {/* Proposal title with text truncation for long titles */}
        <CardTitle className="text-lg line-clamp-1">{proposal.title}</CardTitle>
        {/* Proposal description with multi-line truncation */}
        <CardDescription className="line-clamp-2">{proposal.description}</CardDescription>
      </CardHeader>

      {/* Card content with detailed proposal information */}
      <CardContent>
        <div className="space-y-2">
          {/* Starting price section showing the original proposal amount */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Starting Price:</span>
            <span className="font-bold text-blue-600">
              {proposal.startingPrice} {proposal.currency}
            </span>
          </div>

          {/* Category information with badge styling */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Badge variant="outline">{proposal.category}</Badge>
          </div>

          {/* Conditional rejection reason display with highlighted alert styling */}
          {proposal.rejectionReason && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">
                <strong>Reason:</strong> {proposal.rejectionReason}
              </p>
            </div>
          )}

          {/* Submission date information with calendar icon */}
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Calendar className="w-4 h-4 mr-1" />
            Submitted on {proposal.submittedAt.toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
