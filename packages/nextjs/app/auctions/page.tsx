"use client";

import { useMemo, useState } from "react";
import { formatEther } from "viem";
import { AuctionFiltersSidebar } from "~~/components/auction/auction-filters-sidebar";
import { AuctionListGrid } from "~~/components/auction/auction-list-grid";
import { DesktopFilters } from "~~/components/auction/desktop-filters";
import { SidebarProvider } from "~~/components/ui/sidebar";
import { useAuctions } from "~~/hooks/useAuction";
import { categoryConfig } from "~~/lib/categoryConfig";

// 1. Impor hook utama

const AuctionsPage = () => {
  // 2. Panggil hook useAuctions untuk mendapatkan semua data lelang
  const { auctions: allAuctions, isLoading } = useAuctions();

  // State untuk filter tetap ada di sini untuk mengontrol UI
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Mengambil daftar kategori statis dari file konfigurasi
  const uniqueCategories = useMemo(() => {
    const allCategoryKeys = Object.keys(categoryConfig);
    const categories = allCategoryKeys.filter(key => key !== "Default");
    return ["all", ...categories];
  }, []);

  // Logika untuk memfilter lelang berdasarkan state filter
  const filteredAuctions = useMemo(() => {
    return allAuctions.filter(auction => {
      // Filter berdasarkan status
      if (filterStatus === "open" && auction.status !== 2 /* Live */) return false;
      if (filterStatus === "closed" && auction.status !== 3 /* Finished */) return false;

      // Filter berdasarkan kategori
      if (filterCategory !== "all" && auction.category !== filterCategory) return false;

      // Filter berdasarkan harga
      const price = parseFloat(formatEther(auction.highestBid > 0n ? auction.highestBid : auction.startingBid));
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;

      return true;
    });
  }, [allAuctions, filterStatus, filterCategory, minPrice, maxPrice]);

  // Fungsi untuk mereset semua filter
  const onResetFilters = () => {
    setFilterStatus("all");
    setFilterCategory("all");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <SidebarProvider>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Daftar Lelang</h1>
          <p className="text-lg text-base-content/70 mt-2">
            Temukan dan ajukan penawaran untuk aset yang Anda inginkan.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <AuctionFiltersSidebar
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            onResetFilters={onResetFilters}
            uniqueCategories={uniqueCategories}
          />
          <DesktopFilters
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            onResetFilters={onResetFilters}
            uniqueCategories={uniqueCategories}
          />

          <div className="flex-1">
            {/* 3. Gunakan isLoading dari hook untuk menampilkan status memuat */}
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              // 4. Kirim data yang sudah difilter ke komponen grid
              <AuctionListGrid auctions={filteredAuctions} />
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AuctionsPage;
