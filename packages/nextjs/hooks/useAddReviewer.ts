/**
 * useAddReviewer Hook
 *
 * A custom React hook for managing reviewer additions to the auction platform.
 * Provides functionality to add new reviewers to the AuctionFactory contract
 * with comprehensive validation, error handling, and transaction management.
 * This hook is typically used by admin users to manage the reviewer ecosystem.
 *
 * Key Features:
 * - Ethereum address validation with regex pattern matching
 * - Smart contract interaction with AuctionFactory
 * - Loading state management during transactions
 * - Comprehensive error handling and reporting
 * - Transaction hash return for tracking
 * - Type-safe contract interactions with wagmi
 *
 * Contract Integration:
 * - Interacts with deployed AuctionFactory contract
 * - Calls addReviewer function with proper ABI binding
 * - Automatic contract address resolution
 * - Transaction confirmation handling
 *
 * Error Handling:
 * - Address format validation (0x + 40 hex characters)
 * - Contract deployment verification
 * - Transaction failure recovery
 * - User-friendly error messaging
 *
 * Usage Example:
 * ```tsx
 * const { addReviewer, isLoading, error } = useAddReviewer();
 *
 * const handleAddReviewer = async () => {
 *   try {
 *     const result = await addReviewer("0x1234...");
 *     console.log("Transaction hash:", result.txHash);
 *   } catch (err) {
 *     console.error("Failed to add reviewer:", err.message);
 *   }
 * };
 * ```
 *
 * @returns {Object} Hook return object with reviewer management functions
 *
 * @component
 * @category Hooks
 * @subcategory Admin
 */
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

/**
 * useAddReviewer - Reviewer Management Hook
 *
 * Provides comprehensive functionality for adding new reviewers to the
 * auction platform. Handles contract interactions, validation, and
 * transaction management with proper error handling and state tracking.
 *
 * @returns {Object} Hook utilities and state
 * @returns {Function} addReviewer - Function to add a new reviewer
 * @returns {boolean} isLoading - Loading state during transactions
 * @returns {string|null} error - Current error message if any
 * @returns {Function} setError - Function to manually set error state
 */
export const useAddReviewer = () => {
  // Transaction loading state management
  const [isLoading, setIsLoading] = useState(false);

  // Error state management for user feedback
  const [error, setError] = useState<string | null>(null);

  // Contract deployment information and ABI access using object parameter
  const { data: deployedContractData } = useDeployedContractInfo({ contractName: "AuctionFactory" });

  // Wagmi hook for contract write operations
  const { writeContractAsync } = useWriteContract();

  /**
   * Adds a new reviewer to the auction platform
   *
   * Validates the provided Ethereum address, interacts with the AuctionFactory
   * contract to add the reviewer, and manages transaction state throughout
   * the process. Provides comprehensive error handling and user feedback.
   *
   * Validation Steps:
   * 1. Verify contract deployment and availability
   * 2. Validate Ethereum address format (0x + 40 hex characters)
   * 3. Execute smart contract transaction
   * 4. Handle success/failure scenarios
   *
   * @param {string} reviewerAddress - Valid Ethereum address (0x format)
   * @returns {Promise<{txHash: string, success: boolean}>} Transaction result
   * @throws {Error} When validation fails or transaction errors occur
   */
  const addReviewer = async (reviewerAddress: string) => {
    // Verify contract deployment before proceeding
    if (!deployedContractData) {
      throw new Error("Contract not found");
    }

    // Initialize transaction state
    setIsLoading(true);
    setError(null);

    try {
      // Validate Ethereum address format using regex pattern
      if (!reviewerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Execute contract interaction to add reviewer
      const txHash = await writeContractAsync({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "addReviewer",
        args: [reviewerAddress as `0x${string}`],
      });

      // Return successful transaction details
      return { txHash, success: true };
    } catch (err: any) {
      // Handle and propagate errors with user-friendly messages
      const errorMessage = err?.message || "Failed to add reviewer";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      // Always clean up loading state
      setIsLoading(false);
    }
  };

  // Return hook interface with all necessary functions and state
  return {
    /** Function to add a new reviewer with validation and error handling */
    addReviewer,
    /** Loading state indicating if a transaction is in progress */
    isLoading,
    /** Current error message, null if no error */
    error,
    /** Function to manually clear or set error state */
    setError,
  };
};
