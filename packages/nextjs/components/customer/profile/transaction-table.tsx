"use client";

import { CheckCircle, Clock, DollarSign, Gavel, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "~~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";
import { mockTransactions } from "~~/lib/mock-profile";

/**
 * TransactionTable Component
 *
 * A comprehensive data table component that displays transaction history with rich visual indicators,
 * status badges, and detailed transaction information. This component provides a structured view of
 * financial activities including deposits, withdrawals, bids, sales, and auction wins with proper
 * categorization, status tracking, and blockchain transaction hash display.
 *
 * Key Features:
 * - Responsive table design with horizontal scroll support
 * - Color-coded transaction type icons for visual categorization
 * - Dynamic status badges with contextual styling
 * - Transaction hash display with truncation for readability
 * - Auction-specific information display when applicable
 * - Empty state handling with user-friendly messaging
 * - Currency and amount formatting with proper alignment
 * - Date formatting with localization support
 *
 * Transaction Types Supported:
 * - Deposits: Account funding transactions with upward trend icons
 * - Withdrawals: Account withdrawal transactions with downward trend icons
 * - Bids: Auction bidding activities with gavel icons
 * - Sales: Completed sales transactions with dollar sign icons
 * - Wins: Successfully won auctions with checkmark icons
 * - Generic: Fallback transactions with clock icons
 *
 * Status Types:
 * - Completed: Successfully processed transactions (green)
 * - Pending: Transactions awaiting confirmation (yellow)
 * - Failed: Unsuccessful transactions (red)
 * - Unknown: Fallback status for undefined states (gray)
 *
 * @component
 * @category Customer
 * @subcategory Profile
 */

/**
 * Props interface for the TransactionTable component
 *
 * @interface TransactionTableProps
 * @property {Array} transactions - Array of transaction objects to display in the table
 */
interface TransactionTableProps {
  /** Array of transaction data conforming to the mock transaction structure */
  transactions: typeof mockTransactions;
}

/**
 * TransactionTable Component Function
 *
 * Renders a comprehensive transaction history table with visual indicators, status badges, and
 * detailed transaction information. The component handles various transaction types and statuses
 * with appropriate styling and provides a responsive layout for optimal viewing across devices.
 *
 * @param {TransactionTableProps} props - Component props containing transaction data array
 * @returns {JSX.Element} The rendered transaction table or empty state message
 */
export function TransactionTable({ transactions }: TransactionTableProps) {
  /**
   * Generates appropriate status badge for transaction status
   *
   * Creates a colored badge component based on transaction status with contextual styling.
   * Uses semantic colors to communicate transaction state clearly to users.
   *
   * @param {string} status - The transaction status (completed, pending, failed)
   * @returns {JSX.Element} A styled Badge component with appropriate color and text
   */
  const getTransactionBadge = (status: (typeof mockTransactions)[0]["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  /**
   * Returns appropriate icon for transaction type
   *
   * Provides visual categorization of transactions using contextual icons with semantic colors.
   * Each transaction type has a distinct icon to improve visual recognition and user experience.
   *
   * @param {string} type - The transaction type (deposit, withdrawal, bid, sale, win)
   * @returns {JSX.Element} A Lucide React icon component with appropriate styling
   */
  const getTransactionIcon = (type: (typeof mockTransactions)[0]["type"]) => {
    switch (type) {
      case "deposit":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "withdrawal":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "bid":
        return <Gavel className="w-4 h-4 text-blue-500" />;
      case "sale":
        return <DollarSign className="w-4 h-4 text-purple-500" />;
      case "win":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Render empty state when no transactions are available
  if (transactions.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No transactions of this type found.</p>;
  }

  // Render complete transaction table when data is available
  return (
    // Responsive container with horizontal scroll for mobile devices
    <div className="overflow-x-auto">
      <Table>
        {/* Table header with column definitions */}
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>TX Hash</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table body with transaction data rows */}
        <TableBody>
          {transactions.map(tx => (
            <TableRow key={tx.id}>
              {/* Transaction type column with icon and capitalized type name */}
              <TableCell className="font-medium flex items-center gap-2">
                {getTransactionIcon(tx.type)}
                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
              </TableCell>

              {/* Transaction description column with auction details or generic description */}
              <TableCell>
                {tx.auctionTitle ? (
                  <div>
                    {/* Auction-specific transaction with title and ID */}
                    <div className="font-medium">{tx.auctionTitle}</div>
                    <div className="text-sm text-muted-foreground">Auction #{tx.auctionId}</div>
                  </div>
                ) : (
                  /* Generic transaction description for non-auction activities */
                  <span className="capitalize">{tx.type} transaction</span>
                )}
              </TableCell>

              {/* Transaction amount column with currency display */}
              <TableCell className="font-semibold">
                {tx.amount} {tx.currency}
              </TableCell>

              {/* Transaction date column with localized date formatting */}
              <TableCell>{tx.timestamp.toLocaleDateString()}</TableCell>

              {/* Transaction status column with color-coded badge */}
              <TableCell>{getTransactionBadge(tx.status)}</TableCell>

              {/* Blockchain transaction hash column with truncated display */}
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">{tx.txHash.substring(0, 10)}...</code>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
