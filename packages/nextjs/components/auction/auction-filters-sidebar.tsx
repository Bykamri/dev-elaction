"use client";

// PERBAIKAN: useMemo dan mockAuctions tidak lagi diperlukan
import { Button } from "~~/components/ui/button";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from "~~/components/ui/sidebar";
import { useIsMobile } from "~~/hooks/use-mobile";

type AuctionFiltersSidebarProps = {
  filterStatus: "all" | "open" | "closed";
  setFilterStatus: (status: "all" | "open" | "closed") => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  onResetFilters: () => void;
  // PERBAIKAN: Terima daftar kategori unik sebagai prop
  uniqueCategories: string[];
};

export function AuctionFiltersSidebar({
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onResetFilters,
  uniqueCategories, // PERBAIKAN: Ambil prop di sini
}: AuctionFiltersSidebarProps) {
  const isMobile = useIsMobile();

  // PERBAIKAN: Logika untuk mendapatkan kategori unik dari mockAuctions telah dihapus.

  if (!isMobile) {
    return null;
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <h3 className="text-lg font-semibold">Filter Lelang</h3>
      </SidebarHeader>
      <SidebarContent className="p-4">
        {/* Filter Status */}
        <SidebarGroup>
          <SidebarGroupLabel>Status Lelang</SidebarGroupLabel>
          <SidebarGroupContent>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="open">Terbuka</SelectItem>
                <SelectItem value="closed">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        {/* Filter Kategori */}
        <SidebarGroup>
          <SidebarGroupLabel>Kategori Barang</SidebarGroupLabel>
          <SidebarGroupContent>
            <Select value={filterCategory} onValue-change={setFilterCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {/* Gunakan 'uniqueCategories' dari props */}
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "Semua Kategori" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        {/* Filter Harga */}
        <SidebarGroup>
          <SidebarGroupLabel>Rentang Harga (ETH)</SidebarGroupLabel>
          <SidebarGroupContent className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="min-price" className="sr-only">
                Harga Min
              </Label>
              <Input
                id="min-price"
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="max-price" className="sr-only">
                Harga Max
              </Label>
              <Input
                id="max-price"
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-4 border-t">
        <Button onClick={onResetFilters} className="w-full">
          Reset Filter
        </Button>
      </div>
    </Sidebar>
  );
}
