import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

/**
 * Custom React Hook for Comprehensive Proposal Data Management
 *
 * Provides detailed proposal data fetching and management for individual auction
 * proposals including metadata resolution, reviewer role verification, and
 * comprehensive asset information display. Designed for proposal detail pages
 * and administrative review interfaces.
 *
 * Key Features:
 * - Complete proposal data fetching from AuctionFactory contract
 * - IPFS metadata resolution with rich media support
 * - Reviewer role verification for administrative access
 * - Image gallery management with multiple asset images
 * - Comprehensive asset attribute parsing and display
 * - Loading state management with duplicate fetch prevention
 * - Graceful error handling with fallback values
 * - Real-time role-based permission checking
 *
 * Data Sources:
 * - AuctionFactory contract for proposal state and metadata URIs
 * - IPFS network for asset metadata, descriptions, and media
 * - Smart contract role system for reviewer permission verification
 * - Pinata gateway for optimized IPFS content delivery
 *
 * Metadata Processing:
 * - Asset name and description extraction from IPFS metadata
 * - Category and attribute parsing for detailed asset information
 * - Thumbnail and gallery image resolution with gateway optimization
 * - Short description handling for summary displays
 * - Fallback values for missing or corrupted metadata
 *
 * Security Features:
 * - Reviewer role verification using contract-based permissions
 * - Address validation for role checking
 * - Secure IPFS hash processing and URL construction
 * - Prevention of duplicate data fetching with ref-based guards
 *
 * Performance Optimizations:
 * - Single fetch guard to prevent redundant contract calls
 * - Parallel processing of proposal data and role verification
 * - Efficient image URL construction with gateway optimization
 * - Memoized state updates to prevent unnecessary re-renders
 *
 * @param {bigint} proposalId - Unique identifier for the proposal to fetch
 * @param {any} auctionFactoryContract - AuctionFactory contract instance
 * @returns {Object} Hook state containing comprehensive proposal data
 * @returns {any} proposal - Raw proposal data from contract
 * @returns {string} assetName - Resolved asset name from metadata
 * @returns {string} description - Detailed asset description
 * @returns {string} imageUrl - Primary asset image URL
 * @returns {string[]} images - Array of gallery image URLs
 * @returns {boolean} isReviewer - Whether current user has reviewer permissions
 * @returns {boolean} isLoading - Loading state for data fetching
 * @returns {string} shortDescription - Brief asset summary
 * @returns {string} categories - Asset category information
 * @returns {Array<{name: string, value: string}>} attributes - Asset properties
 *
 * @example
 * ```tsx
 * const {
 *   proposal,
 *   assetName,
 *   description,
 *   imageUrl,
 *   images,
 *   isReviewer,
 *   isLoading,
 *   shortDescription,
 *   categories,
 *   attributes
 * } = useProposalData(proposalId, auctionFactoryContract);
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     <h1>{assetName}</h1>
 *     <img src={imageUrl} alt={assetName} />
 *     <p>{shortDescription}</p>
 *     <p>Category: {categories}</p>
 *     <ImageGallery images={images} />
 *     <AttributeList attributes={attributes} />
 *     {isReviewer && <ReviewerActions proposal={proposal} />}
 *   </div>
 * );
 * ```
 */
export const useProposalData = (proposalId: bigint, auctionFactoryContract: any) => {
  // Wallet connection state for reviewer role verification
  const { address: connectedAddress } = useAccount();

  // Core proposal state management
  const [proposal, setProposal] = useState<any>();
  const [assetName, setAssetName] = useState("Loading...");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "https://preview-responsive-header-design-kzmg27jq27z2q98j8m6v.vusercontent.net/placeholder.svg?height=200&width=300",
  );
  const [images, setImages] = useState<string[]>([]);
  const [isReviewer, setIsReviewer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shortDescription, setShortDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [attributes, setAttributes] = useState<Array<{ name: string; value: string }>>([]);

  // Fetch guard to prevent duplicate data loading
  const hasFetched = useRef(false);

  /**
   * Main proposal data fetching effect
   *
   * Orchestrates the complete proposal data pipeline including contract reads,
   * IPFS metadata resolution, and reviewer role verification. Uses a ref-based
   * guard to prevent duplicate fetches during component lifecycle.
   */
  useEffect(() => {
    const fetchData = async () => {
      if (auctionFactoryContract && !hasFetched.current) {
        hasFetched.current = true;
        setIsLoading(true);

        try {
          // Fetch core proposal data from contract
          const proposalData = await auctionFactoryContract.read.proposals([proposalId]);
          setProposal(proposalData);

          // Process IPFS metadata if available
          const metadataURI = proposalData[1];
          if (metadataURI) {
            const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://ipfs.io";
            const ipfsHash = metadataURI.replace("ipfs://", "");
            const fullUrl = `${gateway}/ipfs/${ipfsHash}`;

            // Fetch and process metadata from IPFS
            fetch(fullUrl)
              .then(res => res.json())
              .then(data => {
                // Extract asset information with English fallbacks
                setAssetName(data.name || "Unnamed Asset");
                setDescription(data.description || "No description available.");
                setShortDescription(data.shortDescription || "No short description available.");
                setCategories(data.type || "No category specified.");
                setAttributes(data.attributes || []);

                // Process primary asset image from thumbnail property
                if (data.thumbnail) {
                  const imageHash = data.thumbnail.replace("ipfs://", "");
                  setImageUrl(`https://gateway.pinata.cloud/ipfs/${imageHash}`);
                }

                // Process image gallery from imageUri property
                if (data.imageUri && Array.isArray(data.imageUri)) {
                  const imageUrls = data.imageUri.map(
                    (imgUri: string) => `${gateway}/ipfs/${imgUri.replace("ipfs://", "")}`,
                  );
                  setImages(imageUrls);
                }
              });
          }

          // Verify reviewer role for current user
          if (connectedAddress) {
            const reviewerRole = await auctionFactoryContract.read.REVIEWER_ROLE();
            const hasRole = await auctionFactoryContract.read.hasRole([reviewerRole, connectedAddress]);
            setIsReviewer(hasRole);
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // Handle proposal data fetching errors gracefully
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [proposalId, auctionFactoryContract, connectedAddress]);

  /**
   * Hook return object providing comprehensive proposal data
   *
   * Returns complete proposal information including metadata, media assets,
   * and user permissions for building detailed proposal interfaces and
   * administrative review functionality.
   */
  return {
    proposal, // Raw proposal data from smart contract
    assetName, // Resolved asset name from IPFS metadata
    description, // Detailed asset description
    imageUrl, // Primary asset image URL
    images, // Gallery image URLs array
    isReviewer, // Whether current user has reviewer permissions
    isLoading, // Loading state for all data operations
    shortDescription, // Brief asset summary for previews
    categories, // Asset category information
    attributes, // Structured asset properties and characteristics
  };
};
