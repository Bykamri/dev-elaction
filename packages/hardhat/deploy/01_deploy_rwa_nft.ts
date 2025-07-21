import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployRwaNft: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("RwaNft", {
    from: deployer,
    args: [],
    log: true,
  });
};

export default deployRwaNft;
deployRwaNft.tags = ["RwaNft"];
