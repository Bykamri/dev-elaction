import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { auctionAbi } from "~~/contracts/auctionAbi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

export interface Auction {
  proposalId: bigint;
  proposer: string;
  assetName: string;
  imageUrl: string;
  category: string;
  startingBid: bigint;
  highestBid: bigint;
  status: number;
  auctionAddress: string;
  endTime: bigint;
}

/**
 * Hook untuk mengambil daftar semua lelang yang relevan (Live atau Finished)
 * secara efisien untuk ditampilkan di halaman utama/induk.
 */
export const useAuctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: auctionFactoryContract } = useScaffoldContract({
    contractName: "AuctionFactory",
  });
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchAllAuctions = async () => {
      if (!auctionFactoryContract || !publicClient) return;

      try {
        const count = await auctionFactoryContract.read.getProposalsCount();
        const proposalPromises = Array.from({ length: Number(count) }, (_, i) =>
          auctionFactoryContract.read.proposals([BigInt(i)]),
        );
        const rawProposals = await Promise.all(proposalPromises);
        const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://ipfs.io";

        const auctionsData = await Promise.all(
          rawProposals.map(async (proposal, index) => {
            const status = proposal[4];
            // Hanya proses lelang dengan status Live (2) atau Finished (3)
            if (status !== 2 && status !== 3) {
              return null;
            }

            let metadata: any = { name: "Tanpa Nama", thumbnail: "", type: "Lain-lain" };
            if (proposal[1]) {
              try {
                const ipfsHash = proposal[1].replace("ipfs://", "");
                const res = await fetch(`${gateway}/ipfs/${ipfsHash}`);
                const data = await res.json();
                metadata = { ...metadata, ...data };
              } catch (e) {
                console.error(`Gagal fetch metadata untuk proposal ${index}`, e);
              }
            }

            let auctionDetails = { highestBid: 0n, endTime: 0n };
            const auctionAddress = proposal[5];
            if (auctionAddress !== "0x0000000000000000000000000000000000000000") {
              try {
                const [bid, end] = await Promise.all([
                  publicClient.readContract({ address: auctionAddress, abi: auctionAbi, functionName: "highestBid" }),
                  publicClient.readContract({ address: auctionAddress, abi: auctionAbi, functionName: "endTime" }),
                ]);
                auctionDetails = { highestBid: bid as bigint, endTime: end as bigint };
              } catch (e) {
                console.error(`Gagal baca kontrak lelang di ${auctionAddress}`, e);
              }
            }

            return {
              proposalId: BigInt(index),
              proposer: proposal[0],
              assetName: metadata.name || "Tanpa Nama",
              imageUrl: metadata.thumbnail
                ? `${gateway}/ipfs/${metadata.thumbnail.replace("ipfs://", "")}`
                : "/placeholder.svg",
              category: metadata.type || "Lain-lain", // Menggunakan .type sesuai metadata.json
              startingBid: proposal[2],
              status: proposal[4],
              auctionAddress: proposal[5],
              ...auctionDetails,
            };
          }),
        );
        setAuctions(auctionsData.filter(Boolean) as Auction[]);
      } catch (e) {
        console.error("Gagal mengambil semua data lelang:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAuctions();
  }, [auctionFactoryContract, publicClient]);

  return { auctions, isLoading };
};
