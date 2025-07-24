"use client";

import { TransactionTable } from "./transaction-table";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { mockTransactions } from "~~/lib/mock-profile";

export function TransactionHistoryTabs() {
  const filterTransactions = (type: "all" | (typeof mockTransactions)[0]["type"]) => {
    if (type === "all") {
      return mockTransactions;
    }
    return mockTransactions.filter(tx => tx.type === type);
  };

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-6 md:grid-cols-6 lg:grid-cols-6">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="bid">Bids</TabsTrigger>
        <TabsTrigger value="sale">Sales</TabsTrigger>
        <TabsTrigger value="win">Wins</TabsTrigger>
        <TabsTrigger value="deposit">Deposits</TabsTrigger>
        <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
      </TabsList>

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
