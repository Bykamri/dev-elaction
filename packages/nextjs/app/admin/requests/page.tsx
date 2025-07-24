"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { useAccount, useWalletClient } from "wagmi";
import { AuctionRequestCard } from "~~/components/admin/auction-request-card";
import { ConnectWalletGuard } from "~~/components/auth/ConnectWalletGuard";
import { Alert, AlertDescription, AlertTitle } from "~~/components/ui/alert";
import { Badge } from "~~/components/ui/badge";
import { Label } from "~~/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~~/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

enum ProposalStatus {
  Pending,
  Rejected,
  Live,
  Finished,
}

export default function AuctionRequestsPage() {
  const { address: connectedAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [isAdmin, setIsAdmin] = useState(false);
  const [allProposals, setAllProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: auctionFactoryContract } = useScaffoldContract({
    contractName: "AuctionFactory",
    walletClient,
  });

  const [activeTab, setActiveTab] = useState<"pending" | "rejected" | "approved">("pending");
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (auctionFactoryContract && connectedAddress) {
        try {
          // 1. Admin role checking is still performed
          const adminRole = "0x0000000000000000000000000000000000000000000000000000000000000000";
          const hasAdminRole = await auctionFactoryContract.read.hasRole([adminRole, connectedAddress]);
          setIsAdmin(hasAdminRole);

          // 2. Proposal data fetching logic now runs for all roles
          const count = await auctionFactoryContract.read.getProposalsCount();

          const proposalsData = [];
          for (let i = 0n; i < count; i++) {
            const proposal = await auctionFactoryContract.read.proposals([i]);
            proposalsData.push({ id: i, data: proposal });
          }
          setAllProposals(proposalsData);
        } catch (error) {
          console.error("Gagal mengambil data:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (!isConnected) {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [auctionFactoryContract, connectedAddress, isConnected]);

  const filteredRequests = useMemo(() => {
    const statusMap = {
      pending: ProposalStatus.Pending,
      rejected: ProposalStatus.Rejected,
      approved: [ProposalStatus.Live, ProposalStatus.Finished],
    };

    const targetStatus = statusMap[activeTab];

    return allProposals.filter(proposal => {
      const status = proposal.data[4];
      if (Array.isArray(targetStatus)) {
        return targetStatus.includes(status);
      }
      return status === targetStatus;
    });
  }, [allProposals, activeTab]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, itemsPerPage]);

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">Loading auction requests...</p>
      </div>
    );
  }

  return (
    <ConnectWalletGuard pageName="Admin Requests">
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Auction Requests {isAdmin && <Badge variant="destructive">Admin View</Badge>}
          </h1>
          <p className="text-muted-foreground">Review and manage auction submissions from customers.</p>
        </div>

        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as "pending" | "rejected" | "approved")}>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Label htmlFor="items-per-page" className="text-sm text-muted-foreground">
                Items per page:
              </Label>
              <Select value={String(itemsPerPage)} onValueChange={value => setItemsPerPage(Number(value))}>
                <SelectTrigger id="items-per-page" className="w-[80px]">
                  <SelectValue placeholder="6" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">No Auction Requests</AlertTitle>
              <AlertDescription className="text-blue-700">
                There are no {activeTab} auction requests at the moment.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {currentItems.map(proposal => (
                <AuctionRequestCard
                  key={proposal.id.toString()}
                  proposalId={proposal.id}
                  auctionFactoryContract={auctionFactoryContract}
                />
              ))}
            </div>
          )}
        </Tabs>

        {totalPages > 1 && (
          <Pagination className="mt-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    paginate(currentPage - 1);
                  }}
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : undefined}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                />
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
                <PaginationNext
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    paginate(currentPage + 1);
                  }}
                  aria-disabled={currentPage === totalPages}
                  tabIndex={currentPage === totalPages ? -1 : undefined}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </ConnectWalletGuard>
  );
}
