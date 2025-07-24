"use client";

import { CheckCircle, DollarSign, Users, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";

interface AdminMetricsCardProps {
  approvedAuctionsCount: number;
  rejectedAuctionsCount: number;
  totalUsersCount: number;
  totalRevenueProcessed: number;
}

export function AdminMetricsCard({
  approvedAuctionsCount,
  rejectedAuctionsCount,
  totalUsersCount,
  totalRevenueProcessed,
}: AdminMetricsCardProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Admin Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Auctions Approved</p>
            <p className="text-2xl font-bold text-foreground">{approvedAuctionsCount}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-full">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Auctions Rejected</p>
            <p className="text-2xl font-bold text-foreground">{rejectedAuctionsCount}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-foreground">{totalUsersCount}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-full">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Revenue Processed</p>
            <p className="text-2xl font-bold text-foreground">
              {totalRevenueProcessed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" "}
              IDRX
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
