"use client";

// --- PERBAIKAN: Import hook useRef dan ikon panah ---
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { formatEther } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/ui/dialog";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { Separator } from "~~/components/ui/separator";
import { Textarea } from "~~/components/ui/textarea";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useProposalData } from "~~/hooks/useProposalData";
import { CategoryBadge } from "~~/utils/CategoryBadge";

enum ProposalStatus {
  Pending,
  Rejected,
  Live,
  Finished,
}

export default function AuctionRequestDetailPage() {
  const router = useRouter();
  const { id: proposalId } = useParams<{ id: string }>();
  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [isAdmin, setIsAdmin] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [commission, setCommission] = useState<number | string>("");

  // Determine if we're running on localhost
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const { data: auctionFactoryContract } = useScaffoldContract({
    contractName: "AuctionFactory",
    walletClient,
  });

  // Get IDRX contract for localhost
  const { data: idrxContract } = useScaffoldContract({
    contractName: "MockIDRX",
  });

  // IDRX Token Address - use scaffold contract for localhost, hardcoded for deployment
  const DEPLOYED_IDRX_ADDRESS = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661";
  const IDRX_TOKEN_ADDRESS = isLocalhost ? idrxContract?.address : DEPLOYED_IDRX_ADDRESS;

  const { proposal, assetName, description, images, categories, isLoading } = useProposalData(
    BigInt(proposalId),
    auctionFactoryContract,
  );

  const [selectedImage, setSelectedImage] = useState<string>("");

  // --- PERBAIKAN: Buat ref untuk kontainer scroll ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (auctionFactoryContract && connectedAddress) {
        try {
          const adminRole = "0x0000000000000000000000000000000000000000000000000000000000000000";
          const hasAdminRole = await auctionFactoryContract.read.hasRole([adminRole, connectedAddress]);
          setIsAdmin(hasAdminRole);
        } catch (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        }
      }
    };
    checkAdminRole();
  }, [auctionFactoryContract, connectedAddress]);

  const { writeContractAsync: launchAuction, isPending: isApproving } = useScaffoldWriteContract({
    contractName: "AuctionFactory",
  });
  const { writeContractAsync: rejectProposal, isPending: isRejecting } = useScaffoldWriteContract({
    contractName: "AuctionFactory",
  });

  const handleApprove = async () => {
    if (!isAdmin) {
      alert("Hanya admin yang dapat menyetujui proposal.");
      return;
    }
    const parsedCommission = typeof commission === "string" ? parseFloat(commission) : commission;
    if (isNaN(parsedCommission) || parsedCommission < 0 || parsedCommission > 100) {
      alert("Input komisi tidak valid. Harus antara 0 dan 100.");
      return;
    }
    if (!IDRX_TOKEN_ADDRESS) {
      alert("Alamat token pembayaran (ETH) belum tersedia. Pastikan kontrak sudah ter-deploy dengan benar.");
      return;
    }

    const commissionInBps = BigInt(Math.round(parsedCommission * 100));

    try {
      await launchAuction({
        functionName: "reviewAndLaunchAuction",
        args: [BigInt(proposalId), IDRX_TOKEN_ADDRESS, commissionInBps],
      });
      alert("Proposal berhasil disetujui dan lelang telah diluncurkan!");
      router.push("/admin/requests");
    } catch (e) {
      console.error("Gagal menyetujui proposal:", e);
    }
  };

  const handleReject = async () => {
    if (!isAdmin) {
      alert("Hanya admin yang dapat menolak proposal.");
      return;
    }
    if (!rejectReason.trim()) {
      alert("Alasan penolakan tidak boleh kosong.");
      return;
    }
    try {
      await rejectProposal({
        functionName: "rejectProposal",
        args: [BigInt(proposalId)],
      });
      alert("Proposal telah ditolak.");
      setIsRejectDialogOpen(false);
      router.push("/admin/requests");
    } catch (e) {
      console.error("Gagal menolak proposal:", e);
    }
  };

  // --- PERBAIKAN: Buat fungsi untuk mengontrol scroll ---
  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200; // Jumlah pixel untuk scroll
      if (direction === "left") {
        scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  if (isLoading) return <div className="container mx-auto p-8 text-center">Memuat detail proposal...</div>;
  if (!proposal || !categories)
    return <div className="container mx-auto p-8 text-center">Proposal tidak ditemukan atau data tidak lengkap.</div>;

  const currentStatus: ProposalStatus = proposal[4];
  const sellerAddress = proposal[0];
  const startingBid = proposal[2];
  const category = categories || "Default";

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/requests")} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar
        </Button>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">✓ Admin Access</div>
          ) : (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">⚠️ View Only</div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div className="relative w-full h-[450px] md:h-[550px]">
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt={assetName}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          </Card>
          {/* --- PERBAIKAN: Ubah galeri thumbnail menjadi carousel --- */}
          {images.length > 1 && (
            <div className="relative">
              {/* Tombol Scroll Kiri */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 -translate-y-1/2 left-0 z-10 h-10 w-10 rounded-full"
                onClick={() => handleScroll("left")}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              {/* Kontainer Gambar yang Bisa Di-scroll */}
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto space-x-2 p-2 scroll-smooth"
                style={{ scrollbarWidth: "none" }} // Sembunyikan scrollbar untuk Firefox
              >
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 flex-shrink-0 cursor-pointer" // `flex-shrink-0` penting!
                    onClick={() => setSelectedImage(url)}
                  >
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={`${assetName} thumbnail ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      className={`rounded-md transition-all ${
                        selectedImage === url ? "border-2 border-primary" : "opacity-60 hover:opacity-100"
                      }`}
                    />
                  </div>
                ))}
              </div>
              {/* Tombol Scroll Kanan */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 -translate-y-1/2 right-0 z-10 h-10 w-10 rounded-full"
                onClick={() => handleScroll("right")}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">{assetName}</h1>
                <CategoryBadge category={category} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Informasi Permintaan</p>
                <ul className="list-none pl-0 text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Diajukan oleh:</strong> <span className="truncate block">{sellerAddress}</span>
                  </li>
                  <li>
                    <strong>Tawaran Awal:</strong> {formatEther(startingBid)} ETH
                  </li>
                </ul>
              </div>

              {currentStatus === ProposalStatus.Pending && (
                <div className="flex flex-col gap-2 mt-6 pt-4 border-t">
                  <h3 className="text-lg font-semibold text-foreground">Tindakan Admin</h3>
                  {!isAdmin && (
                    <div className="text-sm text-muted-foreground mb-2">
                      ⚠️ Hanya admin yang dapat melakukan tindakan ini
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="commission">Komisi (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      placeholder="e.g., 5"
                      value={commission}
                      onChange={e => setCommission(e.target.value)}
                      min="0"
                      max="100"
                      step="0.1"
                      disabled={isApproving || isRejecting || !isAdmin}
                    />
                  </div>
                  <Button
                    onClick={handleApprove}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isApproving || isRejecting || !isAdmin}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isApproving ? "Menyetujui..." : "Setujui & Luncurkan Lelang"}
                  </Button>
                  <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={isApproving || isRejecting || !isAdmin}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Tolak Permintaan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tolak Permintaan Lelang</DialogTitle>
                        <DialogDescription>
                          Berikan alasan penolakan untuk lelang &quot;{assetName}&quot;.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Textarea
                          id="reason"
                          placeholder="Masukkan alasan penolakan..."
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          disabled={!isAdmin}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button onClick={handleReject} disabled={isRejecting || !isAdmin}>
                          {isRejecting ? "Menolak..." : "Tolak"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              {currentStatus === ProposalStatus.Live && (
                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-lg font-semibold text-green-600 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" /> Lelang Telah Aktif
                  </p>
                </div>
              )}
              {currentStatus === ProposalStatus.Rejected && (
                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-lg font-semibold text-red-600 flex items-center justify-center">
                    <XCircle className="w-5 h-5 mr-2" /> Lelang Ditolak
                  </p>
                </div>
              )}
              {currentStatus === ProposalStatus.Finished && (
                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-lg font-semibold text-gray-600 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" /> Lelang Telah Selesai
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Deskripsi Barang</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
