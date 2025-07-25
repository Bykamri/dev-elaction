/**
 * useAdminRole Hook
 *
 * A comprehensive React hook for managing and checking administrative roles
 * within the auction platform. Provides real-time role verification against
 * the deployed AuctionFactory contract using role-based access control (RBAC).
 * Essential for implementing secure admin-only features and UI conditionals.
 *
 * Key Features:
 * - Real-time admin role verification via smart contract
 * - Automatic wallet connection status monitoring
 * - Role-based access control integration
 * - Contract deployment state awareness
 * - Multiple role checking utilities (admin, deployer)
 * - Reactive updates on wallet or contract changes
 *
 * Contract Integration:
 * - Reads from deployed AuctionFactory contract
 * - Uses OpenZeppelin's AccessControl DEFAULT_ADMIN_ROLE
 * - Calls hasRole function for permission verification
 * - Automatic contract address resolution
 *
 * Security Features:
 * - Fail-safe defaults (false when uncertain)
 * - Multiple validation layers
 * - Connection state verification
 * - Contract deployment validation
 *
 * Usage Examples:
 * ```tsx
 * const { isAdmin, isConnected, address } = useAdminRole();
 *
 * // Conditional rendering for admin features
 * {isAdmin && <AdminPanel />}
 *
 * // Route protection
 * if (!isAdmin) return <AccessDenied />;
 * ```
 *
 * @returns {Object} Hook return object with role verification utilities
 *
 * @component
 * @category Hooks
 * @subcategory Admin
 */
import { useAccount, useReadContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

/**
 * useAdminRole - Administrative Role Verification Hook
 *
 * Provides comprehensive administrative role checking capabilities for the
 * auction platform. Integrates with smart contract role-based access control
 * to verify user permissions and enable secure admin functionality.
 *
 * @returns {Object} Role verification utilities and state
 * @returns {string|undefined} address - Current connected wallet address
 * @returns {boolean} isAdmin - True if user has admin role
 * @returns {boolean} isDeployer - True if user has deployer privileges
 * @returns {boolean} isConnected - True if wallet is connected
 * @returns {boolean} hasAdminRole - Raw admin role status from contract
 */
export const useAdminRole = () => {
  // Get current wallet connection details
  const { address } = useAccount();

  // Access deployed AuctionFactory contract information
  const { data: deployedContractData } = useDeployedContractInfo("AuctionFactory");

  /**
   * Fetch the DEFAULT_ADMIN_ROLE identifier from the contract
   *
   * This reads the OpenZeppelin AccessControl DEFAULT_ADMIN_ROLE constant
   * which is used as the role identifier for administrative permissions.
   * The role is typically a bytes32 hash value.
   */
  const { data: defaultAdminRole } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "DEFAULT_ADMIN_ROLE",
    query: {
      // Only execute when contract is deployed and user is connected
      enabled: !!deployedContractData && !!address,
    },
  });

  /**
   * Check if the current user has the admin role
   *
   * Calls the hasRole function from OpenZeppelin's AccessControl to verify
   * if the connected address has the DEFAULT_ADMIN_ROLE. This provides
   * real-time role verification against the smart contract state.
   */
  const { data: hasAdminRole } = useReadContract({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "hasRole",
    args: [defaultAdminRole, address],
    query: {
      // Only execute when all dependencies are available
      enabled: !!deployedContractData && !!address && !!defaultAdminRole,
    },
  });

  /**
   * Determines if the current user has administrative privileges
   *
   * Performs comprehensive validation to ensure all required conditions
   * are met before confirming admin status. Uses fail-safe approach
   * returning false if any validation fails.
   *
   * @returns {boolean} True if user is confirmed admin, false otherwise
   */
  const isAdmin = () => {
    // Fail-safe: return false if any required data is missing
    if (!address || !deployedContractData || hasAdminRole === undefined) return false;
    return hasAdminRole as boolean;
  };

  /**
   * Determines if the current user has deployer privileges
   *
   * Currently mirrors admin role functionality. In future implementations,
   * this could check for specific deployer roles or permissions that
   * differ from general administrative access.
   *
   * @returns {boolean} True if user has deployer privileges, false otherwise
   */
  const isDeployer = () => {
    // Fail-safe: return false if any required data is missing
    if (!address || !deployedContractData || hasAdminRole === undefined) return false;
    return hasAdminRole as boolean;
  };

  /**
   * Hook return object containing admin role state and verification functions
   *
   * Provides comprehensive admin role management capabilities with current
   * state values and convenience functions for role verification throughout
   * the application.
   */
  return {
    address, // Current wallet address (string | undefined)
    isAdmin: isAdmin(), // Boolean result of admin privilege check
    isDeployer: isDeployer(), // Boolean result of deployer privilege check
    isConnected: !!address, // Boolean indicating wallet connection status
    hasAdminRole: hasAdminRole as boolean, // Raw role verification result from contract
  };
};
