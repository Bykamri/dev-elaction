"use client";

import { useEffect, useState } from "react";
import { AbiEvent, decodeEventLog, parseEther } from "viem";
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { auctionAbi } from "~~/contracts/auctionAbi";
import deployedContracts from "~~/contracts/deployedContracts";
import { erc20Abi } from "~~/contracts/erc20Abi";

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Interface for individual bid data structure
 *
 * Represents a single bid in the auction history with bidder address
 * and bid amount for comprehensive bid tracking and display.
 */
type Bid = { bidder: string; amount: bigint };

/**
 * Interface for asset metadata from IPFS
 *
 * Comprehensive metadata structure for auction assets including
 * display information, categorization, and rich media content.
 */
type Metadata = {
  name: string; // Asset display name
  description: string; // Detailed asset description
  shortDescription: string; // Brief summary for cards and previews
  category: string; // Asset category for filtering
  image: string; // Primary display image URL
  images: string[]; // Additional image gallery URLs
  attributes?: Array<{ name: string; value: string }>; // Optional asset properties
};

/**
 * Interface for complete auction details
 *
 * Comprehensive auction data structure containing all contract state,
 * metadata, bid history, and computed values for full auction management.
 */
type AuctionDetails = {
  auctionAddress: `0x${string}`; // Smart contract address for this auction
  seller: string; // Ethereum address of the asset seller
  nftAddress: `0x${string}`; // NFT contract address
  nftTokenId: bigint; // Token ID within the NFT contract
  idrxToken: `0x${string}`; // ERC-20 token contract for bidding
  startingBid: bigint; // Minimum bid amount in wei
  highestBid: bigint; // Current highest bid amount in wei
  highestBidder: string; // Address of current highest bidder
  endTime: number; // Unix timestamp when auction ends
  metadata: Metadata; // Resolved asset metadata from IPFS
  bidHistory: Bid[]; // Complete chronological bid history
  participantCount: number; // Number of unique bidders
};

/**
 * Custom React Hook for Comprehensive Auction Management
 *
 * Provides complete auction functionality including real-time data fetching,
 * bid placement, token approval management, and live auction monitoring.
 * Designed for detailed auction pages with full bidding capabilities.
 */
export const useAuctionDetails = (auctionAddress: `0x${string}`) => {
  // Wallet connection state for user-specific operations
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();

  // Core auction state management
  const [auction, setAuction] = useState<AuctionDetails | null>(null);
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [pendingBidAmount, setPendingBidAmount] = useState<string>("");
  const [proposalId, setProposalId] = useState<bigint | null>(null);

  // Transaction management hooks for approval, bidding, and ending auction
  const { data: approveHash, writeContract: approve, isPending: isApproving, reset: resetApprove } = useWriteContract();
  const { data: bidHash, writeContract: placeBidTx, isPending: isBidding, reset: resetBid } = useWriteContract();
  const {
    data: endAuctionHash,
    writeContract: finalizeAuctionTx,
    isPending: isEndingAuction,
    reset: resetEndAuction,
  } = useWriteContract();
  const { isLoading: isWaitingApproval, status: approvalStatus } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isWaitingBid, status: bidStatus } = useWaitForTransactionReceipt({ hash: bidHash });
  const { isLoading: isWaitingEndAuction, status: endAuctionStatus } = useWaitForTransactionReceipt({
    hash: endAuctionHash,
  });

  /**
   * Real-time bid event monitoring
   */
  useWatchContractEvent({
    address: auctionAddress,
    abi: auctionAbi,
    eventName: "Bid",
    onLogs(logs) {
      logs.forEach(log => {
        try {
          const { args } = decodeEventLog({ abi: auctionAbi, data: log.data, topics: log.topics });
          const newBid = args as Bid;

          setAuction(prevAuction => {
            if (!prevAuction) return null;

            // Prevent duplicate bid entries
            if (prevAuction.bidHistory.some(b => b.amount === newBid.amount && b.bidder === newBid.bidder)) {
              return prevAuction;
            }

            // Track unique participants for count accuracy
            const isNewParticipant = !prevAuction.bidHistory.some(b => b.bidder === newBid.bidder);

            return {
              ...prevAuction,
              highestBid: newBid.amount,
              highestBidder: newBid.bidder,
              bidHistory: [newBid, ...prevAuction.bidHistory],
              participantCount: isNewParticipant ? prevAuction.participantCount + 1 : prevAuction.participantCount,
            };
          });
        } catch (error) {
          // Gracefully handle event processing errors without breaking real-time updates
        }
      });
    },
  });

  /**
   * Main auction data fetching effect
   */
  useEffect(() => {
    const fetchDetails = async () => {
      if (!auctionAddress || !publicClient) return;
      if (!isRefetching) setIsLoading(true);

      try {
        // Fetch all core auction data in parallel for efficiency
        const [seller, nftAddress, nftTokenId, idrxToken, startingBid, highestBid, highestBidder, endTime] =
          await Promise.all([
            publicClient.readContract({ address: auctionAddress, abi: auctionAbi, functionName: "seller" }),
            publicClient.readContract({ address: auctionAddress, abi: auctionAbi, functionName: "nft" }),
            publicClient.readContract({ address: auctionAddress, abi: auctionAbi, functionName: "nftTokenId" }),
            publicClient.readContract({ address: auctionAddress, abi: auctionAbi, functionName: "idrxToken" }),
            publicClient.readContract({ address: auctionAddress, abi: auctionAbi, functionName: "startingBid" }),
            publicClient.readContract({ address: auctionAddress, abi: auctionAbi, functionName: "highestBid" }),
            publicClient.readContract({ address: auctionAddress, abi: auctionAbi, functionName: "highestBidder" }),
            publicClient.readContract({ address: auctionAddress, abi: auctionAbi, functionName: "endTime" }),
          ]);

        // Retrieve complete bid history from blockchain events
        const bidEvent = auctionAbi.find(item => "name" in item && item.name === "Bid" && item.type === "event") as
          | AbiEvent
          | undefined;
        if (!bidEvent) throw new Error("Bid event not found in ABI.");

        const bidLogs = await publicClient.getLogs({
          address: auctionAddress,
          event: bidEvent,
          fromBlock: 0n,
          toBlock: "latest",
        });

        // Process bid logs and maintain chronological order
        const history = bidLogs
          .map(log => decodeEventLog({ abi: auctionAbi, data: log.data, topics: log.topics }).args as Bid)
          .reverse();

        // Fetch NFT metadata from IPFS
        const tokenURI = await publicClient.readContract({
          address: nftAddress as `0x${string}`,
          abi: [
            {
              type: "function",
              name: "tokenURI",
              inputs: [{ name: "tokenId", type: "uint256" }],
              outputs: [{ name: "", type: "string" }],
              stateMutability: "view",
            },
          ],
          functionName: "tokenURI",
          args: [nftTokenId as bigint],
        });

        // Resolve metadata from IPFS with comprehensive asset information
        let fetchedMetadata: Partial<Metadata> = {};
        if (tokenURI) {
          const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud";
          const ipfsHash = (tokenURI as string).replace("ipfs://", "");
          const metaResponse = await fetch(`${gateway}/ipfs/${ipfsHash}`);
          const metaData = await metaResponse.json();

          fetchedMetadata = {
            name: metaData.name,
            description: metaData.description,
            shortDescription: metaData.shortDescription,
            category: metaData.type,
            image: metaData.thumbnail
              ? `${gateway}/ipfs/${metaData.thumbnail.replace("ipfs://", "")}`
              : "/placeholder.svg",
            images: metaData.imageUri?.map((img: string) => `${gateway}/ipfs/${img.replace("ipfs://", "")}`) || [],
            attributes: metaData.attributes || [],
          };
        }

        // Find the proposalId for this auction address by searching AuctionFactory
        let foundProposalId: bigint | null = null;
        try {
          const chainId = publicClient.chain?.id;
          if (chainId && deployedContracts[chainId as keyof typeof deployedContracts]?.AuctionFactory) {
            const auctionFactoryAddress = deployedContracts[chainId as keyof typeof deployedContracts].AuctionFactory
              .address as `0x${string}`;
            const auctionFactoryAbi = deployedContracts[chainId as keyof typeof deployedContracts].AuctionFactory.abi;

            // Get total proposals count
            const proposalsCount = (await publicClient.readContract({
              address: auctionFactoryAddress,
              abi: auctionFactoryAbi,
              functionName: "getProposalsCount",
            })) as bigint;

            // Search through proposals to find matching auction address
            for (let i = 0n; i < proposalsCount; i++) {
              const proposal = (await publicClient.readContract({
                address: auctionFactoryAddress,
                abi: auctionFactoryAbi,
                functionName: "getProposal",
                args: [i],
              })) as any;

              if (proposal.deployedAuctionAddress === auctionAddress) {
                foundProposalId = i;
                break;
              }
            }
          }
        } catch (proposalError) {
          console.warn("Could not find proposal ID for auction:", proposalError);
        }
        setProposalId(foundProposalId);

        // Construct complete auction details object
        setAuction({
          auctionAddress,
          seller: seller as string,
          nftAddress: nftAddress as `0x${string}`,
          nftTokenId: nftTokenId as bigint,
          idrxToken: idrxToken as `0x${string}`,
          startingBid: startingBid as bigint,
          highestBid: highestBid as bigint,
          highestBidder: highestBidder as string,
          endTime: Number(endTime),
          metadata: fetchedMetadata as Metadata,
          bidHistory: history,
          participantCount: new Set(history.map(b => b.bidder)).size,
        });
      } catch (error) {
        // Handle auction data fetching errors gracefully
        setAuction(null);
      } finally {
        setIsLoading(false);
        setIsRefetching(false);
      }
    };
    fetchDetails();
  }, [auctionAddress, isRefetching, publicClient]);

  /**
   * IDRX token allowance monitoring effect
   */
  useEffect(() => {
    const checkAllowance = async () => {
      if (!connectedAddress || !auction?.idrxToken || !publicClient) return;

      try {
        const allowanceAmount = await publicClient.readContract({
          address: auction.idrxToken,
          abi: erc20Abi,
          functionName: "allowance",
          args: [connectedAddress, auctionAddress],
        });
        setAllowance(allowanceAmount as bigint);
      } catch (e) {
        // Handle allowance check failures gracefully without breaking functionality
      }
    };
    if (auction) checkAllowance();
  }, [connectedAddress, auction, publicClient, approvalStatus, bidStatus, auctionAddress]);

  /**
   * Real-time auction countdown timer effect
   */
  useEffect(() => {
    if (!auction?.endTime) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = auction.endTime - now;

      if (remaining <= 0) {
        setTimeLeft("Auction Finished");
        setIsFinished(true);
        clearInterval(interval);
        return;
      }

      setIsFinished(false);
      const d = Math.floor(remaining / 86400);
      const h = Math.floor((remaining % 86400) / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [auction?.endTime]);

  /**
   * Post-approval transaction management effect
   */
  useEffect(() => {
    if (approvalStatus === "success" && auction && pendingBidAmount) {
      setTimeout(async () => {
        try {
          placeBidTx({
            address: auctionAddress,
            abi: auctionAbi,
            functionName: "bid",
            args: [parseEther(pendingBidAmount)],
          });

          resetApprove();
          setPendingBidAmount("");
        } catch (error) {
          // Handle post-approval bid errors gracefully
          resetApprove();
          setPendingBidAmount("");
        }
      }, 1000);
    } else if (approvalStatus === "error") {
      // Handle approval transaction failures
      resetApprove();
      setPendingBidAmount("");
    }
  }, [
    approvalStatus,
    placeBidTx,
    auctionAddress,
    resetApprove,
    auction,
    pendingBidAmount,
    publicClient,
    connectedAddress,
  ]);

  /**
   * Post-bid transaction management effect
   */
  useEffect(() => {
    if (bidStatus === "success") {
      setIsRefetching(true);
      setTimeout(() => setIsRefetching(false), 2000);
      resetBid();
    } else if (bidStatus === "error") {
      // Handle bid transaction failures
      resetBid();
    }
  }, [bidStatus, resetBid]);

  /**
   * Post-end auction transaction management effect
   */
  useEffect(() => {
    if (endAuctionStatus === "success") {
      setIsRefetching(true);
      setIsFinished(true);
      setTimeout(() => setIsRefetching(false), 2000);
      resetEndAuction();
    } else if (endAuctionStatus === "error") {
      // Handle end auction transaction failures
      resetEndAuction();
    }
  }, [endAuctionStatus, resetEndAuction]);

  // Transaction state aggregation for UI feedback
  const isActionLoading =
    isApproving ||
    isWaitingApproval ||
    isBidding ||
    isWaitingBid ||
    isEndingAuction ||
    isWaitingEndAuction ||
    isRefetching;

  /**
   * Dynamic button text generator based on transaction state
   */
  const getButtonText = () => {
    if (isRefetching) return "Refreshing Data...";
    if (isApproving) return "Preparing Approval...";
    if (isWaitingApproval) return "Waiting for Approval...";
    if (isBidding) return "Sending Bid...";
    if (isWaitingBid) return "Waiting for Confirmation...";
    if (isEndingAuction) return "Ending Auction...";
    if (isWaitingEndAuction) return "Waiting for Confirmation...";
    return "Place Bid";
  };

  /**
   * Hook return object with comprehensive auction management capabilities
   */
  return {
    auction, // Complete auction details or null
    allowance, // Current IDRX token allowance
    isLoading, // Initial data loading state
    isRefetching, // Post-transaction refresh state
    timeLeft, // Formatted countdown display
    isFinished, // Whether auction has ended
    isActionLoading, // Any transaction in progress
    buttonText: getButtonText(), // Dynamic button text

    /**
     * Comprehensive bid approval and placement handler
     */
    handleApprove: (amount: string) => {
      if (!amount || !auction) return;

      try {
        setPendingBidAmount(amount);
        const bidAmountWei = parseEther(amount);

        // Skip approval if sufficient allowance already exists
        if (allowance >= bidAmountWei) {
          setTimeout(() => {
            try {
              placeBidTx({
                address: auctionAddress,
                abi: auctionAbi,
                functionName: "bid",
                args: [bidAmountWei],
              });
              setPendingBidAmount("");
            } catch (bidError) {
              // Handle direct bid errors gracefully
            }
          }, 500);
          return;
        }

        // Use exact bid amount for approval to avoid unlimited spending
        approve({
          address: auction.idrxToken,
          abi: erc20Abi,
          functionName: "approve",
          args: [auctionAddress, bidAmountWei],
        });
      } catch (error) {
        // Handle approval process errors
        setPendingBidAmount("");
      }
    },

    /**
     * Direct bid placement handler for existing allowances
     */
    handleBid: async (amount: string) => {
      if (!amount || !auction) return;

      try {
        const bidAmountWei = parseEther(amount);

        // Validate bid amount against current highest bid
        if (auction.highestBid > 0n && bidAmountWei <= auction.highestBid) {
          return;
        }

        // Validate bid amount against starting bid for new auctions
        if (auction.highestBid === 0n && bidAmountWei < auction.startingBid) {
          return;
        }

        // Ensure sufficient allowance for the bid
        if (allowance < bidAmountWei) {
          return;
        }

        // Validate auction timing to prevent late bids
        const now = Math.floor(Date.now() / 1000);
        if (now >= auction.endTime) {
          return;
        }

        // Simulate transaction before execution for safety
        if (publicClient && connectedAddress) {
          try {
            await publicClient.simulateContract({
              address: auctionAddress,
              abi: auctionAbi,
              functionName: "bid",
              args: [bidAmountWei],
              account: connectedAddress,
            });
          } catch (simulationError) {
            // Handle transaction simulation failures
            return;
          }
        }

        // Execute the bid transaction
        placeBidTx({
          address: auctionAddress,
          abi: auctionAbi,
          functionName: "bid",
          args: [bidAmountWei],
        });
      } catch (error) {
        // Handle bid execution errors gracefully
      }
    },

    /**
     * End auction handler for admin users
     *
     * Calls finalizeAuction on the AuctionFactory contract with the proposalId.
     * This is the correct way to end auctions as the AuctionFactory is the owner
     * of individual auction contracts.
     */
    handleEndAuction: async () => {
      console.log("🔧 handleEndAuction called");
      console.log("📋 Current state:", {
        hasAuction: !!auction,
        hasAddress: !!connectedAddress,
        isFinished,
        auctionEndTime: auction?.endTime,
        currentTime: Math.floor(Date.now() / 1000),
        auctionAddress,
        proposalId,
      });

      if (!auction || !connectedAddress || !publicClient) {
        console.log("❌ Missing required dependencies");
        return;
      }

      if (!isFinished) {
        console.log("❌ Auction is not finished yet");
        return;
      }

      if (proposalId === null) {
        console.log("❌ Proposal ID not found");
        alert("Error ending auction: Could not find proposal ID for this auction");
        return;
      }

      try {
        const chainId = publicClient.chain?.id;
        if (!chainId || !deployedContracts[chainId as keyof typeof deployedContracts]?.AuctionFactory) {
          throw new Error("AuctionFactory contract not found for this network");
        }

        const auctionFactoryAddress = deployedContracts[chainId as keyof typeof deployedContracts].AuctionFactory
          .address as `0x${string}`;
        const auctionFactoryAbi = deployedContracts[chainId as keyof typeof deployedContracts].AuctionFactory.abi;

        console.log("🚀 Starting finalize auction transaction...");
        console.log("📍 AuctionFactory address:", auctionFactoryAddress);
        console.log("🆔 Proposal ID:", proposalId.toString());
        console.log("👤 Connected address:", connectedAddress);

        // First, simulate the transaction to validate it will succeed
        console.log("🔍 Simulating finalize auction transaction...");
        await publicClient.simulateContract({
          address: auctionFactoryAddress,
          abi: auctionFactoryAbi,
          functionName: "finalizeAuction",
          args: [proposalId],
          account: connectedAddress,
        });

        console.log("✅ Simulation successful, executing transaction...");

        // Execute the finalize auction transaction on AuctionFactory
        const result = finalizeAuctionTx({
          address: auctionFactoryAddress,
          abi: auctionFactoryAbi,
          functionName: "finalizeAuction",
          args: [proposalId],
        });

        console.log("✅ Finalize auction transaction submitted:", result);
      } catch (error: any) {
        console.error("❌ Finalize auction execution error:", error);

        // Parse error message for user-friendly display
        let errorMessage = "Failed to end auction";
        if (error?.message) {
          if (error.message.includes("already ended")) {
            errorMessage = "Auction has already been ended";
          } else if (
            error.message.includes("AccessControlUnauthorizedAccount") ||
            error.message.includes("DEFAULT_ADMIN_ROLE")
          ) {
            errorMessage =
              "Only platform administrators can end auctions. Please contact support if this auction should be ended.";
          } else if (error.message.includes("not yet ended")) {
            errorMessage = "Auction cannot be ended yet - time has not expired";
          } else if (error.message.includes("Auction is not live")) {
            errorMessage = "This auction is not in a live state and cannot be ended";
          } else if (error.message.includes("Auction contract not found")) {
            errorMessage = "Could not find the auction contract for this proposal";
          } else if (error.message.includes("Bad Request")) {
            errorMessage = "Invalid transaction parameters";
          } else {
            errorMessage = error.message;
          }
        }

        // Show user-friendly error
        alert(`Error ending auction: ${errorMessage}`);
      }
    },
  };
};
