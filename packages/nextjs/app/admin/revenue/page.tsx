"use client";

import Link from "next/link";
import { DollarSign, Gavel, TrendingUp } from "lucide-react";
import { ConnectWalletGuard } from "~~/components/auth/ConnectWalletGuard";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";
import { PLATFORM_FEE_PERCENTAGE, calculateRevenueMetrics, mockCompletedAuctions } from "~~/lib/mock-revenue";

export default function RevenueResultsPage() {
  // Get revenue metrics from mock data
  const { totalAuctionValue, totalPlatformFees, netRevenue, completedAuctionsCount } =
    calculateRevenueMetrics(mockCompletedAuctions);

  return (
    <ConnectWalletGuard pageName="Revenue Results">
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Revenue Results</h1>
          <p className="text-muted-foreground">Overview of platform earnings from completed auctions.</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Completed Auctions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Details of Completed Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            {mockCompletedAuctions.length > 0 ? (
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
                      const finalBidValue = parseFloat(auction.finalBid);
                      const auctionFee = finalBidValue * PLATFORM_FEE_PERCENTAGE;
                      return (
                        <TableRow key={auction.id}>
                          <TableCell className="font-medium">{auction.id}</TableCell>
                          <TableCell>
                            <Link href={`/auctions/${auction.id}`} className="text-primary hover:underline">
                              {auction.title}
                            </Link>
                          </TableCell>
                          <TableCell className="font-semibold text-blue-600">
                            {finalBidValue.toLocaleString()} {auction.currency}
                          </TableCell>
                          <TableCell className="text-blue-600">
                            {auctionFee.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}{" "}
                            IDRX
                          </TableCell>
                          <TableCell>{new Date(auction.endTime).toLocaleDateString()}</TableCell>
                          <TableCell className="font-mono text-sm">{auction.winner}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
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
