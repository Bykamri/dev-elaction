"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ImageIcon, UploadCloud, XCircle } from "lucide-react";
import { parseEther } from "viem";
import { useWalletClient } from "wagmi";
import { ConnectWalletGuard } from "~~/components/auth/ConnectWalletGuard";
import { ApplicationStatus } from "~~/components/customer/request-auction/application-status";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~~/components/ui/dialog";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/ui/select";
import { Textarea } from "~~/components/ui/textarea";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { assetCategories, dynamicAssetFields } from "~~/lib/asset-configs";

/**
 * @title Auction Application Creation Page
 * @dev Complete auction proposal submission interface for users
 * @notice This page provides:
 *   - Multi-step form for auction proposal submission
 *   - Dynamic asset fields based on selected category
 *   - Image upload with format validation and preview
 *   - IPFS metadata generation and blockchain submission
 *   - Real-time status tracking and error handling
 * @notice Users can create auction proposals that require admin approval before going live
 */

// ============ Type Definitions ============

/**
 * @dev Form data structure for auction proposal submission
 * @notice Contains all required information for creating an auction proposal
 */
interface FormData {
  generalInfo: {
    assetName: string; // Name of the asset being auctioned
    assetType: string; // Category type from asset-configs
    description: string; // Detailed asset description
    shortDescription: string; // Brief summary (max 100 words)
    userAddress: string; // Wallet address of the proposer
  };
  auctionSpecifics: {
    startingBid: string; // Minimum bid amount in IDRX
    durationValue: number; // Auction duration numeric value
    durationUnit: "days" | "hours" | "minutes"; // Duration time unit
  };
  assetDetails: Record<string, any>; // Dynamic fields based on asset category
  imageFiles: {
    fileName: string; // Original filename from upload
    dataUrl: string; // Base64 encoded image data
    fileType: string; // MIME type of the image
  }[];
}

/**
 * @dev Admin status enumeration for proposal tracking
 * @notice Represents different states of admin review process
 */
/**
 * @dev Admin status enumeration for proposal tracking
 * @notice Represents different states of admin review process
 */
type AdminStatus = "pending" | "in_review" | "rejected" | "published";

// ============ Form Component Interfaces ============

/**
 * @dev Props interface for GeneralInfoForm component
 * @notice Contains form data and handlers for basic asset information
 */
interface GeneralInfoFormProps {
  formData: FormData; // Current form state
  handleGeneralInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // Input change handler
  handleAssetTypeChange: (value: string) => void; // Asset category selection handler
}

/**
 * @title General Information Form Component
 * @dev Form section for basic asset details and user information
 * @notice Collects asset name, type, descriptions, and auto-fills wallet address
 */
const GeneralInfoForm: React.FC<GeneralInfoFormProps> = ({
  formData,
  handleGeneralInfoChange,
  handleAssetTypeChange,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>General Information</CardTitle>
      <CardDescription>Provide basic details about the asset you want to auction.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Asset Name Input */}
      <div className="space-y-2">
        <Label htmlFor="assetName">Asset Name</Label>
        <Input
          id="assetName"
          placeholder="e.g., Rare Digital Art Piece"
          required
          value={formData.generalInfo.assetName}
          onChange={handleGeneralInfoChange}
        />
      </div>

      {/* Asset Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="assetType">Asset Type</Label>
        <Select value={formData.generalInfo.assetType} onValueChange={handleAssetTypeChange} required>
          <SelectTrigger id="assetType">
            <SelectValue placeholder="Select asset type" />
          </SelectTrigger>
          <SelectContent>
            {assetCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Detailed Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Asset Description</Label>
        <Textarea
          id="description"
          placeholder="Provide a detailed description of your asset."
          required
          value={formData.generalInfo.description}
          onChange={handleGeneralInfoChange}
          rows={5}
        />
      </div>

      {/* Short Description with Word Counter */}
      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short Description (max 100 words)</Label>
        <Textarea
          id="shortDescription"
          placeholder="Provide a brief summary of your asset."
          required
          value={formData.generalInfo.shortDescription}
          onChange={handleGeneralInfoChange}
          maxLength={100 * 5}
        />
        <p className="text-sm text-muted-foreground">
          {formData.generalInfo.shortDescription.split(/\s+/).filter(Boolean).length} / 100 words
        </p>
      </div>

      {/* Auto-filled Wallet Address */}
      <div className="space-y-2">
        <Label htmlFor="userAddress">Your Wallet Address</Label>
        <Input
          id="userAddress"
          value={formData.generalInfo.userAddress}
          readOnly
          className="bg-gray-50 cursor-not-allowed"
        />
        <p className="text-sm text-muted-foreground">This is automatically detected from your connected wallet.</p>
      </div>
    </CardContent>
  </Card>
);

/**
 * @dev Props interface for AuctionSpecificsForm component
 * @notice Contains form data and handlers for auction bidding parameters
 */
interface AuctionSpecificsFormProps {
  formData: FormData; // Current form state
  handleAuctionSpecificsChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Numeric input handler
  handleDurationUnitChange: (value: "days" | "hours" | "minutes") => void; // Duration unit selection handler
}

/**
 * @title Auction Specifics Form Component
 * @dev Form section for auction parameters including starting bid and duration
 * @notice Allows users to set minimum bid amount and auction duration with flexible time units
 */
const AuctionSpecificsForm: React.FC<AuctionSpecificsFormProps> = ({
  formData,
  handleAuctionSpecificsChange,
  handleDurationUnitChange,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Auction Specifics</CardTitle>
      <CardDescription>Set the bidding details and duration for your auction.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Starting Bid Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="startingBid">Starting Bid Amount (in IDRX)</Label>
        <Input
          id="startingBid"
          type="number"
          placeholder="e.g., 500000000"
          step="any"
          required
          value={formData.auctionSpecifics.startingBid}
          onChange={handleAuctionSpecificsChange}
        />
      </div>

      {/* Auction Duration Configuration */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-2">
          <Label htmlFor="durationValue">Auction Duration</Label>
          <Input
            id="durationValue"
            type="number"
            required
            value={formData.auctionSpecifics.durationValue}
            onChange={handleAuctionSpecificsChange}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="durationUnit">Time Unit</Label>
          <Select value={formData.auctionSpecifics.durationUnit} onValueChange={handleDurationUnitChange}>
            <SelectTrigger id="durationUnit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="minutes">Minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * @dev Props interface for AssetDetailsForm component
 * @notice Contains form data and handlers for asset-specific details and image management
 */
interface AssetDetailsFormProps {
  formData: FormData; // Current form state
  handleDynamicAssetDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // Dynamic field handler
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; // Image upload handler
  handleRemoveImage: (index: number) => void; // Image removal handler
  handlePreviewClick: (url: string, title: string) => void; // Image preview handler
  firstImageFormat: string | null; // Format constraint for image consistency
}

/**
 * @title Asset Details Form Component
 * @dev Dynamic form section that adapts based on selected asset category
 * @notice Provides:
 *   - Category-specific attribute fields (watches, art, books, etc.)
 *   - Image upload with format validation and preview
 *   - Maximum 5 images with consistent format requirement
 *   - Drag-and-drop interface for file uploads
 */
const AssetDetailsForm: React.FC<AssetDetailsFormProps> = ({
  formData,
  handleDynamicAssetDetailsChange,
  handleImageUpload,
  handleRemoveImage,
  handlePreviewClick,
  firstImageFormat,
}) => {
  // Get dynamic fields based on selected asset type
  const selectedDynamicFields = dynamicAssetFields[formData.generalInfo.assetType] || dynamicAssetFields["Default"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Details</CardTitle>
        <CardDescription>Provide specific details and images for your asset.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dynamic Asset-Specific Fields */}
        {formData.generalInfo.assetType ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Specifics for {formData.generalInfo.assetType}</h3>
            {selectedDynamicFields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    value={formData.assetDetails[field.id] || ""}
                    onChange={handleDynamicAssetDetailsChange}
                  />
                ) : (
                  <Input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData.assetDetails[field.id] || ""}
                    onChange={handleDynamicAssetDetailsChange}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Select an Asset Type above to see specific details fields.</p>
        )}

        {/* Image Upload Section */}
        <div className="space-y-2">
          <Label>Asset Images (Max 5)</Label>
          {/* Upload Drop Zone */}
          <div
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => document.getElementById("assetImages")?.click()}
          >
            <UploadCloud className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-sm text-primary font-medium">Upload files or drag and drop</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB per file</p>
            <Input
              id="assetImages"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={formData.imageFiles.length >= 5}
            />

            {/* Upload Status Display */}
            {formData.imageFiles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {formData.imageFiles.length} image(s) selected.{" "}
                {firstImageFormat && `(Format: ${firstImageFormat.split("/")[1].toUpperCase()})`}
              </p>
            )}
            {formData.imageFiles.length === 0 && firstImageFormat && (
              <p className="text-sm text-red-500 mt-2">
                Please upload images of type: {firstImageFormat.split("/")[1].toUpperCase()}
              </p>
            )}
          </div>

          {/* Image Preview Grid */}
          {formData.imageFiles.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-4">
              {formData.imageFiles.map((image, index) => (
                <div key={index} className="relative group h-24 w-full rounded-md overflow-hidden">
                  <Image
                    src={image.dataUrl || "/placeholder.svg"}
                    alt={image.fileName}
                    layout="fill"
                    objectFit="cover"
                    className="object-cover"
                  />
                  {/* Remove Image Button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                  {/* Preview Image Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-1 left-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => {
                      e.stopPropagation();
                      handlePreviewClick(image.dataUrl, image.fileName);
                    }}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span className="sr-only">Preview image</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============ Main Component ============

/**
 * @title Main Auction Application Page Component
 * @dev Complete auction proposal creation interface with multi-step workflow
 * @notice Manages the entire auction proposal submission process including:
 *   - Form state management across multiple steps
 *   - Image upload and format validation
 *   - IPFS metadata generation and upload
 *   - Smart contract interaction for proposal submission
 *   - Real-time status tracking and error handling
 */
export default function AuctionApplicationPage() {
  // ============ Form State Management ============

  /**
   * @dev Main form data state containing all user inputs
   * @notice Structured to match API requirements and contract parameters
   */
  const [formData, setFormData] = useState<FormData>({
    generalInfo: {
      assetName: "",
      assetType: "",
      description: "",
      shortDescription: "",
      userAddress: "",
    },
    auctionSpecifics: {
      startingBid: "",
      durationValue: 7,
      durationUnit: "days",
    },
    assetDetails: {},
    imageFiles: [],
  });

  // ============ UI State Management ============

  /**
   * @dev Current step in the multi-step form process
   * @notice 0 = Form input, 1 = Review and submit
   */
  const [currentStep, setCurrentStep] = useState(0);

  /**
   * @dev Application submission status flag
   * @notice Controls display between form and success status
   */
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  /**
   * @dev Mock admin confirmation status for demo purposes
   * @notice In production, this would come from backend API
   */
  const [adminConfirmationStatus] = useState<AdminStatus>("published");

  /**
   * @dev Date tracking for application timeline
   * @notice Used for displaying submission and last update dates
   */
  const [submittedDate, setSubmittedDate] = useState("");
  const [lastUpdatedDate, setLastUpdatedDate] = useState("");

  /**
   * @dev Image format constraint for consistency
   * @notice Ensures all uploaded images have the same format
   */
  const [firstImageFormat, setFirstImageFormat] = useState<string | null>(null);

  /**
   * @dev Loading state for submission process
   * @notice Controls button states and loading indicators
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * @dev Status message for real-time user feedback
   * @notice Shows current step in the submission process
   */
  const [statusMessage, setStatusMessage] = useState("");

  // ============ Image Preview Dialog State ============

  /**
   * @dev State management for image preview modal
   * @notice Controls dialog visibility and preview content
   */
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageTitle, setPreviewImageTitle] = useState<string>("");

  // ============ Blockchain and Contract Integration ============

  /**
   * @dev Wallet client for blockchain interactions
   * @notice Required for contract write operations and address detection
   */
  const { data: walletClient } = useWalletClient();

  /**
   * @dev AuctionFactory contract instance for proposal submission
   * @notice Handles the actual blockchain transaction for proposal creation
   */
  const { data: auctionFactoryContract } = useScaffoldContract({
    contractName: "AuctionFactory",
    walletClient,
  });

  // ============ Side Effects and Data Synchronization ============

  /**
   * @dev Auto-fill user wallet address when wallet is connected
   * @notice Updates form data with connected wallet address for convenience
   */
  useEffect(() => {
    if (walletClient?.account.address) {
      setFormData(prev => ({
        ...prev,
        generalInfo: {
          ...prev.generalInfo,
          userAddress: walletClient.account.address,
        },
      }));
    }
  }, [walletClient]);

  /**
   * @dev Set submission and update timestamps when application is submitted
   * @notice Updates date fields for status tracking display
   */
  useEffect(() => {
    if (applicationSubmitted && adminConfirmationStatus === "published") {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
      setSubmittedDate(formattedDate);
      setLastUpdatedDate(formattedDate);
    }
  }, [applicationSubmitted, adminConfirmationStatus]);

  // ============ Form Event Handlers ============

  /**
   * @dev Handle changes to general information fields
   * @notice Updates form state for asset name, descriptions, etc.
   */
  const handleGeneralInfoChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, generalInfo: { ...prev.generalInfo, [id]: value } }));
  }, []);

  /**
   * @dev Handle asset type selection change
   * @notice Resets asset details when category changes to prevent field conflicts
   */
  const handleAssetTypeChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      generalInfo: { ...prev.generalInfo, assetType: value },
      assetDetails: {}, // Reset details when category changes
    }));
  }, []);

  /**
   * @dev Handle auction specifics input changes
   * @notice Processes starting bid and duration value inputs with proper type conversion
   */
  const handleAuctionSpecificsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      auctionSpecifics: {
        ...prev.auctionSpecifics,
        [id]: id === "durationValue" ? Number(value) : value,
      },
    }));
  }, []);

  /**
   * @dev Handle duration unit selection change
   * @notice Updates time unit for auction duration (days/hours/minutes)
   */
  const handleDurationUnitChange = useCallback((value: "days" | "hours" | "minutes") => {
    setFormData(prev => ({
      ...prev,
      auctionSpecifics: {
        ...prev.auctionSpecifics,
        durationUnit: value,
      },
    }));
  }, []);

  /**
   * @dev Handle dynamic asset detail field changes
   * @notice Updates category-specific attributes based on selected asset type
   */
  const handleDynamicAssetDetailsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({ ...prev, assetDetails: { ...prev.assetDetails, [id]: value } }));
    },
    [],
  );

  // ============ Image Management Handlers ============

  /**
   * @dev Handle image file uploads with format validation
   * @notice Processes multiple image files with the following constraints:
   *   - Maximum 5 images allowed
   *   - All images must have the same format (enforced after first upload)
   *   - Converts files to base64 data URLs for preview
   */
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        const newImageFiles: { fileName: string; dataUrl: string; fileType: string }[] = [];

        for (const file of files) {
          // Enforce maximum image limit
          if (formData.imageFiles.length + newImageFiles.length >= 5) {
            setStatusMessage("Maximum 5 images allowed.");
            break;
          }

          // Enforce format consistency
          if (!firstImageFormat) {
            setFirstImageFormat(file.type);
          } else if (file.type !== firstImageFormat) {
            setStatusMessage(
              `All images must be of the same format. Please upload ${firstImageFormat.split("/")[1].toUpperCase()} files.`,
            );
            continue;
          }

          // Convert file to base64 for preview
          const reader = new FileReader();
          reader.onloadend = () => {
            newImageFiles.push({ fileName: file.name, dataUrl: reader.result as string, fileType: file.type });
            if (newImageFiles.length === files.length) {
              setFormData(prev => ({
                ...prev,
                imageFiles: [...prev.imageFiles, ...newImageFiles],
              }));
            }
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [formData.imageFiles.length, firstImageFormat],
  );

  /**
   * @dev Remove image from upload list
   * @notice Removes image at specified index and resets format constraint if no images remain
   */
  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setFormData(prev => {
      const updatedFiles = prev.imageFiles.filter((_, index) => index !== indexToRemove);
      if (updatedFiles.length === 0) {
        setFirstImageFormat(null); // Reset format constraint when no images remain
      }
      return { ...prev, imageFiles: updatedFiles };
    });
  }, []);

  /**
   * @dev Open image preview modal
   * @notice Sets preview state and opens dialog for full-size image viewing
   */
  const handlePreviewClick = useCallback((url: string | null, title: string) => {
    if (url) {
      setPreviewImageUrl(url);
      setPreviewImageTitle(title);
      setIsDialogOpen(true);
    }
  }, []);

  // ============ Form Navigation and Validation ============

  /**
   * @dev Handle progression to review step
   * @notice Validates required fields before allowing user to proceed to review
   */
  const handleNextToReview = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const { generalInfo, auctionSpecifics, imageFiles } = formData;

      // Validate required fields
      if (
        !generalInfo.assetName ||
        !generalInfo.assetType ||
        auctionSpecifics.startingBid === "" ||
        imageFiles.length === 0
      ) {
        setStatusMessage("Please fill in all required fields and upload at least one image.");
        return;
      }

      setCurrentStep(1); // Proceed to review step
    },
    [formData],
  );

  // ============ Blockchain Submission Handler ============

  /**
   * @dev Handle complete auction proposal submission process
   * @notice Orchestrates the multi-step submission workflow:
   *   1. Upload images and metadata to IPFS
   *   2. Calculate auction duration in seconds
   *   3. Convert starting bid to proper Wei format
   *   4. Submit proposal to smart contract
   *   5. Handle success/error states with user feedback
   */
  const handleSubmitApplication = useCallback(async () => {
    // Validate prerequisites
    if (!walletClient || !auctionFactoryContract) {
      setStatusMessage("Wallet not connected or contract not found.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("1/3: Uploading metadata to IPFS...");

    try {
      // ============ Step 1: Upload Metadata to IPFS ============

      const apiPayload = {
        generalInfo: formData.generalInfo,
        assetDetails: formData.assetDetails,
        imageFiles: formData.imageFiles,
      };

      const response = await fetch("/api/submitApplication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Failed to create metadata.");

      const metadataUri = result.metadataUri;
      setStatusMessage("2/3: Metadata created! Preparing transaction...");

      // ============ Step 2: Calculate Auction Duration ============

      const { durationValue, durationUnit, startingBid } = formData.auctionSpecifics;
      let durationInSeconds = 0;

      // Convert duration to seconds based on selected unit
      if (durationUnit === "days") {
        durationInSeconds = durationValue * 24 * 60 * 60;
      } else if (durationUnit === "hours") {
        durationInSeconds = durationValue * 60 * 60;
      } else {
        durationInSeconds = durationValue * 60;
      }

      if (durationInSeconds <= 0) {
        throw new Error("Auction duration must be positive.");
      }

      // ============ Step 3: Convert Starting Bid to Wei ============

      const bigIntStartingBid = parseEther(startingBid);

      // ============ Step 4: Submit to Smart Contract ============

      setStatusMessage("3/3: Please approve transaction in your wallet...");
      await auctionFactoryContract.write.submitProposal([metadataUri, bigIntStartingBid, BigInt(durationInSeconds)]);

      setStatusMessage("Proposal submitted successfully! 🎉");
      setApplicationSubmitted(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setStatusMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [formData, walletClient, auctionFactoryContract]);

  // ============ Review and Submit Component ============

  /**
   * @title Review and Submit Step Component
   * @dev Final review interface before proposal submission
   * @notice Displays:
   *   - Complete summary of all form data
   *   - Asset details organized by category
   *   - Image gallery with preview functionality
   *   - Final submission controls with loading states
   */
  const ReviewSubmitStep = () => (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Review & Submit Application</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Please review all the information you have provided. Once you submit, your application will be sent for admin
          review.
        </p>

        {/* General Information Summary */}
        <div className="space-y-2 border-b pb-4">
          <h3 className="text-lg font-semibold">General Information</h3>
          <ul className="list-none pl-0 text-sm text-muted-foreground space-y-1">
            <li>
              <strong>Asset Name:</strong> {formData.generalInfo.assetName || "N/A"}
            </li>
            <li>
              <strong>Asset Type:</strong> {formData.generalInfo.assetType || "N/A"}
            </li>
            <li>
              <strong>Description:</strong> {formData.generalInfo.description || "N/A"}
            </li>
            <li>
              <strong>Short Description:</strong> {formData.generalInfo.shortDescription || "N/A"}
            </li>
            <li>
              <strong>Your Wallet Address:</strong> {formData.generalInfo.userAddress || "N/A"}
            </li>
          </ul>
        </div>

        {/* Auction Specifics Summary */}
        <div className="space-y-2 border-b pb-4">
          <h3 className="text-lg font-semibold">Auction Specifics</h3>
          <ul className="list-none pl-0 text-sm text-muted-foreground space-y-1">
            <li>
              <strong>Starting Bid:</strong>{" "}
              {formData.auctionSpecifics.startingBid ? `${Number(formData.auctionSpecifics.startingBid)} IDRX` : "N/A"}
            </li>
            <li>
              <strong>Auction Duration:</strong>{" "}
              {`${formData.auctionSpecifics.durationValue} ${formData.auctionSpecifics.durationUnit}`}
            </li>
          </ul>
        </div>

        {/* Asset Details Summary */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Asset Details</h3>
          {Object.keys(formData.assetDetails).length > 0 ? (
            <ul className="list-none pl-0 text-sm text-muted-foreground space-y-1">
              {Object.entries(formData.assetDetails).map(([key, value]) => (
                <li key={key}>
                  <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:</strong>{" "}
                  {value || "N/A"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No specific asset details provided.</p>
          )}

          {/* Image Gallery Summary */}
          <h4 className="text-md font-semibold mt-4">Asset Images ({formData.imageFiles.length})</h4>
          {formData.imageFiles.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {formData.imageFiles.map((image, index) => (
                <div key={index} className="relative h-24 w-full rounded-md overflow-hidden">
                  <Image
                    src={image.dataUrl || "/placeholder.svg"}
                    alt={image.fileName}
                    layout="fill"
                    objectFit="cover"
                    className="object-cover"
                  />
                  {/* Preview Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-1 left-1 h-6 w-6 rounded-full"
                    onClick={() => handlePreviewClick(image.dataUrl, image.fileName)}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span className="sr-only">Preview image</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No images uploaded.</p>
          )}
        </div>
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="flex flex-col gap-4 pt-4 border-t">
        <div className="flex w-full justify-between gap-4">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(0)} className="bg-transparent">
            Previous
          </Button>
          <Button
            onClick={handleSubmitApplication}
            className=" bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>

        {/* Status Message Display */}
        {isLoading && <p className="animate-pulse text-center text-sm text-muted-foreground">{statusMessage}</p>}
      </CardFooter>
    </Card>
  );

  // ============ Image Preview Dialog Component ============

  /**
   * @title Image Preview Dialog Component
   * @dev Modal component for full-size image viewing
   * @notice Provides:
   *   - Full-size image display with proper aspect ratio
   *   - Image title and description
   *   - Responsive modal layout
   */
  const ImagePreviewDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{previewImageTitle}</DialogTitle>
          <DialogDescription>Preview of your uploaded image.</DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-[400px] bg-gray-100 flex items-center justify-center">
          {previewImageUrl ? (
            <Image
              src={previewImageUrl || "/placeholder.svg"}
              alt={previewImageTitle}
              layout="fill"
              objectFit="contain"
              className="max-w-full max-h-full"
            />
          ) : (
            <p className="text-muted-foreground">No image to preview.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // ============ Main Component Render ============

  /**
   * @dev Main component render with conditional step display
   * @notice Renders different views based on application state:
   *   - Form input (step 0)
   *   - Review and submit (step 1)
   *   - Success status (after submission)
   */
  return (
    <ConnectWalletGuard pageName="Create Auction">
      <main className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-4 md:p-6">
        {applicationSubmitted ? (
          /* Application Success State */
          <div className="w-full max-w-2xl space-y-6">
            <ApplicationStatus
              status={adminConfirmationStatus}
              submittedDate={submittedDate}
              lastUpdatedDate={lastUpdatedDate}
            />
          </div>
        ) : currentStep === 0 ? (
          /* Form Input Step */
          <form onSubmit={handleNextToReview} className="w-full max-w-2xl space-y-8">
            <GeneralInfoForm
              formData={formData}
              handleGeneralInfoChange={handleGeneralInfoChange}
              handleAssetTypeChange={handleAssetTypeChange}
            />
            <AuctionSpecificsForm
              formData={formData}
              handleAuctionSpecificsChange={handleAuctionSpecificsChange}
              handleDurationUnitChange={handleDurationUnitChange}
            />
            <AssetDetailsForm
              formData={formData}
              firstImageFormat={firstImageFormat}
              handleDynamicAssetDetailsChange={handleDynamicAssetDetailsChange}
              handleImageUpload={handleImageUpload}
              handleRemoveImage={handleRemoveImage}
              handlePreviewClick={handlePreviewClick}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-primary-foreground"
              >
                Next: Review Application
              </Button>
            </div>
          </form>
        ) : (
          /* Review and Submit Step */
          <ReviewSubmitStep />
        )}
      </main>
      <ImagePreviewDialog />
    </ConnectWalletGuard>
  );
}
