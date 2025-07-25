"use client";

import { ShieldAlert } from "lucide-react";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

/**
 * ConnectWalletGuard Component
 *
 * A higher-order component (HOC) that protects routes and features requiring wallet connection.
 * This guard component serves as a security gate that ensures users have connected their
 * cryptocurrency wallet before accessing protected content. It provides a user-friendly
 * interface for wallet connection when access is restricted.
 *
 * Key Features:
 * - Wallet connection state detection using wagmi hooks
 * - Conditional rendering based on connection status
 * - User-friendly access restriction UI with clear messaging
 * - Integration with RainbowKit for seamless wallet connection
 * - Responsive design with centered layout for optimal UX
 * - Security icon and contextual messaging for better user understanding
 *
 * Usage:
 * Wrap any component or page that requires wallet connection with this guard.
 * The guard will automatically show a connection prompt for disconnected users
 * and render the protected content for connected users.
 *
 * @example
 * ```tsx
 * <ConnectWalletGuard pageName="Admin Dashboard">
 *   <AdminContent />
 * </ConnectWalletGuard>
 * ```
 *
 * @component
 * @category Authentication
 * @subcategory Guards
 */

/**
 * Props interface for the ConnectWalletGuard component
 *
 * @interface ConnectWalletGuardProps
 * @property {string} pageName - The name of the page/feature being protected, used in access restriction message
 * @property {React.ReactNode} children - The protected content to render when wallet is connected
 */
interface ConnectWalletGuardProps {
  /** The name of the page or feature being protected (displayed in restriction message) */
  pageName: string;
  /** The protected content that should only be visible to connected wallet users */
  children: React.ReactNode;
}

/**
 * ConnectWalletGuard Component
 *
 * A higher-order security component that restricts access to protected content based on wallet
 * connection status. This guard provides a seamless user experience by automatically detecting
 * wallet connection state and rendering appropriate UI accordingly. When a wallet is not connected,
 * it displays a user-friendly access restriction screen with a prominent connection button.
 *
 * Security Features:
 * - Real-time wallet connection state monitoring via wagmi hooks
 * - Automatic content protection without manual state management
 * - Clear visual indicators using shield icons for security context
 * - Contextual messaging that includes the specific page name being protected
 * - Integration with RainbowKit for consistent wallet connection UX
 *
 * UI/UX Features:
 * - Responsive centered layout that works across all device sizes
 * - Professional styling with proper spacing and typography
 * - Warning color scheme to indicate restricted access
 * - Accessible design with clear visual hierarchy
 * - Smooth transition between restricted and authorized states
 *
 * @component
 * @param {ConnectWalletGuardProps} props - Component props containing page name and protected content
 * @returns {JSX.Element} Either the access restriction UI or the protected children content
 */
export const ConnectWalletGuard = ({ pageName, children }: ConnectWalletGuardProps) => {
  // Monitor wallet connection status using wagmi's useAccount hook
  const { isConnected } = useAccount();

  // Render access restriction UI when wallet is not connected
  if (!isConnected) {
    return (
      // Main container with centered layout and minimum height for proper spacing
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* Security shield icon to indicate access restriction */}
        <ShieldAlert className="w-16 h-16 text-warning mb-4" />

        {/* Main heading indicating access is restricted */}
        <h2 className="text-2xl font-bold">Access Restricted</h2>

        {/* Explanatory text with context about which page requires connection */}
        <p className="max-w-md text-base-content/70 mt-2 mb-6">
          You must connect your wallet to access the {pageName} page.
        </p>

        {/* RainbowKit wallet connection button for seamless UX */}
        <RainbowKitCustomConnectButton />
      </div>
    );
  }

  // Render protected content when wallet is connected
  return <>{children}</>;
};
