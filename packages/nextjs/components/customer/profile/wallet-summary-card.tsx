"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { useWalletBalance } from "~~/hooks/useWalletBalance";
import { mockProfileData } from "~~/lib/mock-profile";

interface WalletSummaryCardProps {
  onRefresh?: () => void;
}

export function WalletSummaryCard({ onRefresh }: WalletSummaryCardProps) {
  const { ethBalance, idrxBalance, isLoading, refreshBalances } = useWalletBalance();

  const handleRefresh = () => {
    refreshBalances();
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Current Wallet Balance</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ETH</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ethereum (ETH)</p>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? "Loading..." : `${parseFloat(ethBalance).toFixed(4)} ETH`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">IDRX</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IDRX Token</p>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? "Loading..." : `${parseFloat(idrxBalance).toFixed(2)} IDRX`}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <h3 className="text-lg font-semibold">Auction Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Auctions Won</p>
              <p className="text-2xl font-bold text-green-600">{mockProfileData.auctionsWon}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Auctions Created</p>
              <p className="text-2xl font-bold text-blue-600">{mockProfileData.auctionsCreated}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-lg font-semibold text-red-600">{mockProfileData.totalSpent} ETH</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-lg font-semibold text-green-600">{mockProfileData.totalEarned} ETH</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
