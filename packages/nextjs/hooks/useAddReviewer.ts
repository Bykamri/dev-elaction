import { useState } from "react";
import { useWriteContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

export const useAddReviewer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: deployedContractData } = useDeployedContractInfo("AuctionFactory");
  const { writeContractAsync } = useWriteContract();

  const addReviewer = async (reviewerAddress: string) => {
    if (!deployedContractData) {
      throw new Error("Contract not found");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate address format
      if (!reviewerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address format");
      }

      const txHash = await writeContractAsync({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "addReviewer",
        args: [reviewerAddress as `0x${string}`],
      });

      return { txHash, success: true };
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to add reviewer";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addReviewer,
    isLoading,
    error,
    setError,
  };
};
