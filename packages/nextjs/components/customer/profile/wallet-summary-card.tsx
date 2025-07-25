"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { useWalletBalance } from "~~/hooks/useWalletBalance";
import { mockProfileData } from "~~/lib/mock-profile";

/**
 * WalletSummaryCard Component
 *
 * A comprehensive wallet overview component that displays real-time cryptocurrency balances,
 * auction statistics, and financial metrics for user profile pages. This component integrates
 * with blockchain wallet hooks to provide live balance updates and combines them with historical
 * auction data to give users a complete financial overview of their platform activity.
 *
 * Key Features:
 * - Real-time ETH and IDRX token balance display
 * - Live balance refresh functionality with loading states
 * - Responsive card design spanning multiple grid columns
 * - Visual currency indicators with gradient backgrounds
 * - Comprehensive auction statistics tracking
 * - Color-coded metrics for quick financial assessment
 * - Integration with custom wallet balance hooks
 * - Mock data integration for development and testing
 *
 * Financial Metrics Displayed:
 * - Ethereum (ETH) balance with 4 decimal precision
 * - IDRX token balance with 2 decimal precision
 * - Total auctions won by the user
 * - Total auctions created by the user
 * - Total amount spent on auctions (ETH)
 * - Total earnings from auctions (ETH)
 *
 * Visual Design Elements:
 * - Gradient currency logos for ETH and IDRX
 * - Color-coded statistics (green for positive, red for negative, blue for neutral)
 * - Loading animations and states for better UX
 * - Responsive grid layout for statistics display
 * - Proper typography hierarchy and spacing
 *
 * @component
 * @category Customer
 * @subcategory Profile
 */

/**
 * Props interface for the WalletSummaryCard component
 *
 * @interface WalletSummaryCardProps
 * @property {() => void} [onRefresh] - Optional callback function triggered when user refreshes wallet data
 */
interface WalletSummaryCardProps {
  /** Optional callback function to handle additional refresh actions beyond balance updates */
  onRefresh?: () => void;
}

/**
 * WalletSummaryCard Component Function
 *
 * Renders a comprehensive wallet overview card displaying real-time cryptocurrency balances
 * and auction statistics. The component integrates with blockchain wallet hooks to provide
 * live balance updates and combines them with historical platform data for a complete
 * financial overview.
 *
 * Component Architecture:
 * - Uses custom useWalletBalance hook for real-time balance data
 * - Implements refresh functionality with loading states
 * - Combines live blockchain data with mock historical statistics
 * - Provides responsive grid layout for optimal display
 * - Includes visual loading indicators and animations
 *
 * @param {WalletSummaryCardProps} props - Component props containing optional refresh callback
 * @returns {JSX.Element} The rendered wallet summary card with balances and statistics
 */
export function WalletSummaryCard({ onRefresh }: WalletSummaryCardProps) {
  // Extract wallet balance data and loading states from custom hook
  const { ethBalance, idrxBalance, isLoading, refreshBalances } = useWalletBalance();

  /**
   * Handles the refresh action for wallet balances and external data
   *
   * Triggers both the internal balance refresh and any external refresh callback
   * provided through props. This ensures all related data is updated simultaneously.
   */
  const handleRefresh = () => {
    // Refresh cryptocurrency balances from blockchain
    refreshBalances();
    // Execute external refresh callback if provided
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    // Main card container with responsive grid column spanning
    <Card className="md:col-span-2">
      {/* Card header with title and refresh button */}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Current Wallet Balance</CardTitle>
        {/* Refresh button with loading animation */}
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      {/* Card content area with balance and statistics */}
      <CardContent className="space-y-4">
        {/* Ethereum (ETH) balance section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* ETH currency logo with gradient background */}
            <div className="w-8 h-8 mr-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ETH</span>
            </div>
            <div>
              {/* Currency label and balance display */}
              <p className="text-sm text-muted-foreground">Ethereum (ETH)</p>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? "Loading..." : `${parseFloat(ethBalance).toFixed(4)} ETH`}
              </p>
            </div>
          </div>
        </div>

        {/* IDRX token balance section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* IDRX currency logo with gradient background */}
            <div className="w-8 h-8 mr-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">IDRX</span>
            </div>
            <div>
              {/* Currency label and balance display */}
              <p className="text-sm text-muted-foreground">IDRX Token</p>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? "Loading..." : `${parseFloat(idrxBalance).toFixed(2)} IDRX`}
              </p>
            </div>
          </div>
        </div>

        {/* Auction statistics section with border separator */}
        <div className="border-t pt-4 space-y-2">
          <h3 className="text-lg font-semibold">Auction Statistics</h3>

          {/* Statistics grid with 2x2 layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Auctions won metric (positive indicator - green) */}
            <div>
              <p className="text-sm text-muted-foreground">Auctions Won</p>
              <p className="text-2xl font-bold text-green-600">{mockProfileData.auctionsWon}</p>
            </div>

            {/* Auctions created metric (neutral indicator - blue) */}
            <div>
              <p className="text-sm text-muted-foreground">Auctions Created</p>
              <p className="text-2xl font-bold text-blue-600">{mockProfileData.auctionsCreated}</p>
            </div>

            {/* Total spent metric (expense indicator - red) */}
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-lg font-semibold text-red-600">{mockProfileData.totalSpent} ETH</p>
            </div>

            {/* Total earned metric (income indicator - green) */}
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
