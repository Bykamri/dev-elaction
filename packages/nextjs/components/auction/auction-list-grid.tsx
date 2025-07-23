"use client";

import { useState } from "react";
import { AuctionCard } from "~~/components/auction/auction-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~~/components/ui/pagination";

// 1. Tipe props diubah untuk menerima array lelang yang sudah jadi.
type AuctionListGridProps = {
  auctions: any[];
};

export const AuctionListGrid = ({ auctions }: AuctionListGridProps) => {
  // State untuk paginasi tetap ada, tetapi state untuk data lelang dihapus.
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Kalkulasi paginasi sekarang didasarkan pada panjang array 'auctions' yang diterima.
  const totalPages = Math.ceil(auctions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAuctions = auctions.slice(indexOfFirstItem, indexOfLastItem);

  // Fungsi handler untuk paginasi tetap sama.
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePrevious = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    paginate(currentPage - 1);
  };

  const handleNext = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    paginate(currentPage + 1);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Menampilkan pesan jika tidak ada lelang yang cocok dengan filter.
  if (auctions.length === 0) {
    return <div className="text-center col-span-full py-20">Tidak ada lelang yang sesuai dengan filter Anda.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
        {currentAuctions.map(auction => (
          <AuctionCard key={auction.proposalId} auction={auction} />
        ))}
      </div>

      {/* Tampilkan kontrol paginasi jika total halaman lebih dari 1 */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm font-medium whitespace-nowrap">
              Item per Halaman:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="p-2 border rounded-md bg-base-100 text-base-content"
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
            </select>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={handlePrevious} aria-disabled={currentPage === 1} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={e => {
                      e.preventDefault();
                      paginate(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={handleNext} aria-disabled={currentPage === totalPages} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};
