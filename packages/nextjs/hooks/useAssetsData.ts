"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

export interface WonAuction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  finalPrice: string;
  currency: "ETH" | "IDRX";
  endTime: Date;
  proposalId: number;
  auctionAddress: string;
  txHash?: string;
}

export interface RejectedProposal {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  startingPrice: string;
  currency: "ETH" | "IDRX";
  proposalId: number;
  rejectionReason?: string;
  submittedAt: Date;
}

export const useAssetsData = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
  const [rejectedProposals, setRejectedProposals] = useState<RejectedProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get contracts
  const { data: auctionFactoryContract } = useScaffoldContract({ contractName: "AuctionFactory" });

  const fetchWonAuctions = useCallback(async () => {
    if (!address || !auctionFactoryContract || !publicClient) return [];

    try {
      const proposalsCount = await auctionFactoryContract.read.getProposalsCount();
      const wonAuctions: WonAuction[] = [];

      for (let i = 0; i < proposalsCount; i++) {
        try {
          const proposal = await auctionFactoryContract.read.proposals([BigInt(i)]);
          const [, metadataURI, , , , auctionAddress] = proposal;

          // Only check auctions that are live/finished and have auction contracts
          if (auctionAddress && auctionAddress !== "0x0000000000000000000000000000000000000000") {
            // Fetch metadata from IPFS
            let title = "Untitled Asset";
            let description = "No description available";
            let imageUrl = "/placeholder.svg";

            try {
              if (metadataURI) {
                const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://ipfs.io";
                const ipfsHash = String(metadataURI).replace("ipfs://", "");
                const response = await fetch(`${gateway}/ipfs/${ipfsHash}`);
                const metadata = await response.json();

                title = metadata.name || title;
                description = metadata.description || description;
                imageUrl = metadata.thumbnail
                  ? `${gateway}/ipfs/${metadata.thumbnail.replace("ipfs://", "")}`
                  : imageUrl;
              }
            } catch (metadataError) {
              console.warn(`Failed to fetch metadata for proposal ${i}:`, metadataError);
            }

            // Here you would read from the actual auction contract to check if user won
            // For now, we'll create mock data for demonstration
            // In real implementation, you'd read from the auction contract's winner

            // Mock check - in real implementation, check auction contract for winner
            const isWinner = Math.random() > 0.8; // Simulate some won auctions

            if (isWinner) {
              wonAuctions.push({
                id: `won-${i}`,
                title,
                description,
                imageUrl,
                category: "Real Estate", // Would come from proposal metadata
                finalPrice: (Math.random() * 5 + 0.1).toFixed(4),
                currency: "ETH",
                endTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                proposalId: i,
                auctionAddress: String(auctionAddress),
              });
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch proposal ${i}:`, err);
        }
      }

      return wonAuctions;
    } catch (err) {
      console.error("Failed to fetch won auctions:", err);
      return [];
    }
  }, [address, auctionFactoryContract, publicClient]);

  const fetchRejectedProposals = useCallback(async () => {
    if (!address || !auctionFactoryContract || !publicClient) return [];

    try {
      const proposalsCount = await auctionFactoryContract.read.getProposalsCount();
      const rejectedProposals: RejectedProposal[] = [];

      for (let i = 0; i < proposalsCount; i++) {
        try {
          const proposal = await auctionFactoryContract.read.proposals([BigInt(i)]);
          const [proposer, metadataURI, startingBid, , status] = proposal;

          // Check if this proposal was created by current user and is rejected
          if (String(proposer).toLowerCase() === address.toLowerCase() && Number(status) === 2) {
            // 2 = rejected status

            // Fetch metadata from IPFS
            let title = "Untitled Asset";
            let description = "No description available";
            let imageUrl = "/placeholder.svg";

            try {
              if (metadataURI) {
                const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://ipfs.io";
                const ipfsHash = String(metadataURI).replace("ipfs://", "");
                const response = await fetch(`${gateway}/ipfs/${ipfsHash}`);
                const metadata = await response.json();

                title = metadata.name || title;
                description = metadata.description || description;
                imageUrl = metadata.thumbnail
                  ? `${gateway}/ipfs/${metadata.thumbnail.replace("ipfs://", "")}`
                  : imageUrl;
              }
            } catch (metadataError) {
              console.warn(`Failed to fetch metadata for rejected proposal ${i}:`, metadataError);
            }

            rejectedProposals.push({
              id: `rejected-${i}`,
              title,
              description,
              imageUrl,
              category: "Real Estate", // Would come from proposal metadata
              startingPrice: formatEther(startingBid), // Convert bigint to formatted string
              currency: "ETH",
              proposalId: i,
              rejectionReason: "Does not meet quality standards", // Would come from contract
              submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            });
          }
        } catch (err) {
          console.warn(`Failed to fetch proposal ${i}:`, err);
        }
      }

      return rejectedProposals;
    } catch (err) {
      console.error("Failed to fetch rejected proposals:", err);
      return [];
    }
  }, [address, auctionFactoryContract, publicClient]);

  const fetchData = useCallback(async () => {
    if (!address || !isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const [wonAuctionsData, rejectedProposalsData] = await Promise.all([
        fetchWonAuctions(),
        fetchRejectedProposals(),
      ]);

      setWonAuctions(wonAuctionsData);
      setRejectedProposals(rejectedProposalsData);
    } catch (err) {
      console.error("Failed to fetch assets data:", err);
      setError("Failed to load assets data");
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, fetchWonAuctions, fetchRejectedProposals]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    wonAuctions,
    rejectedProposals,
    isLoading,
    error,
    refreshData,
  };
};
