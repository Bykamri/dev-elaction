import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";
import { auctionAbi } from "~~/contracts/auctionAbi";

// Definisikan tipe data untuk sebuah tawaran (bid)
interface Bid {
  bidder: string;
  amount: bigint;
}

/**
 * Hook kustom untuk mengambil semua data yang relevan untuk satu item lelang.
 * Menggabungkan data proposal dari AuctionFactory dengan data live dan riwayat tawaran
 * dari kontrak Auction individu.
 *
 * @param proposalId - ID dari proposal yang akan diambil. Bisa null.
 * @param auctionFactoryContract - Instance kontrak AuctionFactory yang sudah diinisialisasi.
 * @returns {object} Objek yang berisi semua data detail lelang dan status loading.
 */
export const useAuctionDetail = (proposalId: bigint | null, auctionFactoryContract: any) => {
  const publicClient = usePublicClient();

  // State untuk Metadata & Proposal
  const [proposal, setProposal] = useState<any>();
  const [assetName, setAssetName] = useState("Memuat...");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("");

  // State untuk Data Lelang Langsung
  const [highestBid, setHighestBid] = useState(0n);
  const [highestBidder, setHighestBidder] = useState("");
  const [endTime, setEndTime] = useState(0n);
  const [timeLeft, setTimeLeft] = useState("");
  const [auctionAddress, setAuctionAddress] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Guard clause untuk menangani proposalId yang null atau dependensi yang belum siap
      if (proposalId === null || !auctionFactoryContract || !publicClient) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const proposalData = await auctionFactoryContract.read.proposals([proposalId]);
        setProposal(proposalData);
        const liveAuctionAddress = proposalData[5];
        setAuctionAddress(liveAuctionAddress);

        const metadataURI = proposalData[1];
        if (metadataURI) {
          const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://ipfs.io";
          const ipfsHash = metadataURI.replace("ipfs://", "");
          const response = await fetch(`${gateway}/ipfs/${ipfsHash}`);
          const data = await response.json();

          setAssetName(data.name || "Tanpa Nama");
          setDescription(data.description || "Tidak ada deskripsi.");
          setCategory(data.type || "Lain-lain");
          if (data.imageUri && Array.isArray(data.imageUri)) {
            const imageUrls = data.imageUri.map((imgUri: string) => `${gateway}/ipfs/${imgUri.replace("ipfs://", "")}`);
            setImages(imageUrls);
          }
        }

        // 3. Jika ada alamat kontrak lelang, ambil data & riwayat tawaran
        if (liveAuctionAddress && liveAuctionAddress !== "0x0000000000000000000000000000000000000000") {
          const [bid, end, bidder, bidLogs] = await Promise.all([
            // PASTIKAN PEMANGGILAN INI TIDAK MEMILIKI PROPERTI 'args'
            // KARENA FUNGSI KONTRAKNYA TIDAK MEMILIKI ARGUMEN
            publicClient.readContract({ address: liveAuctionAddress, abi: auctionAbi, functionName: "highestBid" }),
            publicClient.readContract({ address: liveAuctionAddress, abi: auctionAbi, functionName: "endTime" }),
            publicClient.readContract({ address: liveAuctionAddress, abi: auctionAbi, functionName: "highestBidder" }),
            publicClient.getContractEvents({
              address: liveAuctionAddress,
              abi: auctionAbi,
              eventName: "Bid",
              fromBlock: 0n,
            }),
          ]);

          setHighestBid(bid as bigint);
          setEndTime(end as bigint);
          setHighestBidder(bidder as string);

          const history = bidLogs.map(log => ({
            bidder: log.args.bidder as string,
            amount: log.args.amount as bigint,
          }));
          setBidHistory(history);
        }
      } catch (e) {
        console.error(`Gagal mengambil data detail untuk proposal ${proposalId}:`, e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [proposalId, auctionFactoryContract, publicClient]);

  // Efek terpisah untuk menangani timer hitung mundur
  useEffect(() => {
    if (endTime === 0n) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Number(endTime) - now;
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
  }, [endTime]);

  // Gabungkan semua data untuk dikembalikan
  return {
    // Status & Kontrol
    isLoading,
    isFinished,
    // Metadata Aset
    assetName,
    description,
    images,
    category,
    // Data Proposal & Kontrak
    proposal,
    auctionAddress,
    // Data Lelang Langsung
    highestBid,
    highestBidder,
    endTime,
    timeLeft,
    bidHistory,
    // Kalkulasi tambahan
    displayPrice: highestBid > 0n ? highestBid : proposal?.[2] || 0n,
    formattedPrice: formatEther(highestBid > 0n ? highestBid : proposal?.[2] || 0n),
  };
};
