"use client";

import { ShieldAlert } from "lucide-react";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

interface ConnectWalletGuardProps {
  pageName: string;
  children: React.ReactNode;
}

export const ConnectWalletGuard = ({ pageName, children }: ConnectWalletGuardProps) => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="w-16 h-16 text-warning mb-4" />
        <h2 className="text-2xl font-bold">Access Restricted</h2>
        <p className="max-w-md text-base-content/70 mt-2 mb-6">
          You must connect your wallet to access the {pageName} page.
        </p>
        <RainbowKitCustomConnectButton />
      </div>
    );
  }

  return <>{children}</>;
};
