"use client";

import { Calendar, User, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~~/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { useAdminRole } from "~~/hooks/useAdminRole";

/**
 * @fileoverview Admin Info Card Component
 *
 * This component displays admin profile information in a card format, including
 * avatar, name, role, wallet address, and join date. It uses deterministic random
 * data generation based on wallet address to provide consistent mock profile data.
 * The component handles different states for connected/disconnected wallets and
 * displays role-based information (admin, deployer, or user).
 *
 * @author Dev Team
 * @version 1.0.0
 */

/**
 * Generates consistent random admin profile data based on wallet address
 * Uses the wallet address as a seed to ensure the same address always gets
 * the same name and avatar, providing a consistent user experience.
 *
 * @param {string} address - Ethereum wallet address used as seed
 * @returns {Object} Object containing randomly selected name and avatar URL
 */
const getRandomAdminData = (address: string) => {
  // Array of mock admin names for profile display
  const names = [
    "Ahmad Syahputra",
    "Siti Nurhaliza",
    "Budi Hartono",
    "Maria Santos",
    "Joko Susilo",
    "Lisa Chen",
    "Rina Melati",
    "David Wijaya",
  ];

  // Array of Unsplash avatar image URLs with proper cropping and sizing
  const avatars = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b169b706?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1559941838-808bf53d6d59?w=100&h=100&fit=crop&crop=face",
  ];

  // Use last 4 characters of address as seed for consistent random selection
  const seed = address ? parseInt(address.slice(-4), 16) : 0;
  const nameIndex = seed % names.length;
  const avatarIndex = seed % avatars.length;

  return {
    name: names[nameIndex],
    avatar: avatars[avatarIndex],
  };
};

/**
 * AdminInfoCard Component
 *
 * Displays admin profile information in a card layout. Shows different content
 * based on wallet connection status and user role. For connected wallets,
 * displays mock profile data, role information, and wallet details.
 *
 * Features:
 * - Deterministic random profile generation based on wallet address
 * - Role-based display (admin, deployer, user)
 * - Wallet connection status handling
 * - Responsive card layout with avatar, name, and details
 * - Truncated wallet address display for privacy
 * - Mock join date for profile completeness
 *
 * @component
 * @returns {JSX.Element} The rendered admin info card
 */
export function AdminInfoCard() {
  // Extract wallet connection and role information from custom hook
  const { address, isConnected, isAdmin, isDeployer } = useAdminRole();

  // Handle disconnected wallet state
  if (!isConnected || !address) {
    return (
      <Card className="md:col-span-1">
        {/* Header for disconnected state */}
        <CardHeader className="flex flex-col items-center text-center">
          {/* Placeholder avatar for disconnected state */}
          <Avatar className="h-24 w-24 mb-4">
            <AvatarFallback>--</AvatarFallback>
          </Avatar>
          {/* Title indicating no connection */}
          <CardTitle className="text-2xl font-bold">Not Connected</CardTitle>
          <CardDescription className="text-muted-foreground">Please connect your wallet</CardDescription>
        </CardHeader>
        {/* Content encouraging wallet connection */}
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">Connect your wallet to view admin information</p>
        </CardContent>
      </Card>
    );
  }

  // Generate consistent profile data based on wallet address
  const randomData = getRandomAdminData(address);

  // Determine user role for display purposes
  const role = isAdmin ? "admin" : isDeployer ? "deployer" : "user";

  return (
    // Main card component for connected admin profile
    <Card className="md:col-span-1">
      {/* Card header with avatar and basic info */}
      <CardHeader className="flex flex-col items-center text-center">
        {/* User avatar with fallback to first letter of name */}
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={randomData.avatar} alt={randomData.name} />
          <AvatarFallback>{randomData.name.charAt(0)}</AvatarFallback>
        </Avatar>
        {/* Display generated admin name */}
        <CardTitle className="text-2xl font-bold">{randomData.name}</CardTitle>
        {/* Display user role in uppercase */}
        <CardDescription className="text-muted-foreground">{role.toUpperCase()}</CardDescription>
      </CardHeader>

      {/* Card content with detailed information */}
      <CardContent className="space-y-4">
        {/* Wallet address display with truncation for privacy */}
        <div className="flex items-center text-muted-foreground">
          <Wallet className="w-5 h-5 mr-2" />
          <span>
            Wallet: {address.substring(0, 6)}...
            {address.substring(address.length - 4)}
          </span>
        </div>

        {/* Mock join date for profile completeness */}
        <div className="flex items-center text-muted-foreground">
          <Calendar className="w-5 h-5 mr-2" />
          <span>
            Joined:{" "}
            {new Date("2024-01-15").toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* User role information */}
        <div className="flex items-center text-muted-foreground">
          <User className="w-5 h-5 mr-2" />
          <span>Role: {role}</span>
        </div>
      </CardContent>
    </Card>
  );
}
