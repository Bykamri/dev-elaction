"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Badge } from "~~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";

interface RecentAdminActivityProps {
  recentActions: any[];
}

export function RecentAdminActivity({ recentActions }: RecentAdminActivityProps) {
  if (recentActions.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Recent Admin Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No recent admin activity to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recent Admin Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Auction ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActions.map(auction => (
                <TableRow key={auction.id}>
                  <TableCell className="font-medium">{auction.id}</TableCell>
                  <TableCell>
                    <Link href={`/auctions/${auction.id}`} className="text-primary hover:underline">
                      {auction.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center text-blue-600">
                      <CheckCircle className="w-4 h-4 mr-1" /> Auction Completed
                    </span>
                  </TableCell>
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
