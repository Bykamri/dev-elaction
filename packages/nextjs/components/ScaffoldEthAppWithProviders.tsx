"use client";

import { useEffect, useState } from "react";
import { Header } from "./Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { XellarKitProvider, darkTheme, lightTheme } from "@xellar/kit";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { RoleProvider } from "~~/context/RoleContext";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className={`flex flex-col min-h-screen `}>
        <Header />
        <main className="relative flex flex-col flex-1 ">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Error Boundary untuk Xellar Kit
const XellarKitWrapper = ({ children, theme }: { children: React.ReactNode; theme: any }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message.includes("Failed to fetch app config")) {
        console.error("Xellar Kit configuration error:", error.message);
        setHasError(true);
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Xellar Kit Configuration Error</h2>
        <p className="text-gray-600 mb-4">Please set up your Xellar App ID in your environment variables.</p>
        <div className="bg-gray-100 p-4 rounded-lg text-left">
          <p className="font-mono text-sm">
            1. Get your App ID from{" "}
            <a href="https://dashboard.xellar.co/" target="_blank" rel="noopener noreferrer" className="text-blue-600">
              https://dashboard.xellar.co/
            </a>
          </p>
          <p className="font-mono text-sm mt-2">2. Add to .env.local: NEXT_PUBLIC_XELLAR_APP_ID=your_app_id_here</p>
        </div>
        {children}
      </div>
    );
  }

  try {
    return <XellarKitProvider theme={theme}>{children}</XellarKitProvider>;
  } catch (error) {
    console.error("Xellar Kit Provider error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Wallet Connection Error</h2>
        <p className="text-gray-600 mb-4">
          There was an error initializing the wallet connection. Please check your configuration.
        </p>
        {children}
      </div>
    );
  }
};

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <XellarKitWrapper theme={mounted ? (isDarkMode ? darkTheme : lightTheme) : lightTheme}>
          <RoleProvider>
            <ProgressBar height="3px" color="#2299dd" />
            <ScaffoldEthApp>{children}</ScaffoldEthApp>
          </RoleProvider>
        </XellarKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
