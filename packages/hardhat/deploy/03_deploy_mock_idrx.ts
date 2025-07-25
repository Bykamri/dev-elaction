import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * @title Mock IDRX Token Deployment Script
 * @dev Conditional deployment script for the Mock IDRX ERC20 token
 * @notice This script deploys a mock IDRX token only on development and testnet environments
 * @notice The mock token provides liquidity for testing auction bidding functionality
 * @notice In production, this would be replaced with the actual IDRX token contract
 */

/**
 * @dev Main deployment function for the Mock IDRX token contract
 * @param hre Hardhat Runtime Environment containing deployment utilities and network information
 * @returns Promise that resolves when deployment is complete (or skipped)
 * @notice This function will:
 *   1. Check if the current network is a development/test environment
 *   2. Deploy the IDRX mock token contract if on allowed networks
 *   3. Skip deployment on production networks where real IDRX should be used
 *   4. Provide 1 trillion tokens to the deployer for testing purposes
 */
const deployMockIDRX: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Extract deployment utilities and network information
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { network } = hre;

  // Define networks where mock IDRX should be deployed
  const allowedNetworks = ["localhost", "hardhat", "liskSepolia"];

  // Only deploy on development and testnet environments
  if (allowedNetworks.includes(network.name)) {
    console.log(`🚀 Deploying Mock IDRX token to ${network.name} network...`);

    // Deploy the IDRX mock token contract
    await deploy("IDRX", {
      from: deployer, // Account that will deploy and receive initial token supply
      args: [], // No constructor arguments needed
      log: true, // Enable deployment logging
      // Note: Contract constructor automatically mints 1 trillion tokens to deployer
    });

    console.log("✅ Mock IDRX token deployed successfully");
  } else {
    console.log(`⏭️  Skipping Mock IDRX deployment on ${network.name} (production network)`);
  }
};

export default deployMockIDRX;

// Deployment configuration
deployMockIDRX.tags = ["IDRX"]; // Tag for selective deployment of mock token
