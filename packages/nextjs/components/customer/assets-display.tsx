"use client";

import { RejectedProposalCard, WonAuctionCard } from "./asset-cards";
import { GenericAssetCard } from "./generic-asset-card";
import { useAccount } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { mockMyAuctionedItems, mockRejectedProposals, mockWonAuctions } from "~~/lib/mock-my-assets";

export function AssetsDisplay() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Please connect your wallet to view your assets.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="won-auctions" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="won-auctions">My Won Auctions ({mockWonAuctions.length})</TabsTrigger>
        <TabsTrigger value="auctioned-items">My Auctioned Items ({mockMyAuctionedItems.length})</TabsTrigger>
        <TabsTrigger value="rejected-proposals">Rejected Proposals ({mockRejectedProposals.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="won-auctions" className="mt-6">
        {mockWonAuctions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWonAuctions.map(auction => (
              <WonAuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">You haven&apos;t won any auctions yet.</p>
        )}
      </TabsContent>

      <TabsContent value="auctioned-items" className="mt-6">
        {mockMyAuctionedItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockMyAuctionedItems.map(item => (
              <GenericAssetCard key={item.id} asset={item} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">You haven&apos;t auctioned any items yet.</p>
        )}
      </TabsContent>

      <TabsContent value="rejected-proposals" className="mt-6">
        {mockRejectedProposals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRejectedProposals.map(proposal => (
              <RejectedProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No rejected proposals found.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}
