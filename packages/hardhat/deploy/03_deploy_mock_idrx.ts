import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMockIDRX: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { network } = hre;

  if (network.name === "localhost" || network.name === "hardhat" || network.name === "liskSepolia") {
    console.log(`🚀 Deploying MockIDRX to ${network.name}...`);
    await deploy("IDRX", {
      from: deployer,
      args: [],
      log: true,
    });
  }
};

export default deployMockIDRX;
deployMockIDRX.tags = ["IDRX"];
