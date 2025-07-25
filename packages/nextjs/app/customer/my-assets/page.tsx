"use client";

import { ConnectWalletGuard } from "~~/components/auth/ConnectWalletGuard";
import { AssetsDisplay } from "~~/components/customer/assets-display";

/**
 * @fileoverview My Assets Page Component
 *
 * This page displays a user's asset portfolio, including items they've won through auctions
 * and items they've put up for auction. The page is protected by wallet authentication
 * and provides a comprehensive view of the user's digital asset holdings.
 *
 * A protected page component that displays the user's asset portfolio.
 * This includes both assets won through auctions and assets currently being auctioned.
 * The page requires wallet connection for access and provides a user-friendly interface
 * for viewing and managing personal digital assets.
 *
 * @author Dev Team
 * @version 1.0.0
 * @component
 * @returns {JSX.Element} The rendered my assets page with wallet protection
 */

export default function MyAssetsPage() {
  // Return the protected page layout with wallet authentication
  return (
    // ConnectWalletGuard ensures user has connected wallet before accessing content
    <ConnectWalletGuard pageName="My Assets">
      {/* Main content container with responsive layout */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Page header section with title and description */}
        <div className="text-center mb-8">
          {/* Primary page heading */}
          <h1 className="text-3xl font-bold text-foreground">My Assets</h1>
          {/* Page description explaining functionality */}
          <p className="text-muted-foreground">View items you&apos;ve won and items you&apos;ve auctioned.</p>
        </div>
        {/* Assets display component - handles all asset listing logic */}
        <AssetsDisplay />
      </main>
    </ConnectWalletGuard>
  );
}
