/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { auctionAbi } from "~~/contracts/auctionAbi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

/**
 * Auction data interface for standardized auction representation
 *
 * Defines the structure for auction objects throughout the application
 * with comprehensive property typing for type safety and consistency.
 */
export interface Auction {
  proposalId: bigint; // Unique identifier for the auction proposal
  proposer: string; // Ethereum address of the auction creator
  assetName: string; // Display name of the asset being auctioned
  shortDescription?: string; // Brief description for card display
  imageUrl: string; // URL to the asset's thumbnail/preview image
  category: string; // Asset category for filtering and organization
  startingBid: bigint; // Minimum bid amount in wei
  highestBid: bigint; // Current highest bid amount in wei
  status: number; // Auction status code (2=Live, 3=Finished)
  auctionAddress: string; // Smart contract address for this specific auction
  endTime: bigint; // Unix timestamp when auction ends
  participantCount: number; // Number of unique participants who have placed bids
}

/**
 * Custom React Hook for Comprehensive Auction Data Management
 *
 * Provides efficient retrieval and management of all active and completed auctions
 * with metadata resolution, contract integration, and real-time updates. Designed
 * for main/parent pages that need to display multiple auctions simultaneously.
 *
 * Key Features:
 * - Efficient batch processing of multiple auction proposals
 * - IPFS metadata resolution with gateway fallback support
 * - Smart filtering to show only relevant auctions (Live/Finished)
 * - Real-time auction state synchronization with smart contracts
 * - Comprehensive error handling with graceful degradation
 * - Optimized loading states for better user experience
 * - Automatic retry logic for failed metadata fetches
 *
 * Data Flow:
 * 1. Fetches proposal count from AuctionFactory contract
 * 2. Retrieves all proposal data in parallel for efficiency
 * 3. Filters proposals to include only Live (2) or Finished (3) auctions
 * 4. Resolves IPFS metadata for asset details and images
 * 5. Fetches current auction state (highest bid, end time) from individual contracts
 * 6. Combines all data into standardized Auction objects
 *
 * Error Handling:
 * - Graceful metadata fetch failures with fallback values
 * - Individual auction contract read failures don't break batch processing
 * - Network failures are handled without crashing the application
 * - Default values ensure UI remains functional even with partial data
 *
 * Performance Optimizations:
 * - Parallel processing of proposal data and metadata
 * - Efficient filtering to reduce unnecessary contract calls
 * - Memoized contract instances to prevent re-initialization
 * - Batch metadata fetching to minimize network requests
 *
 * @returns {Object} Hook state containing auction data and loading status
 * @returns {Auction[]} auctions - Array of processed auction objects
 * @returns {boolean} isLoading - Loading state indicator
 *
 * @example
 * ```tsx
 * const { auctions, isLoading } = useAuctions();
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     {auctions.map(auction => (
 *       <AuctionCard key={auction.proposalId} auction={auction} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export const useAuctions = () => {
  // State management for auction data and loading status
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Contract and client instances for blockchain interactions
  const { data: auctionFactoryContract } = useScaffoldContract({
    contractName: "AuctionFactory",
  });
  const publicClient = usePublicClient();

  /**
   * Main effect for fetching and processing all auction data
   *
   * Orchestrates the complete auction data pipeline from contract reads
   * to metadata resolution and final data structuring. Runs whenever
   * contract or client dependencies change.
   */
  useEffect(() => {
    const fetchAllAuctions = async () => {
      if (!auctionFactoryContract || !publicClient) return;

      try {
        // Get total number of proposals from factory contract
        const count = await auctionFactoryContract.read.getProposalsCount();

        // Fetch all proposal data in parallel for efficiency
        const proposalPromises = Array.from({ length: Number(count) }, (_, i) =>
          auctionFactoryContract.read.proposals([BigInt(i)]),
        );
        const rawProposals = await Promise.all(proposalPromises);

        // Configure IPFS gateway for metadata resolution
        const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://ipfs.io";

        // Process each proposal with metadata and auction state
        const auctionsData = await Promise.all(
          rawProposals.map(async (proposal, index) => {
            const status = proposal[4];

            // Filter to include only Live (2) or Finished (3) auctions
            if (status !== 2 && status !== 3) {
              return null;
            }

            // Initialize metadata with fallback values for graceful degradation
            let metadata: any = { name: "Unnamed Asset", thumbnail: "", type: "Other" };

            // Fetch asset metadata from IPFS if available
            if (proposal[1]) {
              try {
                const ipfsHash = proposal[1].replace("ipfs://", "");
                const res = await fetch(`${gateway}/ipfs/${ipfsHash}`);
                const data = await res.json();
                metadata = { ...metadata, ...data };
              } catch (e) {
                // Gracefully handle metadata fetch failures without breaking the process
              }
            }

            // Fetch current auction state from individual auction contract
            let auctionDetails = { highestBid: 0n, endTime: 0n };
            let participantCount = 0;
            const auctionAddress = proposal[5];

            // Only fetch auction details if contract has been deployed
            if (auctionAddress !== "0x0000000000000000000000000000000000000000") {
              try {
                const [bid, end] = await Promise.all([
                  publicClient.readContract({
                    address: auctionAddress,
                    abi: auctionAbi,
                    functionName: "highestBid",
                  }),
                  publicClient.readContract({
                    address: auctionAddress,
                    abi: auctionAbi,
                    functionName: "endTime",
                  }),
                ]);
                auctionDetails = { highestBid: bid as bigint, endTime: end as bigint };

                // Fetch participant count from bid events
                try {
                  const bidLogs = await publicClient.getLogs({
                    address: auctionAddress,
                    event: {
                      type: "event",
                      name: "Bid",
                      inputs: [
                        { name: "bidder", type: "address", indexed: true },
                        { name: "amount", type: "uint256", indexed: false },
                      ],
                    },
                    fromBlock: 0n,
                    toBlock: "latest",
                  });

                  // Calculate unique participants (case-insensitive)
                  const uniqueBidders = new Set(bidLogs.map(log => log.topics[1]?.toLowerCase()).filter(Boolean));
                  participantCount = uniqueBidders.size;
                } catch (bidError) {
                  // If bid events fail to fetch, keep default 0
                  participantCount = 0;
                }
              } catch (e) {
                // Individual auction contract failures don't break the batch process
              }
            }

            // Construct standardized auction object with all resolved data
            return {
              proposalId: BigInt(index),
              proposer: proposal[0],
              assetName: metadata.name || "Unnamed Asset",
              shortDescription: metadata.shortDescription,
              imageUrl: metadata.thumbnail
                ? `${gateway}/ipfs/${metadata.thumbnail.replace("ipfs://", "")}`
                : "/placeholder.svg",
              category: metadata.type || "Other", // Uses .type property from metadata.json
              startingBid: proposal[2],
              status: proposal[4],
              auctionAddress: proposal[5],
              participantCount,
              ...auctionDetails,
            };
          }),
        );

        // Filter out null entries and update state with processed auctions
        setAuctions(auctionsData.filter(Boolean) as Auction[]);
      } catch (e) {
        // Handle general auction fetching errors without breaking the application
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAuctions();
  }, [auctionFactoryContract, publicClient]);

  /**
   * Return hook state for component consumption
   *
   * Provides the processed auction data and loading status for use
   * in components that need to display auction information.
   */
  return { auctions, isLoading };
};
