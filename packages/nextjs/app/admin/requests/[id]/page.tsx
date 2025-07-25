"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { formatEther } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectWalletGuard } from "~~/components/auth/ConnectWalletGuard";
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
import { dynamicAssetFields } from "~~/lib/asset-configs";
import { CategoryBadge } from "~~/utils/CategoryBadge";
import { notification } from "~~/utils/scaffold-eth/notification";

/**
 * @title Auction Request Detail Page Component
 * @dev Detailed view and management interface for individual auction proposals
 * @notice This page allows admins to:
 *   - View detailed proposal information including images, description, and metadata
 *   - Approve proposals and launch auctions with custom commission rates
 *   - Reject proposals with detailed reasoning
 *   - Navigate through multiple proposal images
 * @notice Regular users can view proposals but cannot perform admin actions
 */

/**
 * @dev Enum representing the different states of an auction proposal
 * @notice Matches the ProposalStatus enum from the smart contract
 */
enum ProposalStatus {
  Pending, // Proposal submitted, awaiting review
  Rejected, // Proposal rejected by admin
  Live, // Proposal approved, auction is active
  Finished, // Auction completed
}

export default function AuctionRequestDetailPage() {
  // ============ Navigation and Routing ============

  /**
   * @dev Router instance for programmatic navigation
   * @notice Used to navigate back to requests list and redirect after actions
   */
  const router = useRouter();

  /**
   * @dev Extract proposal ID from URL parameters
   * @notice This ID corresponds to the proposal index in the smart contract
   */
  const { id: proposalId } = useParams<{ id: string }>();

  /**
   * @dev Current connected wallet address
   * @notice Used for admin role checking and transaction signing
   */
  const { address: connectedAddress } = useAccount();

  /**
   * @dev Wallet client for contract interactions
   * @notice Required for writing to smart contracts
   */
  const { data: walletClient } = useWalletClient();

  // ============ Component State Management ============

  /**
   * @dev Admin role state - determines if user can perform admin actions
   * @notice Set to true if connected address has DEFAULT_ADMIN_ROLE in contract
   */
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * @dev Rejection reason text for proposal rejection
   * @notice Used in the rejection dialog to provide feedback to proposer
   */
  const [rejectReason, setRejectReason] = useState("");

  /**
   * @dev State for controlling the rejection confirmation dialog
   * @notice Prevents accidental rejections by requiring confirmation
   */
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  /**
   * @dev Commission percentage for approved auctions
   * @notice Admin can set custom commission rates (0-100%) for each auction
   */
  const [commission, setCommission] = useState<number | string>("");

  // ============ Network and Contract Configuration ============

  /**
   * @dev Detect if running on localhost for development
   * @notice Used to determine which IDRX token address to use
   */

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  /**
   * @dev AuctionFactory contract instance for proposal management
   * @notice Used for approving/rejecting proposals and checking admin roles
   */
  const { data: auctionFactoryContract } = useScaffoldContract({
    contractName: "AuctionFactory",
    walletClient,
  });

  /**
   * @dev IDRX token contract instance for local development
   * @notice Only used in development environments
   */
  const { data: idrxContract } = useScaffoldContract({
    contractName: "IDRX",
  });

  /**
   * @dev Production IDRX token address on deployed networks
   * @notice This should be updated with the actual production IDRX address
   */
  const DEPLOYED_IDRX_ADDRESS = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661";

  /**
   * @dev Determine IDRX token address based on environment
   * @notice Uses local contract in development, deployed address in production
   */
  const IDRX_TOKEN_ADDRESS = isLocalhost ? idrxContract?.address : DEPLOYED_IDRX_ADDRESS;

  // ============ Data Fetching and Processing ============

  /**
   * @dev Custom hook to fetch and process proposal data from smart contract
   * @notice Retrieves proposal details, asset metadata, images, categories, and attributes
   */
  const { proposal, assetName, description, images, categories, attributes, shortDescription, isLoading } =
    useProposalData(BigInt(proposalId), auctionFactoryContract);

  // ============ UI State for Image Gallery ============

  /**
   * @dev Currently selected image in the image gallery
   * @notice Controls which image is displayed in the main image viewer
   */
  const [selectedImage, setSelectedImage] = useState<string>("");

  /**
   * @dev Reference to the image scroll container for programmatic scrolling
   * @notice Used to implement smooth scrolling through image thumbnails
   */
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ============ Effect Hooks for Initialization ============

  /**
   * @dev Initialize selected image when images are loaded
   * @notice Sets the first image as the default selected image
   */
  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);

  /**
   * @dev Check if connected user has admin role in the AuctionFactory contract
   * @notice Admin role is required to approve or reject proposals
   */
  useEffect(() => {
    const checkAdminRole = async () => {
      if (auctionFactoryContract && connectedAddress) {
        try {
          const adminRole = "0x0000000000000000000000000000000000000000000000000000000000000000";
          const hasAdminRole = await auctionFactoryContract.read.hasRole([adminRole, connectedAddress]);
          setIsAdmin(hasAdminRole);
        } catch (error) {
          void error; // Acknowledge error parameter
          setIsAdmin(false);
        }
      }
    };
    checkAdminRole();
  }, [auctionFactoryContract, connectedAddress]);

  // ============ Contract Write Hooks ============

  /**
   * @dev Hook for launching approved auctions
   * @notice Calls reviewAndLaunchAuction function on AuctionFactory contract
   */
  const { writeContractAsync: launchAuction, isPending: isApproving } = useScaffoldWriteContract({
    contractName: "AuctionFactory",
  });

  /**
   * @dev Hook for rejecting proposals
   * @notice Calls rejectProposal function on AuctionFactory contract
   */
  const { writeContractAsync: rejectProposal, isPending: isRejecting } = useScaffoldWriteContract({
    contractName: "AuctionFactory",
  });

  // ============ Event Handlers ============

  /**
   * @dev Handle proposal approval and auction launch
   * @notice Validates admin permissions, commission input, and IDRX token availability
   * @notice Converts commission percentage to basis points for smart contract
   */
  const handleApprove = async () => {
    if (!isAdmin) {
      notification.error("Only admin can approve proposals.");
      return;
    }

    // Validate commission input
    const parsedCommission = typeof commission === "string" ? parseFloat(commission) : commission;
    if (isNaN(parsedCommission) || parsedCommission < 0 || parsedCommission > 100) {
      notification.error("Invalid commission input. Must be between 0 and 100.");
      return;
    }

    // Ensure IDRX token address is available
    if (!IDRX_TOKEN_ADDRESS) {
      notification.error(
        "Payment token address (IDRX) is not available. Make sure the contract is deployed correctly.",
      );
      return;
    }

    // Convert percentage to basis points (1% = 100 basis points)
    const commissionInBps = BigInt(Math.round(parsedCommission * 100));

    try {
      await launchAuction({
        functionName: "reviewAndLaunchAuction",
        args: [BigInt(proposalId), IDRX_TOKEN_ADDRESS, commissionInBps],
      });
      notification.success("Proposal successfully approved and auction launched!");
      router.push("/admin/requests");
    } catch (e) {
      void e; // Error handling is managed by the useScaffoldWriteContract hook
    }
  };

  /**
   * @dev Handle proposal rejection with reason
   * @notice Validates admin permissions and rejection reason before proceeding
   */
  const handleReject = async () => {
    if (!isAdmin) {
      notification.error("Only admin can reject proposals.");
      return;
    }
    if (!rejectReason.trim()) {
      notification.error("Rejection reason cannot be empty.");
      return;
    }
    try {
      await rejectProposal({
        functionName: "rejectProposal",
        args: [BigInt(proposalId)],
      });
      notification.success("Proposal has been rejected.");
      setIsRejectDialogOpen(false);
      router.push("/admin/requests");
    } catch (e) {
      void e; // Error handling is managed by the useScaffoldWriteContract hook
    }
  };

  /**
   * @dev Handle horizontal scrolling through image thumbnails
   * @param direction Direction to scroll ("left" or "right")
   * @notice Provides smooth scrolling behavior for better user experience
   */
  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      if (direction === "left") {
        scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // ============ Loading and Error States ============

  if (isLoading) return <div className="container mx-auto p-8 text-center">Loading proposal details...</div>;
  if (!proposal || !categories)
    return <div className="container mx-auto p-8 text-center">Proposal not found or incomplete data.</div>;

  // ============ Helper Functions ============

  /**
   * @dev Get properly formatted attribute display using asset configuration
   * @param attributesData Raw attributes from metadata
   * @param assetCategory Category of the asset to get correct field labels
   * @returns Array of formatted attributes with proper labels
   */
  const getFormattedAttributes = (attributesData: Array<{ name: string; value: string }>, assetCategory: string) => {
    const categoryFields = dynamicAssetFields[assetCategory] || dynamicAssetFields["Default"];

    return attributesData.map(attr => {
      // Find matching field configuration by comparing attribute name with field id or label
      const fieldConfig = categoryFields.find(
        field =>
          field.id === attr.name ||
          field.label.toLowerCase().replace(/[^a-z0-9]/g, "") === attr.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
      );

      return {
        label: fieldConfig?.label || attr.name, // Use configured label or fallback to original name
        value: attr.value,
      };
    });
  };

  // ============ Data Extraction for Rendering ============

  /**
   * @dev Extract proposal data for display
   * @notice These values come directly from the smart contract proposal struct
   */
  const currentStatus: ProposalStatus = proposal[4]; // Current proposal status
  const sellerAddress = proposal[0]; // Address of the proposal submitter
  const startingBid = proposal[2]; // Minimum bid amount in wei
  const deployedAuctionAddress = proposal[5]; // Address of deployed auction contract (if approved)
  const category = categories || "Default"; // Asset category for display

  // ============ Component Render ============

  return (
    <ConnectWalletGuard pageName="Admin Request Details">
      <div className="container mx-auto p-4 md:p-8">
        {/* Header with navigation and access level indicator */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push("/admin/requests")} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ Admin Access
              </div>
            ) : (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">⚠️ View Only</div>
            )}
          </div>
        </div>

        {/* Main content grid - images on left, details on right */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Image gallery section */}
          <div className="md:col-span-2 space-y-4">
            {/* Main image display */}
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

            {/* Image thumbnail navigation */}
            {images.length > 1 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 -translate-y-1/2 left-0 z-10 h-10 w-10 rounded-full"
                  onClick={() => handleScroll("left")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto space-x-2 p-2 scroll-smooth"
                  style={{ scrollbarWidth: "none" }}
                >
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 flex-shrink-0 cursor-pointer"
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

          {/* Proposal details and admin actions sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                {/* Asset title and category badge */}
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{assetName}</h1>
                  <CategoryBadge category={category} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />

                {/* Basic proposal information section */}
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">Request Information</p>
                  <ul className="list-none pl-0 text-sm text-muted-foreground space-y-1">
                    <li>
                      <strong>Submitted by:</strong> <span className="truncate block">{sellerAddress}</span>
                    </li>
                    <li>
                      <strong>Starting Bid:</strong> {formatEther(startingBid)} IDRX
                    </li>
                    {shortDescription && (
                      <li className="mt-3">
                        <strong>Short Description:</strong>
                        <p className="mt-1 text-sm leading-relaxed">{shortDescription}</p>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Admin actions section - only shown for pending proposals */}
                {currentStatus === ProposalStatus.Pending && (
                  <div className="flex flex-col gap-2 mt-6 pt-4 border-t">
                    <h3 className="text-lg font-semibold text-foreground">Admin Actions</h3>

                    {/* Warning message for non-admin users */}
                    {!isAdmin && (
                      <div className="text-sm text-muted-foreground mb-2">⚠️ Only admin can perform these actions</div>
                    )}

                    {/* Commission rate input */}
                    <div className="space-y-2">
                      <Label htmlFor="commission">Commission (%)</Label>
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

                    {/* Approve button - launches auction with specified commission */}
                    <Button
                      onClick={handleApprove}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isApproving || isRejecting || !isAdmin}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isApproving ? "Approving..." : "Approve & Launch Auction"}
                    </Button>

                    {/* Reject button with confirmation dialog */}
                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full"
                          disabled={isApproving || isRejecting || !isAdmin}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Request
                        </Button>
                      </DialogTrigger>

                      {/* Rejection confirmation dialog */}
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Auction Request</DialogTitle>
                          <DialogDescription>
                            Provide a reason for rejecting the auction &quot;{assetName}&quot;.
                          </DialogDescription>
                        </DialogHeader>

                        {/* Rejection reason textarea */}
                        <div className="grid gap-4 py-4">
                          <Textarea
                            id="reason"
                            placeholder="Enter rejection reason..."
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            disabled={!isAdmin}
                          />
                        </div>

                        {/* Dialog action buttons */}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleReject} disabled={isRejecting || !isAdmin}>
                            {isRejecting ? "Rejecting..." : "Reject"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Status indicators for different proposal states */}

                {/* Live auction status - proposal approved and auction active */}
                {currentStatus === ProposalStatus.Live && (
                  <div className="mt-6 pt-4 border-t text-center space-y-3">
                    <p className="text-lg font-semibold text-green-600 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" /> Auction is Now Active
                    </p>
                    {deployedAuctionAddress && (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/auctions/${deployedAuctionAddress}`)}
                          className="w-full"
                        >
                          View Live Auction
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Rejected status - proposal was declined by admin */}
                {currentStatus === ProposalStatus.Rejected && (
                  <div className="mt-6 pt-4 border-t text-center">
                    <p className="text-lg font-semibold text-red-600 flex items-center justify-center">
                      <XCircle className="w-5 h-5 mr-2" /> Auction Rejected
                    </p>
                  </div>
                )}

                {/* Finished status - auction completed */}
                {currentStatus === ProposalStatus.Finished && (
                  <div className="mt-6 pt-4 border-t text-center">
                    <p className="text-lg font-semibold text-gray-600 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" /> Auction Completed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Asset description section - full width below main content */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Item Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-6">{description}</p>

              {/* Attributes section */}
              {attributes && attributes.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Attributes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getFormattedAttributes(attributes, category).map((attribute, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="font-medium text-foreground">{attribute.label}</span>
                        <span className="text-muted-foreground">{attribute.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ConnectWalletGuard>
  );
}
