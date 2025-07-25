import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * @title Auction Factory Deployment Script
 * @dev Deployment script for the AuctionFactory contract with automatic permission setup
 * @notice This script deploys the AuctionFactory and configures it to work with the RwaNft contract
 * @notice Automatically grants MINTER_ROLE to the factory for NFT creation during auction approval
 */

/**
 * @dev Main deployment function for the AuctionFactory contract
 * @param hre Hardhat Runtime Environment containing deployment utilities and network information
 * @returns Promise that resolves when deployment and setup is complete
 * @notice This function will:
 *   1. Deploy the AuctionFactory contract with RwaNft address as constructor argument
 *   2. Grant MINTER_ROLE to the factory contract on the RwaNft contract
 *   3. Verify the permission was granted successfully
 *   4. Log deployment status and addresses
 */
const deployAuctionFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Extract deployer account and deployment utilities
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // Get signer for transaction execution
  const deployerSigner = await hre.ethers.getSigner(deployer);

  // Get the previously deployed RwaNft contract
  const rwaNftDeployment = await get("RwaNft");
  const rwaNft = await hre.ethers.getContractAt("RwaNft", rwaNftDeployment.address, deployerSigner);
  console.log(`RwaNft contract found at: ${await rwaNft.getAddress()}`);

  // Deploy AuctionFactory with RwaNft address as constructor argument
  await deploy("AuctionFactory", {
    from: deployer,
    args: [rwaNftDeployment.address], // Pass RwaNft address to constructor
    log: true,
  });

  // Get deployed AuctionFactory contract instance
  const auctionFactory = await hre.ethers.getContract<Contract>("AuctionFactory", deployer);
  const auctionFactoryAddress = await auctionFactory.getAddress();
  console.log(`AuctionFactory deployed at: ${auctionFactoryAddress}`);

  // Get MINTER_ROLE identifier from RwaNft contract
  const minterRole = await rwaNft.MINTER_ROLE();

  // Check if AuctionFactory already has MINTER_ROLE
  let hasPermission = await rwaNft.hasRole(minterRole, auctionFactoryAddress);
  console.log(`AuctionFactory MINTER_ROLE status: ${hasPermission ? "✅ Already granted" : "❌ Not granted"}`);

  // Grant MINTER_ROLE if not already granted
  if (!hasPermission) {
    console.log("Granting MINTER_ROLE to AuctionFactory...");
    const grantRoleTx = await rwaNft.grantRole(minterRole, auctionFactoryAddress);
    await grantRoleTx.wait();

    // Verify the role was granted successfully
    hasPermission = await rwaNft.hasRole(minterRole, auctionFactoryAddress);
    if (!hasPermission) {
      throw new Error("Failed to grant MINTER_ROLE to AuctionFactory");
    }
    console.log("✅ MINTER_ROLE granted successfully");
  }

  console.log("✅ AuctionFactory deployment and setup completed");
};

export default deployAuctionFactory;

// Deployment configuration
deployAuctionFactory.tags = ["AuctionFactory"]; // Tag for selective deployment
deployAuctionFactory.dependencies = ["RwaNft"]; // Requires RwaNft to be deployed first
