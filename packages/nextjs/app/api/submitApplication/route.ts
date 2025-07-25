import { NextResponse } from "next/server";
import { PinataSDK } from "pinata";
import { v4 as uuidv4 } from "uuid";

/**
 * @title Submit Application API Route
 * @dev API endpoint for handling auction proposal submissions
 * @notice This endpoint processes asset submission forms and uploads metadata to IPFS
 * @notice Handles image uploads, metadata generation, and IPFS storage via Pinata
 */

/**
 * @dev Interface defining the structure of form data received from client
 * @notice Contains general asset information, dynamic asset details, and image files
 */
interface FormData {
  generalInfo: {
    assetName: string; // Name of the asset being submitted
    assetType: string; // Category/type of the asset (e.g., "Comics", "Watches")
    description: string; // Full detailed description of the asset
    shortDescription: string; // Brief summary description
  };
  assetDetails: Record<string, any>; // Dynamic fields based on asset type (e.g., series, grade, etc.)
  imageFiles: {
    fileName: string; // Original filename from user upload
    dataUrl: string; // Base64 encoded image data
    fileType: string; // MIME type of the image file
  }[];
}

/**
 * @dev POST endpoint handler for auction proposal submissions
 * @notice Processes form data, uploads images to IPFS, generates metadata, and returns metadata URI
 * @param request HTTP request containing form data with asset information and images
 * @returns JSON response with success status and metadata URI or error message
 */
export async function POST(request: Request) {
  try {
    // ============ Pinata SDK Initialization ============

    /**
     * @dev Initialize Pinata SDK for IPFS operations
     * @notice Uses environment variables for authentication and gateway configuration
     */
    const pinata = new PinataSDK({
      pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
      pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud",
    });

    // ============ Request Data Processing ============

    /**
     * @dev Parse and extract form data from request body
     * @notice Destructures general info, asset details, and image files from form submission
     */
    const body: FormData = await request.json();
    const { generalInfo, assetDetails, imageFiles } = body;

    // ============ Input Validation ============

    /**
     * @dev Validate required fields before processing
     * @notice Ensures asset name, type, and at least one image are provided
     */
    if (!generalInfo.assetName || !generalInfo.assetType || imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: "Asset name, type, or images are missing or incomplete." },
        { status: 400 },
      );
    }

    // ============ Image Upload Processing ============

    /**
     * @dev Process and upload all image files to IPFS via Pinata
     * @notice Converts base64 image data to File objects and uploads them concurrently
     * @notice Generates unique filenames using UUID to prevent naming conflicts
     */
    const uploadPromises = imageFiles.map(async imageFile => {
      // Extract base64 data from data URL (remove "data:image/type;base64," prefix)
      const base64Data = imageFile.dataUrl.split(",")[1];

      // Convert base64 to buffer for file creation
      const buffer = Buffer.from(base64Data, "base64");

      // Generate unique filename to prevent conflicts
      const newFileName = `${uuidv4()}-${imageFile.fileName}`;

      // Create File object for Pinata upload
      const file = new File([buffer], newFileName, { type: imageFile.fileType });

      // Upload to IPFS and return the IPFS URI
      const uploadResult = await pinata.upload.public.file(file);
      return `ipfs://${uploadResult.cid.toString()}`;
    });

    /**
     * @dev Wait for all image uploads to complete
     * @notice Returns array of IPFS URIs for all uploaded images
     */
    const imageUris = await Promise.all(uploadPromises);

    // ============ Metadata Generation ============

    /**
     * @dev Transform dynamic asset details into standardized attributes format
     * @notice Converts camelCase field names to human-readable labels
     * @notice Example: "seriesTitle" becomes "Series Title"
     */
    const atribut = Object.entries(assetDetails).map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()),
      value: String(value),
    }));

    /**
     * @dev Create complete metadata object following NFT metadata standards
     * @notice Includes all asset information, images, and attributes in standardized format
     */
    const metadata = {
      name: generalInfo.assetName,
      shortDescription: generalInfo.shortDescription,
      description: generalInfo.description,
      type: generalInfo.assetType,
      thumbnail: imageUris[0], // First image used as primary thumbnail
      imageUri: imageUris, // Array of all uploaded image URIs
      attributes: atribut, // Formatted asset-specific attributes
    };

    // ============ Metadata File Creation and Upload ============

    /**
     * @dev Generate filename for metadata JSON file
     * @notice Replaces spaces with hyphens for URL-safe filename
     */
    const metadataFileName = `${generalInfo.assetName.replace(/\s+/g, "-")}-metadata.json`;

    /**
     * @dev Convert metadata object to formatted JSON string
     * @notice Uses 2-space indentation for readable JSON structure
     */
    const metadataString = JSON.stringify(metadata, null, 2);

    /**
     * @dev Create buffer and File object for metadata upload
     * @notice Prepares metadata for IPFS storage via Pinata
     */
    const metadataBuffer = Buffer.from(metadataString);
    const metadataFile = new File([metadataBuffer], metadataFileName, { type: "application/json" });

    /**
     * @dev Upload metadata file to IPFS
     * @notice Returns the final IPFS URI for the complete asset metadata
     */
    const metadataUpload = await pinata.upload.public.file(metadataFile);
    const metadataUri = `ipfs://${metadataUpload.cid.toString()}`;

    // ============ Success Response ============

    /**
     * @dev Return successful response with metadata URI
     * @notice This URI will be stored in the smart contract proposal
     */
    return NextResponse.json({ success: true, metadataUri: metadataUri }, { status: 200 });
  } catch (error) {
    // ============ Error Handling ============

    /**
     * @dev Handle any errors that occur during the submission process
     * @notice Provides clean error messages for client consumption
     * @notice Logs errors for debugging while returning user-friendly messages
     */
    const errorMessage = error instanceof Error ? error.message : "An error occurred on the server.";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
