"use client";

import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/ui/select";

// Hapus impor categoryConfig

type DesktopFiltersProps = {
  filterStatus: "all" | "open" | "closed";
  setFilterStatus: (status: "all" | "open" | "closed") => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  onResetFilters: () => void;
  uniqueCategories: string[];
};

export function DesktopFilters({
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onResetFilters,
  uniqueCategories,
}: DesktopFiltersProps) {
  return (
    <div className="hidden md:flex flex-col sticky top-16 w-[280px] h-[calc(100vh-5.5rem)] overflow-y-auto z-10">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filter Lelang</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Filter Status Lelang */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="status-filter">Status Lelang</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="open">Terbuka</SelectItem>
                <SelectItem value="closed">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Filter Kategori Barang */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="category-filter">Kategori Barang</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger id="category-filter" className="w-full">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {/* Kembalikan ke logika sederhana tanpa ikon */}
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "Semua Kategori" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Filter Rentang Harga */}
          <div className="flex flex-col gap-2">
            <Label>Rentang Harga (ETH)</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              <Input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button onClick={onResetFilters} variant="outline" className="w-full bg-transparent">
            Reset Filter
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
