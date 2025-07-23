"use client";

import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@xellar/kit";
import { Wallet } from "lucide-react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import { Button } from "~~/components/ui/button";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Xellar Kit Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const { targetNetwork } = useTargetNetwork();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  return (
    <ConnectButton.Custom>
      {({ isConnected: xellarConnected, openConnectModal }) => {
        const connected = xellarConnected && isConnected;
        const blockExplorerAddressLink = address ? getBlockExplorerAddressLink(targetNetwork, address) : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="sm"
                    onClick={openConnectModal}
                    type="button"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                );
              }

              if (chainId !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <>
                  <AddressInfoDropdown
                    address={address as Address}
                    displayName={address?.slice(0, 6) + "..." + address?.slice(-4)}
                    ensAvatar={undefined}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                  />
                </>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
