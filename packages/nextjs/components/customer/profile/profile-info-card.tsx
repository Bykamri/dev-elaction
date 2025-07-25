"use client";

import { Calendar, RefreshCw, User, Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "~~/components/ui/avatar";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { mockProfileData } from "~~/lib/mock-profile";

/**
 * ProfileInfoCard Component
 *
 * A comprehensive user profile information card that displays essential user details in a visually
 * appealing card format. This component serves as the primary profile overview section for customer
 * profile pages, providing a centralized view of user information including avatar, personal details,
 * wallet information, and account metadata.
 *
 * Key Features:
 * - Responsive card design that adapts to different screen sizes
 * - Wallet connection state detection and conditional rendering
 * - Avatar display with fallback support for missing profile pictures
 * - Wallet address truncation for improved readability and security
 * - Formatted join date display with proper localization
 * - Optional refresh functionality with loading state support
 * - Mock data integration for development and testing purposes
 * - Accessible design with proper semantic structure
 *
 * Security Features:
 * - Wallet address privacy protection through truncation
 * - Conditional rendering based on wallet connection status
 * - Safe fallback rendering when wallet is not connected
 *
 * UI Components Used:
 * - Card components for structured layout
 * - Avatar component with image and fallback support
 * - Button component for interactive elements
 * - Lucide React icons for visual enhancement
 *
 * @component
 * @category Customer
 * @subcategory Profile
 */

/**
 * Props interface for the ProfileInfoCard component
 *
 * @interface ProfileInfoCardProps
 * @property {() => void} [onRefresh] - Optional callback function triggered when user clicks refresh button
 */
interface ProfileInfoCardProps {
  /** Optional callback function to handle profile refresh actions */
  onRefresh?: () => void;
}

/**
 * ProfileInfoCard Component Function
 *
 * Renders a comprehensive user profile information card with wallet integration and mock data display.
 * The component automatically detects wallet connection status and provides appropriate fallback UI
 * when no wallet is connected. It displays user avatar, personal information, wallet details, and
 * account metadata in a well-structured card layout.
 *
 * Component Behavior:
 * - Automatically retrieves wallet address using wagmi's useAccount hook
 * - Shows connection prompt when wallet is not connected
 * - Displays complete profile information when wallet is connected
 * - Truncates wallet address for privacy and readability
 * - Formats dates according to US locale standards
 * - Provides optional refresh functionality for data updates
 *
 * @param {ProfileInfoCardProps} props - Component props containing optional refresh callback
 * @returns {JSX.Element} The rendered profile information card with user details
 */
export function ProfileInfoCard({ onRefresh }: ProfileInfoCardProps) {
  // Extract wallet address from wagmi account hook for wallet connection detection
  const { address } = useAccount();

  // Render wallet connection prompt when no wallet is connected
  if (!address) {
    return (
      // Card container with responsive grid column spanning
      <Card className="md:col-span-1">
        {/* Centered content area with proper height and spacing */}
        <CardContent className="flex items-center justify-center h-64">
          {/* User-friendly message prompting wallet connection */}
          <p className="text-muted-foreground">Please connect your wallet</p>
        </CardContent>
      </Card>
    );
  }

  // Render complete profile information when wallet is connected
  return (
    // Main card container with responsive grid positioning
    <Card className="md:col-span-1">
      {/* Card header section with centered user avatar and basic info */}
      <CardHeader className="flex flex-col items-center text-center">
        {/* User avatar with image and fallback letter support */}
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={mockProfileData.profilePicture} alt={mockProfileData.name} />
          <AvatarFallback>{mockProfileData.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        {/* User's display name as main title */}
        <CardTitle className="text-2xl font-bold">{mockProfileData.name}</CardTitle>

        {/* User's email address as subtitle */}
        <CardDescription className="text-muted-foreground">{mockProfileData.email}</CardDescription>
      </CardHeader>

      {/* Card content area containing detailed user information */}
      <CardContent className="space-y-4">
        {/* User bio section with person icon */}
        <div className="flex items-center text-muted-foreground">
          <User className="w-5 h-5 mr-2" />
          <span>{mockProfileData.bio}</span>
        </div>

        {/* Wallet address section with truncated display for privacy */}
        <div className="flex items-center text-muted-foreground">
          <Wallet className="w-5 h-5 mr-2" />
          <span>
            Wallet: {address.substring(0, 6)}...
            {address.substring(address.length - 4)}
          </span>
        </div>

        {/* Account join date section with formatted date display */}
        <div className="flex items-center text-muted-foreground">
          <Calendar className="w-5 h-5 mr-2" />
          <span>
            Joined:{" "}
            {mockProfileData.joinedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Optional refresh button when onRefresh callback is provided */}
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} className="w-full mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
