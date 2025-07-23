"use client";

import { useEffect, useState } from "react";
import { AbiEvent, decodeEventLog, formatEther, parseEther } from "viem";
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { auctionAbi } from "~~/contracts/auctionAbi";
import { erc20Abi } from "~~/contracts/erc20Abi";
import { debugBidding } from "~~/utils/debugBidding";

// --- Tipe Data ---
type Bid = { bidder: string; amount: bigint };
type Metadata = {
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  image: string;
  images: string[];
};
type AuctionDetails = {
  auctionAddress: `0x${string}`;
  seller: string;
  nftAddress: `0x${string}`;
  nftTokenId: bigint;
  idrxToken: `0x${string}`;
  startingBid: bigint;
  highestBid: bigint;
  highestBidder: string;
  endTime: number;
  metadata: Metadata;
  bidHistory: Bid[];
  participantCount: number;
};

export const useAuctionDetails = (auctionAddress: `0x${string}`) => {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();

  // --- State ---
  const [auction, setAuction] = useState<AuctionDetails | null>(null);
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [pendingBidAmount, setPendingBidAmount] = useState<string>("");

  // --- Hooks Transaksi ---
  const { data: approveHash, writeContract: approve, isPending: isApproving, reset: resetApprove } = useWriteContract();
  const { data: bidHash, writeContract: placeBidTx, isPending: isBidding, reset: resetBid } = useWriteContract();
  const { isLoading: isWaitingApproval, status: approvalStatus } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isWaitingBid, status: bidStatus } = useWaitForTransactionReceipt({ hash: bidHash });

  // --- (REAL-TIME) Mendengarkan dan Memproses event 'Bid' ---
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
            if (prevAuction.bidHistory.some(b => b.amount === newBid.amount && b.bidder === newBid.bidder)) {
              return prevAuction;
            }
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
          console.error("Gagal memproses log event Bid:", error);
        }
      });
    },
  });

  // --- (DATA) useEffect untuk mengambil data awal ---
  useEffect(() => {
    const fetchDetails = async () => {
      if (!auctionAddress || !publicClient) return;
      if (!isRefetching) setIsLoading(true);
      try {
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
        const bidEvent = auctionAbi.find(item => "name" in item && item.name === "Bid" && item.type === "event") as
          | AbiEvent
          | undefined;
        if (!bidEvent) throw new Error("Event 'Bid' tidak ditemukan di ABI.");
        const bidLogs = await publicClient.getLogs({
          address: auctionAddress,
          event: bidEvent,
          fromBlock: 0n,
          toBlock: "latest",
        });
        const history = bidLogs
          .map(log => decodeEventLog({ abi: auctionAbi, data: log.data, topics: log.topics }).args as Bid)
          .reverse();
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
          };
        }
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
        console.error("Gagal mengambil detail lelang:", error);
        setAuction(null);
      } finally {
        setIsLoading(false);
        setIsRefetching(false);
      }
    };
    fetchDetails();
  }, [auctionAddress, isRefetching, publicClient]);

  // --- useEffect untuk memeriksa allowance ---
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
        console.error("Gagal memeriksa allowance:", e);
      }
    };
    if (auction) checkAllowance();
  }, [connectedAddress, auction, publicClient, approvalStatus, bidStatus, auctionAddress]);

  // --- useEffect untuk timer ---
  useEffect(() => {
    if (!auction?.endTime) return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = auction.endTime - now;
      if (remaining <= 0) {
        setTimeLeft("Lelang Selesai");
        setIsFinished(true);
        clearInterval(interval);
        return;
      }
      setIsFinished(false);
      const d = Math.floor(remaining / 86400);
      const h = Math.floor((remaining % 86400) / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;
      setTimeLeft(`${d}h ${h}j ${m}m ${s}d`);
    }, 1000);
    return () => clearInterval(interval);
  }, [auction?.endTime]);

  // --- useEffects untuk alur transaksi ---
  useEffect(() => {
    if (approvalStatus === "success" && auction && pendingBidAmount) {
      // Tunggu sebentar setelah approval sebelum bid untuk memastikan allowance ter-update
      setTimeout(async () => {
        try {
          console.log("🚀 Starting bid transaction after approval success");

          // Verify allowance is updated before bidding
          const updatedAllowance = await publicClient?.readContract({
            address: auction.idrxToken,
            abi: erc20Abi,
            functionName: "allowance",
            args: [connectedAddress!, auctionAddress],
          });

          console.log("Updated allowance after approval:", updatedAllowance?.toString());

          // Setelah approval berhasil, langsung jalankan bid dengan amount yang disimpan
          placeBidTx({
            address: auctionAddress,
            abi: auctionAbi,
            functionName: "bid",
            args: [parseEther(pendingBidAmount)],
          });

          resetApprove();
          setPendingBidAmount(""); // Clear the pending amount
        } catch (error) {
          console.error("Error during post-approval bid process:", error);
          alert("Gagal memproses bid setelah approval. Silakan coba lagi.");
          resetApprove();
          setPendingBidAmount("");
        }
      }, 1000); // Delay 1 detik untuk memastikan allowance ter-update di blockchain
    } else if (approvalStatus === "error") {
      console.error("Approval transaction failed");
      alert("Transaksi approval gagal. Silakan coba lagi.");
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

  useEffect(() => {
    if (bidStatus === "success") {
      alert("Tawaran Anda berhasil! Data akan diperbarui secara otomatis.");
      setIsRefetching(true);
      setTimeout(() => setIsRefetching(false), 2000);
      resetBid();
    } else if (bidStatus === "error") {
      console.error("Bid transaction failed");
      alert("Transaksi bid gagal. Silakan coba lagi atau periksa console untuk detail error.");
      resetBid();
    }
  }, [bidStatus, resetBid]);

  const isActionLoading = isApproving || isWaitingApproval || isBidding || isWaitingBid || isRefetching;
  const getButtonText = () => {
    if (isRefetching) return "Menyegarkan Data...";
    if (isApproving) return "Menyiapkan Izin...";
    if (isWaitingApproval) return "Menunggu Izin...";
    if (isBidding) return "Mengirim Tawaran...";
    if (isWaitingBid) return "Menunggu Konfirmasi...";
    return "Tawar";
  };

  // --- PERBAIKAN UTAMA: Objek yang Dikembalikan ---
  return {
    auction,
    allowance,
    isLoading,
    isRefetching,
    timeLeft,
    isFinished,
    isActionLoading,
    buttonText: getButtonText(),
    // Fungsi ini dipanggil oleh tombol 'Approve' di UI
    handleApprove: (amount: string) => {
      if (!amount || !auction) return;

      try {
        // Debug logging
        debugBidding.logBiddingDetails(
          amount,
          allowance,
          auction.highestBid,
          auction.startingBid,
          auction.endTime,
          auctionAddress,
          connectedAddress,
        );

        // Store the bid amount for later use after approval
        setPendingBidAmount(amount);

        // Parse the amount to wei
        const bidAmountWei = parseEther(amount);

        // Check if current allowance is sufficient
        if (allowance >= bidAmountWei) {
          console.log("✅ Current allowance is sufficient, no need to approve again");
          // Skip approval and directly proceed to bid
          setTimeout(() => {
            try {
              placeBidTx({
                address: auctionAddress,
                abi: auctionAbi,
                functionName: "bid",
                args: [bidAmountWei],
              });
              setPendingBidAmount(""); // Clear the pending amount
            } catch (bidError) {
              console.error("Error placing bid with existing allowance:", bidError);
              alert("Gagal melakukan bid. Silakan coba lagi.");
            }
          }, 500);
          return;
        }

        // Calculate total approval needed (existing allowance + additional needed + buffer)
        const additionalNeeded = bidAmountWei - allowance;
        const bufferAmount = additionalNeeded / 1000n; // 0.1% buffer
        const totalApprovalNeeded = bidAmountWei + bufferAmount;

        console.log("Current allowance:", allowance.toString());
        console.log("Bid amount needed:", bidAmountWei.toString());
        console.log("Additional needed:", additionalNeeded.toString());
        console.log("Total approval amount:", totalApprovalNeeded.toString());

        // Approve the total amount needed for the auction contract
        approve({
          address: auction.idrxToken,
          abi: erc20Abi,
          functionName: "approve",
          args: [auctionAddress, totalApprovalNeeded],
        });
      } catch (error) {
        console.error("Error in handleApprove:", error);
        alert("Gagal memproses approval. Silakan periksa koneksi dan coba lagi.");
        setPendingBidAmount("");
      }
    },
    // Fungsi ini dipanggil oleh tombol 'Tawar' di UI
    handleBid: async (amount: string) => {
      if (!amount || !auction) return;

      try {
        // Debug logging
        debugBidding.logBiddingDetails(
          amount,
          allowance,
          auction.highestBid,
          auction.startingBid,
          auction.endTime,
          auctionAddress,
          connectedAddress,
        );

        const bidAmountWei = parseEther(amount);

        // Validasi sebelum bid
        if (auction.highestBid > 0n && bidAmountWei <= auction.highestBid) {
          alert(`Tawaran harus lebih tinggi dari ${formatEther(auction.highestBid)} ETH`);
          return;
        }

        if (auction.highestBid === 0n && bidAmountWei < auction.startingBid) {
          alert(`Tawaran harus minimal ${formatEther(auction.startingBid)} ETH`);
          return;
        }

        // Check allowance sebelum bid
        if (allowance < bidAmountWei) {
          const shortfall = bidAmountWei - allowance;
          alert(
            `Allowance tidak mencukupi.\n` +
              `Dibutuhkan: ${formatEther(bidAmountWei)} ETH\n` +
              `Allowance saat ini: ${formatEther(allowance)} ETH\n` +
              `Kekurangan: ${formatEther(shortfall)} ETH\n\n` +
              `Silakan approve token terlebih dahulu.`,
          );
          return;
        }

        // Additional validation: Check if auction is still active
        const now = Math.floor(Date.now() / 1000);
        if (now >= auction.endTime) {
          alert("Lelang sudah berakhir. Tidak dapat melakukan bid.");
          return;
        }

        console.log("✅ Placing bid:", bidAmountWei.toString(), "Current allowance:", allowance.toString());

        // Pre-validate transaction by simulating the call
        if (publicClient && connectedAddress) {
          try {
            await publicClient.simulateContract({
              address: auctionAddress,
              abi: auctionAbi,
              functionName: "bid",
              args: [bidAmountWei],
              account: connectedAddress,
            });
            console.log("✅ Transaction simulation successful");
          } catch (simulationError) {
            console.error("❌ Transaction simulation failed:", simulationError);
            debugBidding.logTransactionError(simulationError, "bid");
            alert("Transaksi tidak dapat diproses. Periksa kondisi auction dan balance Anda.");
            return;
          }
        }

        // The bid function requires the bid amount as parameter
        placeBidTx({
          address: auctionAddress,
          abi: auctionAbi,
          functionName: "bid",
          args: [bidAmountWei],
        });
      } catch (error) {
        console.error("Error in handleBid:", error);
        debugBidding.logTransactionError(error, "bid");
        alert("Gagal memproses bid. Silakan periksa koneksi dan coba lagi.");
      }
    },
  };
};
