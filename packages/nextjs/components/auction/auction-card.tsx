"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleDotDashed, Clock, User, XCircle } from "lucide-react";
import { formatEther } from "viem";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { CategoryBadge } from "~~/utils/CategoryBadge";
import { shortenAddress } from "~~/utils/addressFormat";

// Enum untuk status proposal, digunakan untuk kejelasan kode
enum ProposalStatus {
  Pending,
  Rejected,
  Live,
  Finished,
}

// Tipe untuk props, hanya menerima satu objek 'auction' dari halaman induk
type AuctionCardProps = {
  auction: {
    proposalId: bigint;
    proposer: string;
    assetName: string;
    imageUrl: string;
    category: string;
    startingBid: bigint;
    highestBid: bigint;
    status: ProposalStatus;
    auctionAddress: string;
    endTime: bigint;
  };
};

export const AuctionCard = ({ auction }: AuctionCardProps) => {
  // State hanya untuk timer, karena ini adalah satu-satunya hal yang berubah di sisi klien
  const [timeLeft, setTimeLeft] = useState("");
  const isFinished = auction.status === ProposalStatus.Finished;

  // useEffect HANYA untuk timer, bukan untuk mengambil data
  useEffect(() => {
    if (isFinished || auction.status !== ProposalStatus.Live) {
      if (isFinished) setTimeLeft("Lelang Selesai");
      return;
    }

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Number(auction.endTime) - now;

      if (remaining <= 0) {
        setTimeLeft("Lelang Selesai");
        clearInterval(interval);
        return;
      }

      const d = Math.floor(remaining / 86400);
      const h = Math.floor((remaining % 86400) / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;
      setTimeLeft(`${d}h ${h}j ${m}m ${s}d`);
    }, 1000);

    return () => clearInterval(interval);
  }, [auction.endTime, auction.status, isFinished]);

  // Logic harga yang ditampilkan berdasarkan kondisi auction
  const getDisplayPrice = () => {
    // Jika ada yang sudah bid (highestBid > 0), tampilkan highestBid
    if (auction.highestBid > 0n) {
      return auction.highestBid;
    }
    // Jika belum ada yang bid, tampilkan startingBid
    return auction.startingBid;
  };

  const displayPrice = getDisplayPrice();
  const linkToDetails = `/auctions/${auction.auctionAddress}`;

  const getStatusBadge = () => {
    if (auction.status === ProposalStatus.Live) {
      return (
        <Badge className="absolute top-3 left-3 bg-green-100 text-green-800 border-green-300">
          <CircleDotDashed className="w-3 h-3 mr-1" /> Live
        </Badge>
      );
    }
    if (auction.status === ProposalStatus.Finished) {
      return (
        <Badge variant="secondary" className="absolute top-3 left-3">
          <XCircle className="w-3 h-3 mr-1" /> Selesai
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Link href={linkToDetails} passHref>
        <div className="relative">
          <Image
            src={auction.imageUrl}
            alt={auction.assetName}
            width={400}
            height={300}
            className="w-full h-48 object-cover"
          />
          {getStatusBadge()}
          <div className="absolute top-3 right-3">
            <CategoryBadge category={auction.category} />
          </div>
        </div>
      </Link>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground truncate" title={auction.assetName}>
          {auction.assetName}
        </CardTitle>
        <CardDescription className="text-sm flex items-center" title={auction.proposer}>
          <User className="w-4 h-4 mr-1.5" />
          <span>Oleh: {shortenAddress(auction.proposer)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex-grow">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              {isFinished
                ? auction.highestBid > 0n
                  ? "Harga Akhir"
                  : "Tidak Terjual"
                : auction.highestBid > 0n
                  ? "Tawaran Tertinggi"
                  : "Harga Awal"}
            </p>
            <p className="text-2xl font-bold text-primary">{formatEther(displayPrice)} IDRX</p>
          </div>
          <div className="text-right">
            {!isFinished && (
              <>
                <p className="text-sm text-muted-foreground">Sisa Waktu</p>
                <p className="text-lg font-semibold flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {timeLeft || "Memuat..."}
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button asChild className="w-full" disabled={isFinished}>
          <Link href={linkToDetails}>
            {isFinished ? "Lelang Selesai" : "Lihat Lelang"}
            {!isFinished && <ArrowRight className="ml-2 h-4 w-4" />}
          </Link>
        </Button>
      </div>
    </Card>
  );
};
