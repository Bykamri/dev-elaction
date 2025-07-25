"use client";

import { TransactionTable } from "./transaction-table";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { mockTransactions } from "~~/lib/mock-profile";

/**
 * TransactionHistoryTabs Component
 *
 * A comprehensive transaction history interface that organizes user financial activities into
 * categorized tabs for easy navigation and analysis. This component provides a unified view
 * of all transaction types including bids, sales, auction wins, deposits, and withdrawals,
 * allowing users to track their complete financial activity within the auction platform.
 *
 * Key Features:
 * - Tabbed interface with 6 distinct transaction categories
 * - Dynamic transaction filtering based on selected tab
 * - Responsive grid layout that adapts to different screen sizes
 * - Card-based design for consistent UI presentation
 * - Integration with TransactionTable component for data display
 * - Mock data integration for development and testing
 * - Clean separation of concerns between filtering logic and presentation
 *
 * Transaction Categories:
 * - All: Complete transaction history across all categories
 * - Bids: Auction bidding activities and bid history
 * - Sales: Successfully completed sales transactions
 * - Wins: Auctions won by the user
 * - Deposits: Account funding and deposit history
 * - Withdrawals: Account withdrawal and payout history
 *
 * UI Components Used:
 * - Tabs component for category navigation
 * - Card components for structured content layout
 * - TransactionTable for tabular data presentation
 * - Responsive grid system for optimal display across devices
 *
 * @component
 * @category Customer
 * @subcategory Profile
 */

/**
 * TransactionHistoryTabs Component Function
 *
 * Renders a comprehensive tabbed interface for viewing and filtering transaction history.
 * The component uses a tab-based navigation system to organize different types of financial
 * transactions, providing users with an intuitive way to analyze their activity patterns
 * and track their engagement within the auction platform.
 *
 * Component Architecture:
 * - Uses controlled tabs with default "all" selection
 * - Implements dynamic filtering based on transaction type
 * - Renders consistent card layouts for each tab content
 * - Integrates with TransactionTable for data presentation
 * - Provides responsive grid layout for optimal viewing
 *
 * @returns {JSX.Element} The rendered transaction history tabs interface
 */
export function TransactionHistoryTabs() {
  /**
   * Filters transactions based on the selected type or returns all transactions
   *
   * This utility function provides the core filtering logic for the tabbed interface.
   * It supports both showing all transactions and filtering by specific transaction types
   * such as bids, sales, wins, deposits, and withdrawals.
   *
   * @param {string} type - The transaction type to filter by, or "all" for unfiltered results
   * @returns {Array} Filtered array of transactions matching the specified type
   */
  const filterTransactions = (type: "all" | (typeof mockTransactions)[0]["type"]) => {
    // Return all transactions when "all" tab is selected
    if (type === "all") {
      return mockTransactions;
    }
    // Filter transactions by specific type for category-specific tabs
    return mockTransactions.filter(tx => tx.type === type);
  };

  return (
    // Main tabs container with full width and default "all" selection
    <Tabs defaultValue="all" className="w-full">
      {/* Tab navigation bar with responsive grid layout for 6 categories */}
      <TabsList className="grid w-full grid-cols-6 md:grid-cols-6 lg:grid-cols-6">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="bid">Bids</TabsTrigger>
        <TabsTrigger value="sale">Sales</TabsTrigger>
        <TabsTrigger value="win">Wins</TabsTrigger>
        <TabsTrigger value="deposit">Deposits</TabsTrigger>
        <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
      </TabsList>

      {/* All transactions tab content - shows complete transaction history */}
      <TabsContent value="all" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={filterTransactions("all")} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Bid history tab content - shows auction bidding activities */}
      <TabsContent value="bid" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Bid History</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={filterTransactions("bid")} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Sales history tab content - shows completed sales transactions */}
      <TabsContent value="sale" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={filterTransactions("sale")} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Won auctions tab content - shows auctions successfully won by user */}
      <TabsContent value="win" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Won Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={filterTransactions("win")} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Deposit history tab content - shows account funding transactions */}
      <TabsContent value="deposit" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Deposit History</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={filterTransactions("deposit")} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Withdrawal history tab content - shows account withdrawal transactions */}
      <TabsContent value="withdrawal" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={filterTransactions("withdrawal")} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
