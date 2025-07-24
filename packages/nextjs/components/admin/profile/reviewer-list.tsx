"use client";

import { Activity, Calendar, Wallet } from "lucide-react";
import { Badge } from "~~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/table";
import type { Reviewer } from "~~/lib/mock-reviewers";

interface ReviewerListProps {
  reviewers: Reviewer[];
}

export function ReviewerList({ reviewers }: ReviewerListProps) {
  if (reviewers.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Reviewer List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No reviewers found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Reviewer List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Reviews Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewers.map(reviewer => (
                <TableRow key={reviewer.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    {reviewer.address.substring(0, 6)}...{reviewer.address.substring(reviewer.address.length - 4)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {reviewer.expertise.slice(0, 2).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {reviewer.expertise.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{reviewer.expertise.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={reviewer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {reviewer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {new Date(reviewer.joinedDate).toLocaleDateString()}
                  </TableCell>
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
