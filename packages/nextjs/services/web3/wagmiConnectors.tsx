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
 * Xellar Kit configuration with wagmi
 */
export const wagmiConnectors = defaultConfig({
  appName: "scaffold-eth-2",
  walletConnectProjectId: scaffoldConfig.walletConnectProjectId,
  // Xellar App ID from scaffold config
  xellarAppId: scaffoldConfig.xellarAppId,
  xellarEnv: scaffoldConfig.xellarEnv,
  ssr: true, // Use this if you're using Next.js App Router
  chains: enabledChains as any,
}) as Config;
