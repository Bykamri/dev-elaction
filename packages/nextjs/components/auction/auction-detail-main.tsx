"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Clock, DollarSign, Gavel, History, Info, User, Users } from "lucide-react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { Separator } from "~~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { categoryConfig } from "~~/lib/categoryConfig";

// Tipe data untuk riwayat penawaran
type Bid = {
  bidder: string;
  amount: bigint;
};

// Interface props yang diterima dari hook useAuctionDetails
interface AuctionDetailMainProps {
  auction: any;
  allowance: bigint;
  timeLeft: string;
  isFinished: boolean;
  isActionLoading: boolean;
  isRefetching: boolean;
  buttonText: string;
  onApprove: (amount: string) => void;
  onBid: (amount: string) => void;
}

export function AuctionDetailMain({
  auction,
  allowance,
  timeLeft,
  isFinished,
  isActionLoading,
  isRefetching,
  buttonText,
  onApprove,
  onBid,
}: AuctionDetailMainProps) {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();

  // State lokal hanya untuk input field pengguna
  const [bidAmount, setBidAmount] = useState<string>("");

  // Handler internal yang memanggil fungsi dari props
  const handleApproveClick = () => {
    onApprove(bidAmount);
  };

  const handleBidClick = () => {
    onBid(bidAmount);
  };

  // Variabel bantuan untuk mempermudah render JSX
  const metadata = auction.metadata;
  const biddingHistory: Bid[] = auction.bidHistory || [];
  const categoryInfo = categoryConfig[metadata.category] || categoryConfig["Default"];
  const IconComponent = categoryInfo.icon;
  const top5BiddingHistory = biddingHistory.slice(0, 5);
  const mainImage = metadata.image || "/placeholder.svg";

  // Logic harga yang ditampilkan berdasarkan kondisi auction:
  // - Jika ada yang sudah bid (highestBid > 0), tampilkan highestBid
  // - Jika belum ada yang bid, tampilkan startingBid
  // - Logic ini berlaku baik untuk auction aktif maupun yang sudah selesai
  const displayBidAmount = auction.highestBid > 0n ? auction.highestBid : auction.startingBid;

  const bidInWei = parseEther(bidAmount || "0");

  // Logika kunci: Tentukan apakah tombol "Approve" perlu ditampilkan
  // Tombol ini muncul jika pengguna terhubung, jumlah tawaran > 0, dan jumlah tawaran > allowance saat ini
  const needsApproval = connectedAddress && bidInWei > 0n && bidInWei > allowance;

  return (
    <>
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/auctions")} className="flex items-center">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Kembali ke Daftar Lelang
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div className="relative w-full h-[450px] md:h-[550px]">
              <Image src={mainImage} alt={metadata.name} layout="fill" objectFit="cover" className="rounded-lg" />
            </div>
          </Card>
          {metadata.images && metadata.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {metadata.images.slice(0, 4).map((url: string, index: number) => (
                <div key={index} className="relative w-full h-24 cursor-pointer">
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`${metadata.name} thumbnail ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md border-2 border-transparent hover:border-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-1 space-y-6">
          <Card className="relative">
            {isRefetching && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
                <span className="loading loading-spinner"></span>
                <p className="ml-2">Memperbarui...</p>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">{metadata.name}</h1>
                <Badge className={categoryInfo.className}>
                  <IconComponent className="w-4 h-4 mr-1" />
                  {metadata.category}
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground text-base">{metadata.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{auction.participantCount} Peserta</span>
                </div>
                <Badge className={!isFinished ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {!isFinished ? "Live" : "Ditutup"}
                </Badge>
              </div>
              <Separator />
              {!isFinished ? (
                <div className="space-y-4">
                  <p className="text-lg text-muted-foreground">
                    {isFinished ? (auction.highestBid > 0n ? "Harga Akhir" : "Tidak Terjual") : "Tawaran Saat Ini"}
                  </p>
                  <p className="text-5xl font-bold text-primary">{formatEther(displayBidAmount)} IDRX</p>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-6 h-6 mr-2" />
                    <span className="text-xl font-semibold">
                      {isFinished ? "Lelang Selesai" : `${timeLeft} tersisa`}
                    </span>
                  </div>
                  {!isFinished && (
                    <div className="space-y-2 mt-6">
                      <Label htmlFor="bid-amount" className="text-lg font-medium">
                        Tempatkan Tawaran Anda
                      </Label>
                      <div className="flex flex-col gap-2">
                        <Input
                          id="bid-amount"
                          type="number"
                          placeholder={`Lebih dari ${formatEther(displayBidAmount)} IDRX`}
                          value={bidAmount}
                          onChange={e => setBidAmount(e.target.value)}
                          disabled={isActionLoading}
                        />
                        {needsApproval ? (
                          <Button onClick={handleApproveClick} disabled={isActionLoading || !bidAmount}>
                            {isActionLoading ? (
                              buttonText
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Approve IDRX
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleBidClick}
                            disabled={isActionLoading || !bidAmount || parseEther(bidAmount) <= displayBidAmount}
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                          >
                            {isActionLoading ? (
                              buttonText
                            ) : (
                              <>
                                <Gavel className="w-4 h-4 mr-2" /> Tawar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  {top5BiddingHistory.length > 0 && (
                    <div className="mt-6 space-y-3 border-t pt-4">
                      <h3 className="text-lg font-semibold text-foreground">Tawaran Terbaru</h3>
                      <ul className="space-y-2">
                        {top5BiddingHistory.map((bid: Bid, index: number) => (
                          <li key={index} className="flex items-center justify-between text-muted-foreground text-sm">
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              <span>{bid.bidder.substring(0, 8)}...</span>
                            </div>
                            <div className="font-semibold text-foreground">{formatEther(bid.amount)} IDRX</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {auction.highestBid > 0n ? (
                    <>
                      <p className="text-lg text-muted-foreground">Tawaran Akhir</p>
                      <p className="text-5xl font-bold text-primary">{formatEther(auction.highestBid)} IDRX</p>
                      <div className="flex items-center text-muted-foreground">
                        <User className="w-6 h-6 mr-2" />
                        <span className="text-xl font-semibold">
                          Pemenang: {auction.highestBidder.substring(0, 8)}...
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-lg text-muted-foreground">Status Lelang</p>
                      <p className="text-3xl font-bold text-gray-500">Tidak Terjual</p>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-6 h-6 mr-2" />
                        <span className="text-xl font-semibold">Tidak ada penawar</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">
              <Info className="w-4 h-4 mr-2" /> Deskripsi
            </TabsTrigger>
            <TabsTrigger value="bidding-history">
              <History className="w-4 h-4 mr-2" /> Riwayat Penawaran
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Deskripsi Barang</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{metadata.description}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bidding-history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Semua Riwayat Penawaran</CardTitle>
              </CardHeader>
              <CardContent>
                {biddingHistory.length > 0 ? (
                  <ul className="space-y-3">
                    {biddingHistory.map((bid: Bid, index: number) => (
                      <li key={index} className="flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>{bid.bidder.substring(0, 8)}...</span>
                        </div>
                        <div className="flex items-center font-semibold text-foreground">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatEther(bid.amount)} IDRX
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Belum ada riwayat penawaran.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
