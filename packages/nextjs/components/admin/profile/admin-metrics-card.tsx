"use client";

import { CheckCircle, DollarSign, Users, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";

/**
 * @fileoverview Admin Metrics Card Component
 *
 * This component displays key administrative metrics in a visually appealing card format.
 * It shows important platform statistics including auction approval/rejection counts,
 * total user numbers, and revenue processing information. The component uses color-coded
 * icons and layouts to make the metrics easily scannable and digestible for administrators.
 *
 * @author Dev Team
 * @version 1.0.0
 */

/**
 * Props interface for AdminMetricsCard component
 * @interface AdminMetricsCardProps
 */
interface AdminMetricsCardProps {
  /** Number of auctions that have been approved by administrators */
  approvedAuctionsCount: number;
  /** Number of auctions that have been rejected by administrators */
  rejectedAuctionsCount: number;
  /** Total number of registered users on the platform */
  totalUsersCount: number;
  /** Total revenue processed through the platform in IDRX tokens */
  totalRevenueProcessed: number;
}

/**
 * AdminMetricsCard Component
 *
 * A dashboard card component that displays key administrative metrics in a 2x2 grid layout.
 * Each metric is presented with a color-coded icon, descriptive label, and formatted value.
 * The component provides administrators with a quick overview of platform performance
 * and key operational statistics.
 *
 * Features:
 * - Color-coded metric icons for visual clarity
 * - Responsive 2-column grid layout
 * - Formatted number display with locale support
 * - IDRX token revenue display with proper formatting
 * - Consistent spacing and typography
 * - Card-based design matching admin dashboard aesthetics
 *
 * @component
 * @param {AdminMetricsCardProps} props - Component props containing metric values
 * @returns {JSX.Element} The rendered admin metrics card
 */
export function AdminMetricsCard({
  approvedAuctionsCount,
  rejectedAuctionsCount,
  totalUsersCount,
  totalRevenueProcessed,
}: AdminMetricsCardProps) {
  return (
    // Main card container spanning 2 columns on medium+ screens
    <Card className="md:col-span-2">
      {/* Card header with title */}
      <CardHeader>
        <CardTitle className="text-xl font-bold">Admin Metrics</CardTitle>
      </CardHeader>

      {/* Card content with 2x2 grid layout for metrics */}
      <CardContent className="grid grid-cols-2 gap-4">
        {/* Approved Auctions Metric */}
        <div className="flex items-center space-x-3">
          {/* Green icon container indicating positive/success metric */}
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            {/* Metric label */}
            <p className="text-sm text-muted-foreground">Auctions Approved</p>
            {/* Metric value with large, bold formatting */}
            <p className="text-2xl font-bold text-foreground">{approvedAuctionsCount}</p>
          </div>
        </div>

        {/* Rejected Auctions Metric */}
        <div className="flex items-center space-x-3">
          {/* Red icon container indicating negative/rejection metric */}
          <div className="p-2 bg-red-100 rounded-full">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            {/* Metric label */}
            <p className="text-sm text-muted-foreground">Auctions Rejected</p>
            {/* Metric value with large, bold formatting */}
            <p className="text-2xl font-bold text-foreground">{rejectedAuctionsCount}</p>
          </div>
        </div>

        {/* Total Users Metric */}
        <div className="flex items-center space-x-3">
          {/* Blue icon container for user-related metric */}
          <div className="p-2 bg-blue-100 rounded-full">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            {/* Metric label */}
            <p className="text-sm text-muted-foreground">Total Users</p>
            {/* Metric value with large, bold formatting */}
            <p className="text-2xl font-bold text-foreground">{totalUsersCount}</p>
          </div>
        </div>

        {/* Revenue Processed Metric */}
        <div className="flex items-center space-x-3">
          {/* Purple icon container for financial metric */}
          <div className="p-2 bg-purple-100 rounded-full">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            {/* Metric label */}
            <p className="text-sm text-muted-foreground">Revenue Processed</p>
            {/* Formatted revenue value with IDRX token suffix */}
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
