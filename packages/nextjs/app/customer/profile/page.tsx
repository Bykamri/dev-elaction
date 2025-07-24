"use client";

import { Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { ProfileInfoCard } from "~~/components/customer/profile/profile-info-card";
import { TransactionHistoryTabs } from "~~/components/customer/profile/transaction-history-tabs";
import { WalletSummaryCard } from "~~/components/customer/profile/wallet-summary-card";
import { useWalletBalance } from "~~/hooks/useWalletBalance";

export default function UserProfilePage() {
  const { isConnected } = useAccount();
  const { isLoading, error, refreshBalances } = useWalletBalance();

  if (!isConnected) {
    return (
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
        <p className="text-muted-foreground text-center">Please connect your wallet to view profile.</p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refreshBalances}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
        <p className="text-muted-foreground">Manage your profile and view your activity.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <ProfileInfoCard onRefresh={refreshBalances} />
        <WalletSummaryCard onRefresh={refreshBalances} />
      </div>

      <TransactionHistoryTabs />
    </main>
  );
}
