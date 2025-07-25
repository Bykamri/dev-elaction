"use client";

import { Activity, Calendar, Wallet } from "lucide-react";
import { Badge } from "~~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";
import type { Reviewer } from "~~/lib/mock-reviewers";

/**
 * @fileoverview Reviewer List Component
 *
 * This component displays a comprehensive table of platform reviewers with their details
 * including wallet addresses, expertise areas, status, join dates, and review completion
 * statistics. It provides administrators with an overview of the reviewer community
 * and their activity levels. The component handles empty states gracefully and includes
 * responsive design for various screen sizes.
 *
 * @author Dev Team
 * @version 1.0.0
 */

/**
 * Props interface for ReviewerList component
 * @interface ReviewerListProps
 */
interface ReviewerListProps {
  /** Array of reviewer objects containing their information and statistics */
  reviewers: Reviewer[];
}

/**
 * ReviewerList Component
 *
 * Displays a comprehensive table of platform reviewers with detailed information
 * about each reviewer's credentials, activity, and status. The component provides
 * administrators with insights into the reviewer community and helps track
 * reviewer performance and availability.
 *
 * Features:
 * - Responsive table layout with horizontal scrolling
 * - Empty state handling with informative messages
 * - Truncated wallet address display for privacy
 * - Expertise tags with overflow handling (shows first 2, then "+X more")
 * - Color-coded status badges (active/inactive)
 * - Formatted join dates with calendar icons
 * - Review completion statistics with activity icons
 * - Consistent card-based design
 *
 * @component
 * @param {ReviewerListProps} props - Component props containing reviewers data
 * @returns {JSX.Element} The rendered reviewer list table
 */
export function ReviewerList({ reviewers }: ReviewerListProps) {
  // Handle empty state when no reviewers are available
  if (reviewers.length === 0) {
    return (
      <Card className="mt-8">
        {/* Header for empty state */}
        <CardHeader>
          <CardTitle className="text-xl font-bold">Reviewer List</CardTitle>
        </CardHeader>
        {/* Empty state content with informative message */}
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No reviewers found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    // Main card container with top margin
    <Card className="mt-8">
      {/* Card header with title */}
      <CardHeader>
        <CardTitle className="text-xl font-bold">Reviewer List</CardTitle>
      </CardHeader>

      {/* Card content containing the reviewers table */}
      <CardContent>
        {/* Horizontal scrolling container for table responsiveness */}
        <div className="overflow-x-auto">
          <Table>
            {/* Table header with column definitions */}
            <TableHeader>
              <TableRow>
                {/* Reviewer wallet address column */}
                <TableHead>Address</TableHead>
                {/* Reviewer expertise/skills column */}
                <TableHead>Expertise</TableHead>
                {/* Current status (active/inactive) column */}
                <TableHead>Status</TableHead>
                {/* Date when reviewer joined the platform */}
                <TableHead>Joined Date</TableHead>
                {/* Number of reviews completed by the reviewer */}
                <TableHead>Reviews Completed</TableHead>
              </TableRow>
            </TableHeader>

            {/* Table body with dynamic content from reviewers array */}
            <TableBody>
              {reviewers.map(reviewer => (
                <TableRow key={reviewer.id}>
                  {/* Wallet address cell with truncated display for privacy */}
                  <TableCell className="font-medium flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    {reviewer.address.substring(0, 6)}...{reviewer.address.substring(reviewer.address.length - 4)}
                  </TableCell>

                  {/* Expertise cell with skill badges and overflow handling */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {/* Display first 2 expertise areas as badges */}
                      {reviewer.expertise.slice(0, 2).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {/* Show additional expertise count if more than 2 skills */}
                      {reviewer.expertise.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{reviewer.expertise.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Status cell with color-coded badge */}
                  <TableCell>
                    <Badge className={reviewer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {reviewer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  {/* Join date cell with calendar icon and formatted date */}
                  <TableCell className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {new Date(reviewer.joinedDate).toLocaleDateString()}
                  </TableCell>

                  {/* Reviews completed cell with activity icon and count */}
                  <TableCell className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    {reviewer.reviewsCompleted} reviews
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
