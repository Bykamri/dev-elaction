"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { erc20Abi } from "~~/contracts/erc20Abi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Custom React Hook for Wallet Balance Management
 *
 * Provides comprehensive wallet balance tracking for both native ETH and IDRX tokens
 * with automatic updates, manual refresh capabilities, and proper error handling.
 * Supports both localhost development and deployed environments with appropriate
 * contract addresses.
 *
 * Key Features:
 * - Real-time ETH balance monitoring using Ethereum public client
 * - IDRX ERC-20 token balance tracking with contract integration
 * - Automatic balance updates on wallet address or connection changes
 * - Manual refresh functionality for user-triggered updates
 * - Network-aware contract address resolution (localhost vs deployed)
 * - Comprehensive error handling with graceful fallbacks
 * - Loading states for optimal user experience
 * - Proper decimal formatting using viem's formatEther utility
 *
 * Dependencies:
 * - wagmi: Wallet connection and public client access
 * - viem: Ethereum utilities and formatting functions
 * - Custom erc20Abi: ERC-20 token ABI for contract interactions
 * - ScaffoldContract: Local contract data access
 *
 * Network Support:
 * - Localhost: Uses dynamically resolved contract addresses from deployment
 * - Lisk Sepolia: Uses hardcoded deployed contract address
 *
 * Error Handling:
 * - Graceful IDRX balance failures (falls back to "0")
 * - User-friendly error messages for general failures
 * - Maintains application stability during network issues
 *
 * @returns {Object} Hook state and control functions
 * @returns {string} ethBalance - Formatted ETH balance in human-readable format
 * @returns {string} idrxBalance - Formatted IDRX token balance
 * @returns {boolean} isLoading - Loading state indicator
 * @returns {string|null} error - Error message if balance fetch fails
 * @returns {Function} refreshBalances - Manual balance refresh function
 *
 * @example
 * ```tsx
 * const {
 *   ethBalance,
 *   idrxBalance,
 *   isLoading,
 *   error,
 *   refreshBalances
 * } = useWalletBalance();
 *
 * // Display balances
 * <div>ETH: {ethBalance}</div>
 * <div>IDRX: {idrxBalance}</div>
 * {isLoading && <div>Loading...</div>}
 * {error && <div>Error: {error}</div>}
 * <button onClick={refreshBalances}>Refresh</button>
 * ```
 */
export const useWalletBalance = () => {
  // Wallet connection state from wagmi
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  // Balance state management with formatted string values for display
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [idrxBalance, setIdrxBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get IDRX contract data for localhost environments
  const { data: idrxContract } = useScaffoldContract({ contractName: "IDRX" });

  /**
   * Network-aware IDRX token address configuration
   *
   * Dynamically selects the appropriate contract address based on the
   * current environment. Uses deployed contract address for production
   * networks and local contract address for development.
   */
  const DEPLOYED_IDRX_ADDRESS = "0x3BA691f5591aD777Cc4769306d9eA4767a0B6DB5"; // Lisk Sepolia
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const IDRX_TOKEN_ADDRESS = isLocalhost ? idrxContract?.address : DEPLOYED_IDRX_ADDRESS;

  /**
   * Automatic balance fetching effect
   *
   * Triggers balance updates whenever the wallet address, connection status,
   * public client, or IDRX token address changes. Ensures balances are always
   * current when wallet state changes.
   */
  useEffect(() => {
    if (!address || !isConnected || !publicClient) return;

    const fetchBalances = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch native ETH balance using public client
        const ethBalanceWei = await publicClient.getBalance({ address });
        const ethBalanceFormatted = formatEther(ethBalanceWei);
        setEthBalance(ethBalanceFormatted);

        // Fetch IDRX token balance if contract address is available
        if (IDRX_TOKEN_ADDRESS) {
          try {
            const idrxBalanceWei = await publicClient.readContract({
              address: IDRX_TOKEN_ADDRESS,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [address],
            });
            const idrxBalanceFormatted = formatEther(idrxBalanceWei as bigint);
            setIdrxBalance(idrxBalanceFormatted);
          } catch (err) {
            // Gracefully handle IDRX balance failures without breaking ETH balance
            setIdrxBalance("0");
          }
        }
      } catch (err) {
        // Handle general balance fetching errors
        setError("Failed to load wallet balances");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [address, isConnected, publicClient, IDRX_TOKEN_ADDRESS]);

  /**
   * Manual balance refresh function
   *
   * Provides on-demand balance updates for user-triggered refresh actions.
   * Implements the same logic as the automatic fetch but can be called
   * explicitly when needed (e.g., after transactions).
   *
   * @returns {Promise<void>} Resolves when balance refresh is complete
   */
  const refreshBalances = async () => {
    if (!address || !isConnected || !publicClient) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch updated ETH balance
      const ethBalanceWei = await publicClient.getBalance({ address });
      const ethBalanceFormatted = formatEther(ethBalanceWei);
      setEthBalance(ethBalanceFormatted);

      // Fetch updated IDRX token balance
      if (IDRX_TOKEN_ADDRESS) {
        try {
          const idrxBalanceWei = await publicClient.readContract({
            address: IDRX_TOKEN_ADDRESS,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address],
          });
          const idrxBalanceFormatted = formatEther(idrxBalanceWei as bigint);
          setIdrxBalance(idrxBalanceFormatted);
        } catch (err) {
          // Gracefully handle IDRX refresh failures
          setIdrxBalance("0");
        }
      }
    } catch (err) {
      // Handle refresh errors without breaking the application
      setError("Failed to refresh wallet balances");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Hook return object providing balance data and control functions
   *
   * Returns current wallet balance state along with refresh capability
   * for comprehensive wallet balance management throughout the application.
   */
  return {
    ethBalance, // Current ETH balance as formatted string
    idrxBalance, // Current IDRX token balance as formatted string
    isLoading, // Loading state for balance operations
    error, // Error message if balance operations fail
    refreshBalances, // Function to manually refresh all balances
  };
};
