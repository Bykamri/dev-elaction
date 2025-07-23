"use client";

import { ShieldAlert } from "lucide-react";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export const ConnectWalletGuard = ({ pageName }: { pageName: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <ShieldAlert className="w-16 h-16 text-warning mb-4" />
      <h2 className="text-2xl font-bold">Akses Terbatas</h2>
      <p className="max-w-md text-base-content/70 mt-2 mb-6">
        Anda harus menghubungkan dompet Anda untuk mengakses halaman {pageName}.
      </p>
      <RainbowKitCustomConnectButton />
    </div>
  );
};
