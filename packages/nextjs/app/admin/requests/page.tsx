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

/**
 * @title Admin Auction Requests Management Page
 * @dev Main administrative interface for managing auction proposals
 * @notice This component provides:
 *   - Tabbed view for different proposal statuses (Pending, Rejected, Approved)
 *   - Pagination for large sets of proposals
 *   - Admin role verification and access control
 *   - Real-time proposal data fetching from smart contract
 * @notice Only users with admin role can perform administrative actions
 */

/**
 * @dev Enum representing the different states of auction proposals
 * @notice Matches the ProposalStatus enum from the AuctionFactory smart contract
 */
enum ProposalStatus {
  Pending, // Proposal submitted, awaiting admin review
  Rejected, // Proposal rejected by admin with reason
  Live, // Proposal approved, auction is currently active
  Finished, // Auction completed successfully
}

export default function AuctionRequestsPage() {
  // ============ Wallet and Authentication ============

  /**
   * @dev Current connected wallet address and connection status
   * @notice Used for admin role verification and contract interactions
   */
  const { address: connectedAddress, isConnected } = useAccount();

  /**
   * @dev Wallet client for contract write operations
   * @notice Required for interacting with smart contracts
   */
  const { data: walletClient } = useWalletClient();

  // ============ Component State Management ============

  /**
   * @dev Admin role state - determines if user has administrative privileges
   * @notice Set to true if connected address has DEFAULT_ADMIN_ROLE in AuctionFactory
   */
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * @dev Array storing all proposals fetched from the smart contract
   * @notice Each proposal contains: {id: bigint, data: [proposer, metadataURI, startingBid, duration, status, auctionAddress]}
   */
  const [allProposals, setAllProposals] = useState<any[]>([]);

  /**
   * @dev Loading state for initial data fetch
   * @notice Shows loading spinner while fetching proposals from blockchain
   */
  const [isLoading, setIsLoading] = useState(true);

  // ============ Contract Instance ============

  /**
   * @dev AuctionFactory contract instance for proposal management
   * @notice Used to fetch proposals, check admin roles, and get proposal counts
   */
  const { data: auctionFactoryContract } = useScaffoldContract({
    contractName: "AuctionFactory",
    walletClient,
  });

  // ============ UI State for Filtering and Pagination ============

  /**
   * @dev Current active tab for filtering proposals by status
   * @notice Controls which proposals are displayed: pending, rejected, or approved
   */
  const [activeTab, setActiveTab] = useState<"pending" | "rejected" | "approved">("pending");

  /**
   * @dev Number of items to display per page
   * @notice User can select 6, 12, or 24 items per page
   */
  const [itemsPerPage, setItemsPerPage] = useState(6);

  /**
   * @dev Current page number for pagination
   * @notice Resets to 1 when tab or items per page changes
   */
  const [currentPage, setCurrentPage] = useState(1);

  // ============ Data Fetching and Initialization ============

  /**
   * @dev Effect hook to fetch proposals and verify admin role
   * @notice Runs when contract instance, connected address, or connection status changes
   * @notice Fetches all proposals from smart contract and checks admin permissions
   */
  useEffect(() => {
    const fetchData = async () => {
      if (auctionFactoryContract && connectedAddress) {
        try {
          // Check if connected user has admin role
          const adminRole = "0x0000000000000000000000000000000000000000000000000000000000000000";
          const hasAdminRole = await auctionFactoryContract.read.hasRole([adminRole, connectedAddress]);
          setIsAdmin(hasAdminRole);

          // Fetch total number of proposals
          const count = await auctionFactoryContract.read.getProposalsCount();

          // Fetch all proposal data from smart contract
          const proposalsData = [];
          for (let i = 0n; i < count; i++) {
            const proposal = await auctionFactoryContract.read.proposals([i]);
            proposalsData.push({ id: i, data: proposal });
          }
          setAllProposals(proposalsData);
        } catch (error) {
          // Silent error handling - let UI components handle display of empty state
          void error;
        } finally {
          setIsLoading(false);
        }
      } else if (!isConnected) {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [auctionFactoryContract, connectedAddress, isConnected]);

  // ============ Data Processing and Filtering ============

  /**
   * @dev Memoized filtered proposals based on active tab selection
   * @notice Filters proposals by status: pending, rejected, or approved (live + finished)
   * @returns Array of proposals matching the selected status filter
   */
  const filteredRequests = useMemo(() => {
    // Map tab names to corresponding proposal statuses
    const statusMap = {
      pending: ProposalStatus.Pending,
      rejected: ProposalStatus.Rejected,
      approved: [ProposalStatus.Live, ProposalStatus.Finished], // Both live and finished auctions
    };

    const targetStatus = statusMap[activeTab];

    return allProposals.filter(proposal => {
      const status = proposal.data[4]; // Status is at index 4 in proposal struct
      if (Array.isArray(targetStatus)) {
        return targetStatus.includes(status);
      }
      return status === targetStatus;
    });
  }, [allProposals, activeTab]);

  // ============ Pagination Logic ============

  /**
   * @dev Calculate pagination values based on filtered results
   * @notice Determines total pages, current page items, and pagination boundaries
   */
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  /**
   * @dev Reset current page when tab or items per page changes
   * @notice Prevents pagination issues when switching between tabs with different item counts
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, itemsPerPage]);

  /**
   * @dev Callback function for pagination navigation
   * @param pageNumber Target page number to navigate to
   * @notice Updates current page state for pagination
   */
  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  // ============ Loading State ============

  /**
   * @dev Display loading spinner while fetching data from blockchain
   * @notice Shows centered loading message during initial data fetch
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">Loading auction requests...</p>
      </div>
    );
  }

  // ============ Main Component Render ============

  return (
    <ConnectWalletGuard pageName="Admin Requests">
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Page header with title and admin badge */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Auction Requests {isAdmin && <Badge variant="destructive">Admin View</Badge>}
          </h1>
          <p className="text-muted-foreground">Review and manage auction submissions from customers.</p>
        </div>

        {/* Main tabs component for status filtering */}
        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as "pending" | "rejected" | "approved")}>
          {/* Tab controls and pagination settings */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            {/* Status filter tabs */}
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>

            {/* Items per page selector */}
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

          {/* Content area - either proposals grid or empty state */}
          {filteredRequests.length === 0 ? (
            /* Empty state when no proposals match current filter */
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">No Auction Requests</AlertTitle>
              <AlertDescription className="text-blue-700">
                There are no {activeTab} auction requests at the moment.
              </AlertDescription>
            </Alert>
          ) : (
            /* Responsive grid of proposal cards */
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

        {/* Pagination controls - only shown when multiple pages exist */}
        {totalPages > 1 && (
          <Pagination className="mt-10">
            <PaginationContent>
              {/* Previous page button */}
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

              {/* Page number buttons */}
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

              {/* Next page button */}
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
