"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, DollarSign, Hourglass, User, XCircle } from "lucide-react";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { auctionAbi } from "~~/contracts/auctionAbi";
import { useProposalData } from "~~/hooks/useProposalData";
import { CategoryBadge } from "~~/utils/CategoryBadge";
import { shortenAddress } from "~~/utils/addressFormat";

interface AuctionRequestCardProps {
  proposalId: bigint;
  auctionFactoryContract: any; // Instance kontrak dari parent
}

enum ProposalStatus {
  Pending,
  Rejected,
  Live,
  Finished,
}

export function AuctionRequestCard({ proposalId, auctionFactoryContract }: AuctionRequestCardProps) {
  const { proposal, assetName, description, imageUrl, isLoading, categories } = useProposalData(
    proposalId,
    auctionFactoryContract,
  );

  // State untuk data real-time (tidak termasuk dalam useProposalData)
  const [highestBid, setHighestBid] = useState(0n);
  const [timeLeft, setTimeLeft] = useState("");
  const publicClient = usePublicClient();

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    const fetchAuctionData = async () => {
      if (proposal && publicClient) {
        const status: ProposalStatus = proposal[4];
        const auctionAddress: `0x${string}` = proposal[5];

        if (
          auctionAddress &&
          auctionAddress !== "0x0000000000000000000000000000000000000000" &&
          (status === ProposalStatus.Live || status === ProposalStatus.Finished)
        ) {
          try {
            const bid = await publicClient.readContract({
              address: auctionAddress,
              abi: auctionAbi,
              functionName: "highestBid",
            });
            const end = await publicClient.readContract({
              address: auctionAddress,
              abi: auctionAbi,
              functionName: "endTime",
            });
            setHighestBid(bid as bigint);

            interval = setInterval(() => {
              const remaining = Number(end) - Math.floor(Date.now() / 1000);
              if (remaining <= 0) {
                setTimeLeft("Selesai");
                clearInterval(interval);
              } else {
                const d = Math.floor(remaining / 86400);
                const h = Math.floor((remaining % 86400) / 3600);
                const m = Math.floor((remaining % 3600) / 60);
                setTimeLeft(`${d}h ${h}j ${m}m`);
              }
            }, 1000);
          } catch (e) {
            console.error("Gagal mengambil data lelang:", e);
          }
        }
      }
    };

    fetchAuctionData();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [proposal, publicClient]);

  // Tampilan skeleton saat data dari hook sedang dimuat
  if (isLoading || !proposal) {
    return (
      <Card className="overflow-hidden">
        <div className="relative">
          <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
        </div>
        <CardHeader className="pb-2">
          <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded"></div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Ambil data dari state yang sudah di-fetch
  const currentStatus: ProposalStatus = proposal[4];
  const sellerAddress = proposal[0]; // proposer address
  const startingBid = proposal[2];

  const statusBadge = {
    [ProposalStatus.Pending]: (
      <Badge className="absolute top-3 left-3 bg-yellow-100 text-yellow-800">
        <Hourglass className="w-3 h-3 mr-1" /> Pending Review
      </Badge>
    ),
    [ProposalStatus.Rejected]: (
      <Badge className="absolute top-3 left-3 bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" /> Rejected
      </Badge>
    ),
    [ProposalStatus.Live]: (
      <Badge className="absolute top-3 left-3 bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" /> Live
      </Badge>
    ),
    [ProposalStatus.Finished]: (
      <Badge className="absolute top-3 left-3 bg-gray-200 text-gray-800">
        <CheckCircle className="w-3 h-3 mr-1" /> Finished
      </Badge>
    ),
  }[currentStatus];
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={assetName}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
        {statusBadge}
        <div className="absolute top-3 right-3">
          <CategoryBadge category={categories} />
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground truncate" title={assetName}>
          {assetName || "Memuat nama..."}
        </CardTitle>
        <CardDescription className="text-muted-foreground line-clamp-2 text-sm">{description || "..."}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center text-muted-foreground text-sm">
          <User className="w-4 h-4 mr-1" />
          <span className="truncate">Diajukan oleh: {shortenAddress(sellerAddress)}</span>
        </div>

        {currentStatus === ProposalStatus.Pending && (
          <div className="flex items-center text-muted-foreground text-sm">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>Harga Awal: {formatEther(startingBid)} ETH</span>
          </div>
        )}
        {currentStatus === ProposalStatus.Live && (
          <div className="flex items-center text-muted-foreground text-sm">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>
              {highestBid > 0n
                ? `Tawaran Tertinggi: ${formatEther(highestBid)} ETH`
                : `Harga Awal: ${formatEther(startingBid)} ETH`}
            </span>
            <p className="ml-auto text-xs font-semibold">{timeLeft}</p>
          </div>
        )}
        {currentStatus === ProposalStatus.Finished && (
          <div className="flex items-center text-muted-foreground text-sm">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>
              {highestBid > 0n ? `Harga Akhir: ${formatEther(highestBid)} ETH` : "Tidak Terjual (Tidak ada penawar)"}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href={`/admin/requests/${proposalId.toString()}`}>
              Lihat Detail
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
