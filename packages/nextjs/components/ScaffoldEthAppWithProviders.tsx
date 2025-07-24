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
import { fallbackWagmiConfig } from "~~/services/web3/fallbackConfig";
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

// Error Boundary for Xellar Kit
const XellarKitWrapper = ({ children, theme }: { children: React.ReactNode; theme: any }) => {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message.includes("Failed to fetch app config")) {
        console.error("Xellar Kit configuration error:", error.message);
        setErrorDetails(error.message);
        setHasError(true);
        setUseFallback(true);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes("Failed to fetch app config")) {
        console.error("Xellar Kit promise rejection:", event.reason);
        setErrorDetails(event.reason.message);
        setHasError(true);
        setUseFallback(true);
        event.preventDefault();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Check if required env vars are present
  const xellarAppId = process.env.NEXT_PUBLIC_XELLAR_APP_ID;
  const xellarEnv = process.env.NEXT_PUBLIC_XELLAR_ENV;

  if (!xellarAppId || xellarAppId === "demo-app-id-for-testing") {
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
          <p className="font-mono text-sm mt-2">3. Set environment: NEXT_PUBLIC_XELLAR_ENV=production</p>
          <p className="font-mono text-sm mt-2">4. Register your production domain in Xellar dashboard</p>
        </div>
        {children}
      </div>
    );
  }

  // If using fallback mode, show warning but continue
  if (useFallback) {
    console.warn("Using fallback wallet configuration due to Xellar Kit error");
    return (
      <>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> Xellar Kit failed to initialize. Using fallback wallet connection.
                {errorDetails && <span className="block mt-1 font-mono text-xs">{errorDetails}</span>}
              </p>
            </div>
          </div>
        </div>
        {children}
      </>
    );
  }

  if (hasError && !useFallback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Xellar Kit Connection Error</h2>
        <p className="text-gray-600 mb-4">Failed to connect to Xellar services. This might be due to:</p>
        <div className="bg-gray-100 p-4 rounded-lg text-left mb-4">
          <ul className="font-mono text-sm space-y-1">
            <li>• Network connectivity issues</li>
            <li>• Production domain not registered in Xellar dashboard</li>
            <li>• Invalid App ID or environment configuration</li>
            <li>• CORS or firewall blocking requests</li>
          </ul>
        </div>
        {errorDetails && (
          <div className="bg-red-50 p-3 rounded border border-red-200 mb-4">
            <p className="text-sm text-red-700 font-mono">{errorDetails}</p>
          </div>
        )}
        <div className="bg-blue-50 p-4 rounded-lg text-left mb-4">
          <p className="font-mono text-sm text-blue-800">
            Current config: App ID: {xellarAppId?.substring(0, 8)}..., Env: {xellarEnv}
          </p>
        </div>
        <button
          onClick={() => setUseFallback(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Continue with Basic Wallet Support
        </button>
        {children}
      </div>
    );
  }

  try {
    return <XellarKitProvider theme={theme}>{children}</XellarKitProvider>;
  } catch (error: any) {
    console.error("Xellar Kit Provider error:", error);
    setErrorDetails(error?.message || "Unknown error");
    setHasError(true);
    setUseFallback(true);
    return children;
  }
};

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Try to detect Xellar config issues early
  useEffect(() => {
    const xellarAppId = process.env.NEXT_PUBLIC_XELLAR_APP_ID;
    if (!xellarAppId || xellarAppId === "demo-app-id-for-testing") {
      console.warn("Xellar configuration issue detected");
      setConfigError(true);
    }
  }, []);

  const configToUse = configError ? fallbackWagmiConfig : wagmiConfig;

  return (
    <WagmiProvider config={configToUse}>
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
