"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { erc20Abi } from "~~/contracts/erc20Abi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

export interface UserProfile {
  address: string;
  ensName?: string;
  avatarUrl?: string;
  joinedDate: Date;
  ethBalance: string;
  idrxBalance: string;
  auctionsWon: number;
  auctionsCreated: number;
  totalSpent: string;
  totalEarned: string;
}

export interface UserTransaction {
  id: string;
  type: "bid" | "win" | "sale" | "deposit" | "withdrawal";
  amount: string;
  currency: "ETH" | "IDRX";
  auctionId?: string;
  auctionTitle?: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  txHash: string;
}

export const useUserProfile = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions] = useState<UserTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get IDRX contract
  const { data: idrxContract } = useScaffoldContract({ contractName: "IDRX" });
  const { data: auctionFactoryContract } = useScaffoldContract({ contractName: "AuctionFactory" });

  // IDRX token address for different networks
  const DEPLOYED_IDRX_ADDRESS = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661"; // Lisk Sepolia
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const IDRX_TOKEN_ADDRESS = isLocalhost ? idrxContract?.address : DEPLOYED_IDRX_ADDRESS;

  const getUserStats = useCallback(
    async (userAddress: string) => {
      // Default stats
      let stats = {
        auctionsWon: 0,
        auctionsCreated: 0,
        totalSpent: "0",
        totalEarned: "0",
      };

      if (!auctionFactoryContract || !publicClient) return stats;

      try {
        // Get total number of proposals to iterate through
        const proposalsCount = await auctionFactoryContract.read.getProposalsCount();

        let auctionsCreated = 0;
        const auctionsWon = 0;
        const totalSpent = BigInt(0);
        const totalEarned = BigInt(0);

        // Iterate through all proposals to find user's activity
        for (let i = 0; i < proposalsCount; i++) {
          try {
            const proposal = await auctionFactoryContract.read.proposals([BigInt(i)]);
            const [proposer, , , , , auctionAddress] = proposal;

            // Check if user created this auction
            if (proposer.toLowerCase() === userAddress.toLowerCase()) {
              auctionsCreated++;
            }

            // If auction is live or finished, check for bids
            if (auctionAddress && auctionAddress !== "0x0000000000000000000000000000000000000000") {
              // Here you would check auction contract for wins and spending
              // This is a simplified version - you'd need to implement auction contract reading
            }
          } catch (err) {
            console.warn(`Failed to fetch proposal ${i}:`, err);
          }
        }

        stats = {
          auctionsWon,
          auctionsCreated,
          totalSpent: formatEther(totalSpent),
          totalEarned: formatEther(totalEarned),
        };
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
      }

      return stats;
    },
    [auctionFactoryContract, publicClient],
  );

  useEffect(() => {
    if (!address || !isConnected || !publicClient) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get ETH balance
        const ethBalanceWei = await publicClient.getBalance({ address });
        const ethBalance = formatEther(ethBalanceWei);

        // Get IDRX balance
        let idrxBalance = "0";
        if (IDRX_TOKEN_ADDRESS) {
          try {
            const idrxBalanceWei = await publicClient.readContract({
              address: IDRX_TOKEN_ADDRESS,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [address],
            });
            idrxBalance = formatEther(idrxBalanceWei as bigint);
          } catch (err) {
            console.warn("Failed to fetch IDRX balance:", err);
          }
        }

        // Get user statistics from blockchain
        const stats = await getUserStats(address);

        // Try to get ENS name
        let ensName: string | undefined;
        try {
          const ensResult = await publicClient.getEnsName({ address });
          ensName = ensResult || undefined;
        } catch {
          // ENS not available or failed to resolve
        }

        const userProfile: UserProfile = {
          address,
          ensName,
          joinedDate: new Date(), // In real app, you'd track this
          ethBalance,
          idrxBalance,
          ...stats,
        };

        setProfile(userProfile);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [address, isConnected, publicClient, IDRX_TOKEN_ADDRESS, getUserStats]);

  const refreshProfile = useCallback(() => {
    if (address && isConnected && publicClient) {
      const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const ethBalanceWei = await publicClient.getBalance({ address });
          const ethBalance = formatEther(ethBalanceWei);

          let idrxBalance = "0";
          if (IDRX_TOKEN_ADDRESS) {
            try {
              const idrxBalanceWei = await publicClient.readContract({
                address: IDRX_TOKEN_ADDRESS,
                abi: erc20Abi,
                functionName: "balanceOf",
                args: [address],
              });
              idrxBalance = formatEther(idrxBalanceWei as bigint);
            } catch (err) {
              console.warn("Failed to fetch IDRX balance:", err);
            }
          }

          const stats = await getUserStats(address);

          setProfile(prev =>
            prev
              ? {
                  ...prev,
                  ethBalance,
                  idrxBalance,
                  ...stats,
                }
              : null,
          );
        } catch (err) {
          console.error("Failed to refresh profile:", err);
          setError("Failed to refresh profile data");
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfile();
    }
  }, [address, isConnected, publicClient, IDRX_TOKEN_ADDRESS, getUserStats]);

  return {
    profile,
    transactions,
    isLoading,
    error,
    refreshProfile,
  };
};
