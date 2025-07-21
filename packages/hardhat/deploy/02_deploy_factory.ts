import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployAuctionFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // 1. Dapatkan objek Signer dari alamat deployer
  const deployerSigner = await hre.ethers.getSigner(deployer);

  // 2. Dapatkan kontrak RwaNft dan hubungkan dengan Signer
  const rwaNftDeployment = await get("RwaNft");
  // Gunakan getContractAt dengan Signer, bukan string
  const rwaNft = await hre.ethers.getContractAt("RwaNft", rwaNftDeployment.address, deployerSigner);
  console.log(`--- Menggunakan RwaNft di alamat: ${await rwaNft.getAddress()}`);

  // 3. Deploy AuctionFactory
  await deploy("AuctionFactory", {
    from: deployer,
    args: [rwaNftDeployment.address],
    log: true,
  });
  const auctionFactory = await hre.ethers.getContract<Contract>("AuctionFactory", deployer);
  const auctionFactoryAddress = await auctionFactory.getAddress();
  console.log(`--- AuctionFactory di-deploy di alamat: ${auctionFactoryAddress}`);

  // --- BAGIAN PENTING: PEMBERIAN & VERIFIKASI IZIN ---
  const minterRole = await rwaNft.MINTER_ROLE();

  console.log("Memverifikasi izin SEBELUM...");
  let hasPermission = await rwaNft.hasRole(minterRole, auctionFactoryAddress);
  console.log(`--> Apakah AuctionFactory sudah punya MINTER_ROLE?: ${hasPermission}`);

  if (!hasPermission) {
    console.log("Izin belum ada. Memberikan MINTER_ROLE sekarang...");
    const grantRoleTx = await rwaNft.grantRole(minterRole, auctionFactoryAddress);
    await grantRoleTx.wait();
    console.log("✅ Transaksi grantRole berhasil dikirim.");
  }

  console.log("Memverifikasi izin SESUDAH...");
  hasPermission = await rwaNft.hasRole(minterRole, auctionFactoryAddress);
  console.log(`--> Apakah AuctionFactory sekarang punya MINTER_ROLE?: ${hasPermission}`);

  if (!hasPermission) {
    throw new Error("GAGAL memberikan MINTER_ROLE setelah transaksi!");
  }

  console.log("✅ Setup Izin Selesai.");
};

export default deployAuctionFactory;
deployAuctionFactory.tags = ["AuctionFactory"];
deployAuctionFactory.dependencies = ["RwaNft"];
