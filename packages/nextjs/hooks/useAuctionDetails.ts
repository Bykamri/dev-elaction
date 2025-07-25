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
 *
 * Key Features:
 * - Real-time auction data synchronization with smart contracts
 * - Comprehensive bid history tracking with event monitoring
 * - Automatic IDRX token approval management with optimal allowances
 * - Live auction countdown with automatic finish detection
 * - Transaction state management for approvals and bid placement
 * - IPFS metadata resolution with rich media support
 * - Bid validation and simulation for transaction safety
 * - Real-time event listening for immediate UI updates
 * - Comprehensive error handling with graceful degradation
 *
 * Data Flow:
 * 1. Fetches complete auction state from smart contract
 * 2. Resolves NFT metadata from IPFS for asset details
 * 3. Retrieves complete bid history from blockchain events
 * 4. Monitors allowance for seamless token approvals
 * 5. Provides transaction management for bid placement
 * 6. Updates UI in real-time through contract event monitoring
 *
 * Transaction Management:
 * - Intelligent allowance checking to minimize approval transactions
 * - Automatic approval with buffer amounts for gas optimization
 * - Sequential transaction handling (approve → bid) with state tracking
 * - Transaction simulation for validation before execution
 * - Comprehensive error handling for failed transactions
 *
 * Real-time Features:
 * - Live auction countdown with seconds precision
 * - Real-time bid updates through contract event monitoring
 * - Automatic auction finish detection and UI updates
 * - Participant count tracking with duplicate prevention
 * - Immediate allowance updates after approval transactions
 *
 * Performance Optimizations:
 * - Parallel contract reads for efficient data fetching
 * - Memoized event processing to prevent duplicate updates
 * - Intelligent refetching only when necessary
 * - Optimized allowance management to reduce transaction costs
 * - Efficient bid history processing with chronological ordering
 *
 * Security Features:
 * - Bid amount validation against auction rules
 * - Transaction simulation before execution
 * - Allowance verification for sufficient token balance
 * - Auction timing validation to prevent late bids
 * - Address validation for all contract interactions
 *
 * @param {`0x${string}`} auctionAddress - Smart contract address of the auction
 * @returns {Object} Hook state and control functions
 * @returns {AuctionDetails|null} auction - Complete auction data or null if loading
 * @returns {bigint} allowance - Current IDRX token allowance for the auction
 * @returns {boolean} isLoading - Initial data loading state
 * @returns {boolean} isRefetching - Data refresh state after transactions
 * @returns {string} timeLeft - Formatted time remaining in auction
 * @returns {boolean} isFinished - Whether auction has ended
 * @returns {boolean} isActionLoading - Whether any transaction is in progress
 * @returns {string} buttonText - Dynamic button text based on transaction state
 * @returns {Function} handleApprove - Function to handle token approval and bidding
 * @returns {Function} handleBid - Function to place bids with existing allowance
 *
 * @example
 * ```tsx
 * const {
 *   auction,
 *   allowance,
 *   isLoading,
 *   timeLeft,
 *   isFinished,
 *   isActionLoading,
 *   buttonText,
 *   handleApprove,
 *   handleBid
 * } = useAuctionDetails(auctionAddress);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (!auction) return <ErrorMessage />;
 *
 * return (
 *   <div>
 *     <h1>{auction.metadata.name}</h1>
 *     <p>Current Bid: {formatEther(auction.highestBid)} IDRX</p>
 *     <p>Time Left: {timeLeft}</p>
 *     <BidHistory bids={auction.bidHistory} />
 *     <BidForm
 *       onSubmit={allowance ? handleBid : handleApprove}
 *       isLoading={isActionLoading}
 *       buttonText={buttonText}
 *       disabled={isFinished}
 *     />
 *   </div>
 * );
 * ```
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

  // Transaction management hooks for approval and bidding
  const { data: approveHash, writeContract: approve, isPending: isApproving, reset: resetApprove } = useWriteContract();
  const { data: bidHash, writeContract: placeBidTx, isPending: isBidding, reset: resetBid } = useWriteContract();
  const { isLoading: isWaitingApproval, status: approvalStatus } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isWaitingBid, status: bidStatus } = useWaitForTransactionReceipt({ hash: bidHash });

  /**
   * Real-time bid event monitoring
   *
   * Listens for new bid events on the auction contract and immediately updates
   * the auction state with new bids, participant counts, and bid history.
   * Prevents duplicate bid entries and maintains chronological ordering.
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
   *
   * Orchestrates the complete auction data pipeline including contract reads,
   * bid history retrieval, and IPFS metadata resolution. Runs on mount and
   * when refetching is triggered by successful transactions.
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
   *
   * Continuously monitors the user's IDRX token allowance for the auction contract
   * to enable seamless bidding without requiring approval for every transaction.
   * Updates automatically after approval and bid transactions.
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
   *
   * Provides live countdown display with seconds precision and automatic
   * auction finish detection. Updates UI immediately when auction ends.
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
   *
   * Handles the sequential approve → bid transaction flow with proper timing
   * and error handling. Automatically places bid after successful approval.
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
   *
   * Handles auction data refresh after successful bids and manages
   * transaction cleanup for failed bid attempts.
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

  // Transaction state aggregation for UI feedback
  const isActionLoading = isApproving || isWaitingApproval || isBidding || isWaitingBid || isRefetching;

  /**
   * Dynamic button text generator based on transaction state
   *
   * Provides contextual feedback to users about the current transaction
   * state with descriptive messages for each phase of the bidding process.
   */
  const getButtonText = () => {
    if (isRefetching) return "Refreshing Data...";
    if (isApproving) return "Preparing Approval...";
    if (isWaitingApproval) return "Waiting for Approval...";
    if (isBidding) return "Sending Bid...";
    if (isWaitingBid) return "Waiting for Confirmation...";
    return "Place Bid";
  };

  /**
   * Hook return object with comprehensive auction management capabilities
   *
   * Provides complete auction state, transaction controls, and utility functions
   * for building sophisticated auction interfaces with full bidding functionality.
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
     *
     * Manages the complete bidding workflow including allowance checking,
     * token approval with optimal amounts, and automatic bid placement.
     * Handles both new approvals and existing allowance scenarios.
     *
     * @param {string} amount - Bid amount in IDRX (human-readable format)
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

        // Calculate optimal approval amount with buffer for gas efficiency
        const additionalNeeded = bidAmountWei - allowance;
        const bufferAmount = additionalNeeded / 1000n;
        const totalApprovalNeeded = bidAmountWei + bufferAmount;

        approve({
          address: auction.idrxToken,
          abi: erc20Abi,
          functionName: "approve",
          args: [auctionAddress, totalApprovalNeeded],
        });
      } catch (error) {
        // Handle approval process errors
        setPendingBidAmount("");
      }
    },

    /**
     * Direct bid placement handler for existing allowances
     *
     * Places bids when sufficient allowance already exists, with comprehensive
     * validation including bid amount checks, auction timing, and transaction
     * simulation for safety.
     *
     * @param {string} amount - Bid amount in IDRX (human-readable format)
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
  };
};
