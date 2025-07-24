import { enabledChains } from "./wagmiConnectors";
import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import scaffoldConfig from "~~/scaffold.config";

/**
 * Fallback wagmi configuration without Xellar Kit
 * Used when Xellar Kit fails to initialize
 */
export const fallbackWagmiConfig = createConfig({
  chains: enabledChains as any,
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId: scaffoldConfig.walletConnectProjectId,
      metadata: {
        name: "Elaction",
        description: "A decentralized auction platform for high value assets",
        url: typeof window !== "undefined" ? window.location.origin : "https://dev-elaction.vercel.app",
        icons: ["/logo.svg"],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    // Add other chains as needed
    ...enabledChains.reduce((acc, chain) => {
      acc[chain.id] = http();
      return acc;
    }, {} as any),
  },
  ssr: true,
});
