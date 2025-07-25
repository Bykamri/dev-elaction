"use client";

import Link from "next/link";
import { DollarSign, Gavel, TrendingUp } from "lucide-react";
import { ConnectWalletGuard } from "~~/components/auth/ConnectWalletGuard";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";
import { PLATFORM_FEE_PERCENTAGE, calculateRevenueMetrics, mockCompletedAuctions } from "~~/lib/mock-revenue";

/**
 * @title Revenue Results Dashboard Page
 * @dev Administrative interface for viewing platform revenue analytics
 * @notice This component provides:
 *   - Revenue overview with key metrics cards
 *   - Platform fee calculations and earnings breakdown
 *   - Detailed table of completed auctions with financial data
 *   - Real-time revenue calculations from auction data
 * @notice Displays financial insights for platform administrators
 */
export default function RevenueResultsPage() {
  // ============ Revenue Calculations ============

  /**
   * @dev Calculate revenue metrics from completed auctions
   * @notice Processes mock auction data to generate:
   *   - totalAuctionValue: Sum of all winning bids
   *   - totalPlatformFees: Platform commission earnings
   *   - netRevenue: Total auction value minus platform fees
   *   - completedAuctionsCount: Number of successfully closed auctions
   */
  const { totalAuctionValue, totalPlatformFees, netRevenue, completedAuctionsCount } =
    calculateRevenueMetrics(mockCompletedAuctions);

  // ============ Main Component Render ============

  return (
    <ConnectWalletGuard pageName="Revenue Results">
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Page header with title and description */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Revenue Results</h1>
          <p className="text-muted-foreground">Overview of platform earnings from completed auctions.</p>
        </div>

        {/* Revenue metrics dashboard - responsive card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Auction Value Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Auction Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalAuctionValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" "}
                IDRX
              </div>
              <p className="text-xs text-muted-foreground">Sum of all final bids</p>
            </CardContent>
          </Card>

          {/* Platform Fees Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Fees ({PLATFORM_FEE_PERCENTAGE * 100}%)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalPlatformFees.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" "}
                IDRX
              </div>
              <p className="text-xs text-muted-foreground">Our earnings from auctions</p>
            </CardContent>
          </Card>

          {/* Net Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {netRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} IDRX
              </div>
              <p className="text-xs text-muted-foreground">Total value minus fees</p>
            </CardContent>
          </Card>

          {/* Completed Auctions Count Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Auctions</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAuctionsCount}</div>
              <p className="text-xs text-muted-foreground">Auctions successfully closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed auction results table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Details of Completed Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            {mockCompletedAuctions.length > 0 ? (
              /* Responsive table container for auction details */
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Auction ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Final Bid</TableHead>
                      <TableHead>Platform Fee</TableHead>
                      <TableHead>Date Closed</TableHead>
                      <TableHead>Winner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCompletedAuctions.map(auction => {
                      // Calculate platform fee for this specific auction
                      const finalBidValue = parseFloat(auction.finalBid);
                      const auctionFee = finalBidValue * PLATFORM_FEE_PERCENTAGE;

                      return (
                        <TableRow key={auction.id}>
                          {/* Auction identifier */}
                          <TableCell className="font-medium">{auction.id}</TableCell>

                          {/* Clickable auction title linking to auction detail page */}
                          <TableCell>
                            <Link href={`/auctions/${auction.id}`} className="text-primary hover:underline">
                              {auction.title}
                            </Link>
                          </TableCell>

                          {/* Final winning bid amount */}
                          <TableCell className="font-semibold text-blue-600">
                            {finalBidValue.toLocaleString()} {auction.currency}
                          </TableCell>

                          {/* Platform commission earned from this auction */}
                          <TableCell className="text-blue-600">
                            {auctionFee.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}{" "}
                            IDRX
                          </TableCell>

                          {/* Auction end date formatted for display */}
                          <TableCell>{new Date(auction.endTime).toLocaleDateString()}</TableCell>

                          {/* Winner's wallet address */}
                          <TableCell className="font-mono text-sm">{auction.winner}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Empty state when no completed auctions exist */
              <p className="text-muted-foreground text-center py-4">
                No completed auctions to display revenue for yet.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </ConnectWalletGuard>
  );
}
