"use client";

import { ConnectWalletGuard } from "~~/components/auth/ConnectWalletGuard";
import { AssetsDisplay } from "~~/components/customer/assets-display-final";

// Import the new component

export default function MyAssetsPage() {
  return (
    <ConnectWalletGuard pageName="My Assets">
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Assets</h1>
          <p className="text-muted-foreground">View items you&apos;ve won and items you&apos;ve auctioned.</p>
        </div>
        <AssetsDisplay />
      </main>
    </ConnectWalletGuard>
  );
}
