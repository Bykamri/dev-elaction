"use client";

import { Loader2 } from "lucide-react";
import { ConnectWalletGuard } from "~~/components/auth/ConnectWalletGuard";
import { ProfileInfoCard } from "~~/components/customer/profile/profile-info-card";
import { TransactionHistoryTabs } from "~~/components/customer/profile/transaction-history-tabs";
import { WalletSummaryCard } from "~~/components/customer/profile/wallet-summary-card";
import { useWalletBalance } from "~~/hooks/useWalletBalance";

/**
 * @fileoverview User Profile Page Component
 *
 * This page displays the user's profile information, wallet summary, and transaction history.
 * It includes wallet balance management, profile details, and comprehensive transaction tracking.
 * The page is protected by wallet authentication and provides a complete user dashboard experience.
 *
 * A comprehensive user profile page that displays wallet information, personal details,
 * and transaction history. The component handles loading states, error conditions,
 * and provides refresh functionality for wallet data.
 *
 * Features:
 * - Wallet balance display and management
 * - Profile information card
 * - Transaction history with filtering
 * - Error handling with retry functionality
 * - Loading states with spinner animation
 *
 * @author Dev Team
 * @version 1.0.0
 * @component
 * @returns {JSX.Element} The rendered user profile page with wallet protection
 */

export default function UserProfilePage() {
  // Extract wallet balance state and refresh function from custom hook
  const { isLoading, error, refreshBalances } = useWalletBalance();

  return (
    // ConnectWalletGuard ensures user has connected wallet before accessing profile
    <ConnectWalletGuard pageName="Profile">
      {/* Conditional rendering based on loading state */}
      {isLoading ? (
        // Loading state: Display spinner and loading message
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            {/* Animated loading spinner */}
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      ) : error ? (
        // Error state: Display error message with retry option
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
          <div className="text-center">
            {/* Error message display */}
            <p className="text-red-500 mb-4">{error}</p>
            {/* Retry button to refresh wallet balances */}
            <button
              onClick={refreshBalances}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </main>
      ) : (
        // Success state: Display full profile content
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          {/* Page header section */}
          <div className="text-center mb-8">
            {/* Main page title */}
            <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
            {/* Page description */}
            <p className="text-muted-foreground">Manage your profile and view your activity.</p>
          </div>

          {/* Profile information grid layout */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* User profile information card with refresh capability */}
            <ProfileInfoCard onRefresh={refreshBalances} />
            {/* Wallet summary card showing balance and tokens */}
            <WalletSummaryCard onRefresh={refreshBalances} />
          </div>

          {/* Transaction history section with tabs for different transaction types */}
          <TransactionHistoryTabs />
        </main>
      )}
    </ConnectWalletGuard>
  );
}
