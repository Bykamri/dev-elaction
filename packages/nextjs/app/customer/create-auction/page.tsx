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

interface FormData {
  generalInfo: {
    assetName: string;
    assetType: string;
    description: string;
    shortDescription: string;
    userAddress: string;
  };
  auctionSpecifics: {
    startingBid: string;
    durationValue: number;
    durationUnit: "days" | "hours" | "minutes";
  };
  assetDetails: Record<string, any>;
  imageFiles: {
    fileName: string;
    dataUrl: string;
    fileType: string;
  }[];
}

type AdminStatus = "pending" | "in_review" | "rejected" | "published";

interface GeneralInfoFormProps {
  formData: FormData;
  handleGeneralInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAssetTypeChange: (value: string) => void;
}

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

interface AuctionSpecificsFormProps {
  formData: FormData;
  handleAuctionSpecificsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDurationUnitChange: (value: "days" | "hours" | "minutes") => void;
}

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

interface AssetDetailsFormProps {
  formData: FormData;
  handleDynamicAssetDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  handlePreviewClick: (url: string, title: string) => void;
  firstImageFormat: string | null;
}

const AssetDetailsForm: React.FC<AssetDetailsFormProps> = ({
  formData,
  handleDynamicAssetDetailsChange,
  handleImageUpload,
  handleRemoveImage,
  handlePreviewClick,
  firstImageFormat,
}) => {
  const selectedDynamicFields = dynamicAssetFields[formData.generalInfo.assetType] || dynamicAssetFields["Default"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Details</CardTitle>
        <CardDescription>Provide specific details and images for your asset.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="space-y-2">
          <Label>Asset Images (Max 5)</Label>
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

export default function AuctionApplicationPage() {
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

  const [currentStep, setCurrentStep] = useState(0);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [adminConfirmationStatus] = useState<AdminStatus>("published");
  const [submittedDate, setSubmittedDate] = useState("");
  const [lastUpdatedDate, setLastUpdatedDate] = useState("");
  const [firstImageFormat, setFirstImageFormat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageTitle, setPreviewImageTitle] = useState<string>("");

  const { data: walletClient } = useWalletClient();
  const { data: auctionFactoryContract } = useScaffoldContract({
    contractName: "AuctionFactory",
    walletClient,
  });

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

  useEffect(() => {
    if (applicationSubmitted && adminConfirmationStatus === "published") {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
      setSubmittedDate(formattedDate);
      setLastUpdatedDate(formattedDate);
    }
  }, [applicationSubmitted, adminConfirmationStatus]);

  const handleGeneralInfoChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, generalInfo: { ...prev.generalInfo, [id]: value } }));
  }, []);

  const handleAssetTypeChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      generalInfo: { ...prev.generalInfo, assetType: value },
      assetDetails: {},
    }));
  }, []);

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

  const handleDurationUnitChange = useCallback((value: "days" | "hours" | "minutes") => {
    setFormData(prev => ({
      ...prev,
      auctionSpecifics: {
        ...prev.auctionSpecifics,
        durationUnit: value,
      },
    }));
  }, []);

  const handleDynamicAssetDetailsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({ ...prev, assetDetails: { ...prev.assetDetails, [id]: value } }));
    },
    [],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        const newImageFiles: { fileName: string; dataUrl: string; fileType: string }[] = [];

        for (const file of files) {
          if (formData.imageFiles.length + newImageFiles.length >= 5) {
            alert("You can only upload a maximum of 5 images.");
            break;
          }
          if (!firstImageFormat) {
            setFirstImageFormat(file.type);
          } else if (file.type !== firstImageFormat) {
            alert(
              `All images must be of the same format. Please upload ${firstImageFormat.split("/")[1].toUpperCase()} files.`,
            );
            continue;
          }

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

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setFormData(prev => {
      const updatedFiles = prev.imageFiles.filter((_, index) => index !== indexToRemove);
      if (updatedFiles.length === 0) {
        setFirstImageFormat(null);
      }
      return { ...prev, imageFiles: updatedFiles };
    });
  }, []);

  const handlePreviewClick = useCallback((url: string | null, title: string) => {
    if (url) {
      setPreviewImageUrl(url);
      setPreviewImageTitle(title);
      setIsDialogOpen(true);
    }
  }, []);

  const handleNextToReview = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const { generalInfo, auctionSpecifics, imageFiles } = formData;
      if (
        !generalInfo.assetName ||
        !generalInfo.assetType ||
        auctionSpecifics.startingBid === "" ||
        imageFiles.length === 0
      ) {
        alert("Please fill in all required fields and upload at least one image.");
        return;
      }
      setCurrentStep(1);
    },
    [formData],
  );

  const handleSubmitApplication = useCallback(async () => {
    if (!walletClient || !auctionFactoryContract) {
      alert("Wallet not connected or contract not found.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("1/3: Uploading metadata to IPFS...");

    try {
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

      const { durationValue, durationUnit, startingBid } = formData.auctionSpecifics;
      let durationInSeconds = 0;
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

      const bigIntStartingBid = parseEther(startingBid);

      setStatusMessage("3/3: Please approve transaction in your wallet...");
      await auctionFactoryContract.write.submitProposal([metadataUri, bigIntStartingBid, BigInt(durationInSeconds)]);

      setStatusMessage("Proposal submitted successfully! 🎉");
      setApplicationSubmitted(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setStatusMessage(`Error: ${errorMessage}`);
      alert(`Failed to submit proposal: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [formData, walletClient, auctionFactoryContract]);

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

        {isLoading && <p className="animate-pulse text-center text-sm text-muted-foreground">{statusMessage}</p>}
      </CardFooter>
    </Card>
  );

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

  return (
    <ConnectWalletGuard pageName="Create Auction">
      <main className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-4 md:p-6">
        {applicationSubmitted ? (
          <div className="w-full max-w-2xl space-y-6">
            <ApplicationStatus
              status={adminConfirmationStatus}
              submittedDate={submittedDate}
              lastUpdatedDate={lastUpdatedDate}
            />
          </div>
        ) : currentStep === 0 ? (
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
          <ReviewSubmitStep />
        )}
      </main>
      <ImagePreviewDialog />
    </ConnectWalletGuard>
  );
}
