import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * @title RWA NFT Deployment Script
 * @dev Deployment script for the RwaNft contract using Hardhat Deploy
 * @notice This script deploys the Real World Assets NFT contract as the first step in the deployment sequence
 * @notice The RwaNft contract will be used to mint NFTs for approved auction proposals
 */

/**
 * @dev Main deployment function for the RwaNft contract
 * @param hre Hardhat Runtime Environment containing deployment utilities and network information
 * @returns Promise that resolves when deployment is complete
 * @notice This function will:
 *   1. Deploy the RwaNft contract with no constructor arguments
 *   2. Set the deployer as the initial admin and minter
 *   3. Log deployment details to the console
 *   4. Save deployment artifacts for later use by other scripts
 */
const deployRwaNft: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Extract the deployer account from named accounts configuration
  const { deployer } = await hre.getNamedAccounts();

  // Get the deploy function from hardhat-deploy plugin
  const { deploy } = hre.deployments;

  // Deploy the RwaNft contract
  await deploy("RwaNft", {
    from: deployer, // Account that will deploy and own the contract
    args: [], // No constructor arguments required
    log: true, // Enable logging of deployment details
    // Note: The contract constructor will automatically grant DEFAULT_ADMIN_ROLE
    // and MINTER_ROLE to the deployer address
  });
};

export default deployRwaNft;

// Tags for selective deployment - allows running specific deployment scripts
deployRwaNft.tags = ["RwaNft"];
