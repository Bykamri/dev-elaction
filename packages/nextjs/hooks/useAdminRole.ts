import { useAccount, useReadContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

export const useAdminRole = () => {
  const { address } = useAccount();
  const { data: deployedContractData } = useDeployedContractInfo("AuctionFactory");

  // Get DEFAULT_ADMIN_ROLE hash
  const { data: defaultAdminRole } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "DEFAULT_ADMIN_ROLE",
    query: {
      enabled: !!deployedContractData && !!address,
    },
  });

  // Check if current address has admin role
  const { data: hasAdminRole } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "hasRole",
    args: [defaultAdminRole, address],
    query: {
      enabled: !!deployedContractData && !!address && !!defaultAdminRole,
    },
  });

  // Check if address is admin/deployer
  const isAdmin = () => {
    if (!address || !deployedContractData || hasAdminRole === undefined) return false;
    return hasAdminRole as boolean;
  };

  // Check if address is deployer (contract owner) - same as admin in this case
  const isDeployer = () => {
    if (!address || !deployedContractData || hasAdminRole === undefined) return false;
    return hasAdminRole as boolean;
  };

  return {
    address,
    isAdmin: isAdmin(),
    isDeployer: isDeployer(),
    isConnected: !!address,
    hasAdminRole: hasAdminRole as boolean,
  };
};
