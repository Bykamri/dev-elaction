"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { erc20Abi } from "~~/contracts/erc20Abi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [idrxBalance, setIdrxBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get IDRX contract
  const { data: idrxContract } = useScaffoldContract({ contractName: "IDRX" });

  // IDRX token address for different networks
  const DEPLOYED_IDRX_ADDRESS = "0x3BA691f5591aD777Cc4769306d9eA4767a0B6DB5"; // Lisk Sepolia
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const IDRX_TOKEN_ADDRESS = isLocalhost ? idrxContract?.address : DEPLOYED_IDRX_ADDRESS;

  useEffect(() => {
    if (!address || !isConnected || !publicClient) return;

    const fetchBalances = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get ETH balance
        const ethBalanceWei = await publicClient.getBalance({ address });
        const ethBalanceFormatted = formatEther(ethBalanceWei);
        setEthBalance(ethBalanceFormatted);

        // Get IDRX balance
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
            console.warn("Failed to fetch IDRX balance:", err);
            setIdrxBalance("0");
          }
        }
      } catch (err) {
        console.error("Failed to fetch wallet balances:", err);
        setError("Failed to load wallet balances");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [address, isConnected, publicClient, IDRX_TOKEN_ADDRESS]);

  const refreshBalances = async () => {
    if (!address || !isConnected || !publicClient) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get ETH balance
      const ethBalanceWei = await publicClient.getBalance({ address });
      const ethBalanceFormatted = formatEther(ethBalanceWei);
      setEthBalance(ethBalanceFormatted);

      // Get IDRX balance
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
          console.warn("Failed to fetch IDRX balance:", err);
          setIdrxBalance("0");
        }
      }
    } catch (err) {
      console.error("Failed to refresh wallet balances:", err);
      setError("Failed to refresh wallet balances");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ethBalance,
    idrxBalance,
    isLoading,
    error,
    refreshBalances,
  };
};
