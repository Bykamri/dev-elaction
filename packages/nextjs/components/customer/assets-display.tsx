"use client";

import { RejectedProposalCard, WonAuctionCard } from "./asset-cards";
import { GenericAssetCard } from "./generic-asset-card";
import { Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { useAssetsData } from "~~/hooks/useAssetsData";
import { mockAuctionedItems } from "~~/lib/mock-assets";

export function AssetsDisplay() {
  const { isConnected } = useAccount();
  const { wonAuctions, rejectedProposals, isLoading, error } = useAssetsData();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Please connect your wallet to view your assets.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p className="text-muted-foreground">Loading your assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="won-auctions" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="won-auctions">My Won Auctions ({wonAuctions.length})</TabsTrigger>
        <TabsTrigger value="auctioned-items">My Auctioned Items ({mockAuctionedItems.length})</TabsTrigger>
        <TabsTrigger value="rejected-proposals">Rejected Proposals ({rejectedProposals.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="won-auctions" className="mt-6">
        {wonAuctions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wonAuctions.map(auction => (
              <WonAuctionCard key={String(auction.proposalId)} auction={auction} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">You haven&apos;t won any auctions yet.</p>
        )}
      </TabsContent>

      <TabsContent value="auctioned-items" className="mt-6">
        {mockAuctionedItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAuctionedItems.map(item => (
              <GenericAssetCard key={item.id} asset={item} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">You haven&apos;t auctioned any items yet.</p>
        )}
      </TabsContent>

      <TabsContent value="rejected-proposals" className="mt-6">
        {rejectedProposals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rejectedProposals.map(proposal => (
              <RejectedProposalCard key={String(proposal.proposalId)} proposal={proposal} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No rejected proposals found.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}
