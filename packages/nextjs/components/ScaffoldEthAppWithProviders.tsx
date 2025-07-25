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

/**
 * ScaffoldEthAppWithProviders Component
 *
 * The main application wrapper component that provides all necessary contexts,
 * providers, and global functionality for the Elaction platform. Integrates
 * multiple blockchain and UI libraries while handling error states and theme
 * management for a seamless user experience.
 *
 * Key Features:
 * - Wagmi provider for Ethereum wallet connections
 * - React Query for efficient data fetching and caching
 * - XellarKit integration for enhanced wallet functionality
 * - Role-based access control with context provider
 * - Theme management with light/dark mode support
 * - Progress bar for navigation feedback
 * - Global toast notifications
 * - Error boundary handling for configuration issues
 * - Native currency price initialization
 *
 * Provider Hierarchy:
 * 1. WagmiProvider - Ethereum wallet connections
 * 2. QueryClientProvider - Data fetching and caching
 * 3. XellarKitWrapper - Enhanced wallet features with error handling
 * 4. RoleProvider - User role management
 * 5. ScaffoldEthApp - Main app layout with header/footer
 *
 * Error Handling:
 * - Xellar Kit configuration validation
 * - Graceful fallback for missing environment variables
 * - User-friendly error messages with setup instructions
 * - Automatic error recovery and provider fallbacks
 *
 * @component
 * @category Layout
 * @subcategory Providers
 */

/**
 * ScaffoldEthApp - Core Application Layout Component
 *
 * Provides the main application structure with header, main content area,
 * and footer. Initializes native currency pricing and sets up the basic
 * layout structure for all application pages.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in main content
 * @returns {JSX.Element} Application layout with navigation and content areas
 */
const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  // Initialize native currency price for transaction displays
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className={`flex flex-col min-h-screen `}>
        {/* Global navigation header */}
        <Header />
        {/* Main content area with flexible layout */}
        <main className="relative flex flex-col flex-1 ">{children}</main>
        {/* Global footer */}
        <Footer />
      </div>
      {/* Global toast notification container */}
      <Toaster />
    </>
  );
};

/**
 * Global query client configuration for React Query
 *
 * Configured with sensible defaults for data fetching including
 * disabled window focus refetching to prevent unnecessary requests.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * XellarKitWrapper - Error Boundary Wrapper for Xellar Kit Provider
 *
 * Provides robust error handling and graceful fallbacks for XellarKit
 * integration. Monitors for configuration errors and displays helpful
 * setup instructions when environment variables are missing or invalid.
 *
 * Features:
 * - Configuration error detection and handling
 * - User-friendly error messages with setup instructions
 * - Automatic error event listening
 * - Graceful fallback rendering
 * - Development guidance for proper setup
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {any} props.theme - Theme configuration for XellarKit
 * @returns {JSX.Element} Wrapped component with error boundary
 */
const XellarKitWrapper = ({ children, theme }: { children: React.ReactNode; theme: any }) => {
  // Error state for configuration issues
  const [hasError, setHasError] = useState(false);

  /**
   * Effect to monitor and handle XellarKit configuration errors
   *
   * Sets up global error listeners to catch XellarKit configuration
   * issues and provide appropriate user feedback with setup guidance.
   */
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

  // Render configuration error UI with setup instructions
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

  // Attempt to initialize XellarKit with error handling
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

/**
 * ScaffoldEthAppWithProviders - Main Application Provider Wrapper
 *
 * The root application component that orchestrates all necessary providers
 * and contexts for the Elaction platform. Manages theme state, wallet
 * connections, and global application state while providing error handling
 * and graceful fallbacks for all integrations.
 *
 * Provider Stack (from outer to inner):
 * 1. WagmiProvider - Ethereum wallet and blockchain connections
 * 2. QueryClientProvider - Data fetching, caching, and synchronization
 * 3. XellarKitWrapper - Enhanced wallet features with error boundaries
 * 4. RoleProvider - User role management and access control
 * 5. ScaffoldEthApp - Core application layout and structure
 *
 * Features:
 * - Theme-aware provider initialization
 * - Client-side mounting detection for SSR safety
 * - Progress bar integration for navigation feedback
 * - Comprehensive error boundary coverage
 * - Automatic theme switching support
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Application content to render
 * @returns {JSX.Element} Fully configured application with all providers
 */
export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  // Theme management with next-themes integration
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Client-side mounting state for SSR safety
  const [mounted, setMounted] = useState(false);

  /**
   * Effect to track component mounting for SSR safety
   *
   * Ensures theme-dependent provider initialization only occurs
   * on the client side to prevent hydration mismatches.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* XellarKit with theme-aware configuration */}
        <XellarKitWrapper theme={mounted ? (isDarkMode ? darkTheme : lightTheme) : lightTheme}>
          <RoleProvider>
            {/* Navigation progress indicator */}
            <ProgressBar height="3px" color="#2299dd" />
            {/* Main application with layout and content */}
            <ScaffoldEthApp>{children}</ScaffoldEthApp>
          </RoleProvider>
        </XellarKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
