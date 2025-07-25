"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Badge } from "~~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";

/**
 * @fileoverview Recent Admin Activity Component
 *
 * This component displays a table of recent administrative activities and auction management
 * actions. It shows completed auctions with their details including ID, title, status,
 * administrative actions taken, and completion dates. The component handles empty states
 * gracefully and provides clickable links for detailed auction views.
 *
 * @author Dev Team
 * @version 1.0.0
 */

/**
 * Props interface for RecentAdminActivity component
 * @interface RecentAdminActivityProps
 */
interface RecentAdminActivityProps {
  /** Array of recent administrative actions/completed auctions to display */
  recentActions: any[];
}

/**
 * RecentAdminActivity Component
 *
 * Displays a comprehensive table of recent administrative activities and auction completions.
 * The component provides administrators with a quick overview of recent platform activities,
 * including auction statuses, completion dates, and direct links to auction details.
 *
 * Features:
 * - Responsive table layout with horizontal scrolling
 * - Empty state handling with informative messages
 * - Clickable auction titles linking to detailed views
 * - Status badges for visual clarity
 * - Formatted date display for completion times
 * - Consistent card-based design
 * - Administrative action indicators with icons
 *
 * @component
 * @param {RecentAdminActivityProps} props - Component props containing recent actions data
 * @returns {JSX.Element} The rendered recent admin activity table
 */
export function RecentAdminActivity({ recentActions }: RecentAdminActivityProps) {
  // Handle empty state when no recent actions are available
  if (recentActions.length === 0) {
    return (
      <Card className="mt-8">
        {/* Header for empty state */}
        <CardHeader>
          <CardTitle className="text-xl font-bold">Recent Admin Activity</CardTitle>
        </CardHeader>
        {/* Empty state content with informative message */}
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No recent admin activity to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    // Main card container with top margin
    <Card className="mt-8">
      {/* Card header with title */}
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recent Admin Activity</CardTitle>
      </CardHeader>

      {/* Card content containing the activity table */}
      <CardContent>
        {/* Horizontal scrolling container for table responsiveness */}
        <div className="overflow-x-auto">
          <Table>
            {/* Table header with column definitions */}
            <TableHeader>
              <TableRow>
                {/* Auction identifier column */}
                <TableHead>Auction ID</TableHead>
                {/* Auction title column - clickable link */}
                <TableHead>Title</TableHead>
                {/* Current status of the auction */}
                <TableHead>Status</TableHead>
                {/* Administrative action taken */}
                <TableHead>Action</TableHead>
                {/* Date of completion or action */}
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            {/* Table body with dynamic content from recentActions */}
            <TableBody>
              {recentActions.map(auction => (
                <TableRow key={auction.id}>
                  {/* Auction ID cell with medium font weight */}
                  <TableCell className="font-medium">{auction.id}</TableCell>

                  {/* Auction title cell with navigation link */}
                  <TableCell>
                    <Link href={`/auctions/${auction.id}`} className="text-primary hover:underline">
                      {auction.title}
                    </Link>
                  </TableCell>

                  {/* Status badge indicating auction completion */}
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
                  </TableCell>

                  {/* Action taken cell with icon and description */}
                  <TableCell>
                    <span className="flex items-center text-blue-600">
                      <CheckCircle className="w-4 h-4 mr-1" /> Auction Completed
                    </span>
                  </TableCell>

                  {/* Formatted completion date */}
                  <TableCell>{new Date(auction.endTime).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
