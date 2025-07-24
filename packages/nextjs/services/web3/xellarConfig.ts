import { defaultConfig } from "@xellar/kit";
import { Chain } from "viem";
import { mainnet } from "viem/chains";
import { Config } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";

const { targetNetworks } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

/**
 * Xellar Kit configuration with error handling for production
 */
export const createXellarConfig = (): Config => {
  const xellarAppId = process.env.NEXT_PUBLIC_XELLAR_APP_ID;
  const xellarEnv = process.env.NEXT_PUBLIC_XELLAR_ENV as "sandbox" | "production";
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

  // Validate required environment variables
  if (!xellarAppId || xellarAppId === "demo-app-id-for-testing") {
    console.warn("Xellar App ID not configured properly. Please set NEXT_PUBLIC_XELLAR_APP_ID");
  }

  if (!walletConnectProjectId) {
    console.warn("WalletConnect Project ID not configured. Please set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID");
  }

  try {
    const config = defaultConfig({
      appName: "Elaction - Decentralized Auction Platform",
      walletConnectProjectId: walletConnectProjectId || scaffoldConfig.walletConnectProjectId,
      xellarAppId: xellarAppId || scaffoldConfig.xellarAppId,
      xellarEnv: xellarEnv || scaffoldConfig.xellarEnv,
      ssr: true,
      chains: enabledChains as any,
    }) as Config;

    return config;
  } catch (error) {
    console.error("Failed to create Xellar config:", error);
    throw error;
  }
};

export const wagmiConnectors = createXellarConfig();
