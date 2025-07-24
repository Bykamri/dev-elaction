"use client";

import Image from "next/image";
import { Calendar, Trophy, XCircle } from "lucide-react";
import { Badge } from "~~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { RejectedProposal, WonAuction } from "~~/hooks/useAssetsData";

interface WonAuctionCardProps {
  auction: WonAuction;
}

export function WonAuctionCard({ auction }: WonAuctionCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={auction.imageUrl || "/placeholder.svg"}
          alt={auction.title}
          width={400}
          height={192}
          className="w-full h-48 object-cover"
        />
        <Badge className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700">
          <Trophy className="w-3 h-3 mr-1" />
          Won
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-1">{auction.title}</CardTitle>
        <CardDescription className="line-clamp-2">{auction.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Final Price:</span>
            <span className="font-bold text-blue-600">
              {auction.finalPrice} {auction.currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Badge variant="outline">{auction.category}</Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Calendar className="w-4 h-4 mr-1" />
            Won on {auction.endTime.toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RejectedProposalCardProps {
  proposal: RejectedProposal;
}

export function RejectedProposalCard({ proposal }: RejectedProposalCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-red-200">
      <div className="relative">
        <Image
          src={proposal.imageUrl || "/placeholder.svg"}
          alt={proposal.title}
          width={400}
          height={192}
          className="w-full h-48 object-cover opacity-75"
        />
        <Badge className="absolute top-2 right-2 bg-red-600 hover:bg-red-700">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-1">{proposal.title}</CardTitle>
        <CardDescription className="line-clamp-2">{proposal.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Starting Price:</span>
            <span className="font-bold text-blue-600">
              {proposal.startingPrice} {proposal.currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Badge variant="outline">{proposal.category}</Badge>
          </div>
          {proposal.rejectionReason && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">
                <strong>Reason:</strong> {proposal.rejectionReason}
              </p>
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Calendar className="w-4 h-4 mr-1" />
            Submitted on {proposal.submittedAt.toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
