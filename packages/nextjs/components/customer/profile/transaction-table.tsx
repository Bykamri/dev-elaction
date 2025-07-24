"use client";

import { CheckCircle, Clock, DollarSign, Gavel, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "~~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";
import { mockTransactions } from "~~/lib/mock-profile";

interface TransactionTableProps {
  transactions: typeof mockTransactions;
}

export function TransactionTable({ transactions }: TransactionTableProps) {
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

  if (transactions.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No transactions of this type found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
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
        <TableBody>
          {transactions.map(tx => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium flex items-center gap-2">
                {getTransactionIcon(tx.type)}
                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
              </TableCell>
              <TableCell>
                {tx.auctionTitle ? (
                  <div>
                    <div className="font-medium">{tx.auctionTitle}</div>
                    <div className="text-sm text-muted-foreground">Auction #{tx.auctionId}</div>
                  </div>
                ) : (
                  <span className="capitalize">{tx.type} transaction</span>
                )}
              </TableCell>
              <TableCell className="font-semibold">
                {tx.amount} {tx.currency}
              </TableCell>
              <TableCell>{tx.timestamp.toLocaleDateString()}</TableCell>
              <TableCell>{getTransactionBadge(tx.status)}</TableCell>
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
