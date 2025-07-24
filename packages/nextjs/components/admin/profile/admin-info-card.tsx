"use client";

import { Calendar, User, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~~/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { useAdminRole } from "~~/hooks/useAdminRole";

// Generate random admin name and avatar
const getRandomAdminData = (address: string) => {
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

  // Use address as seed for consistent random selection
  const seed = address ? parseInt(address.slice(-4), 16) : 0;
  const nameIndex = seed % names.length;
  const avatarIndex = seed % avatars.length;

  return {
    name: names[nameIndex],
    avatar: avatars[avatarIndex],
  };
};

export function AdminInfoCard() {
  const { address, isConnected, isAdmin, isDeployer } = useAdminRole();

  if (!isConnected || !address) {
    return (
      <Card className="md:col-span-1">
        <CardHeader className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarFallback>--</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold">Not Connected</CardTitle>
          <CardDescription className="text-muted-foreground">Please connect your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">Connect your wallet to view admin information</p>
        </CardContent>
      </Card>
    );
  }

  const randomData = getRandomAdminData(address);
  const role = isAdmin ? "admin" : isDeployer ? "deployer" : "user";

  return (
    <Card className="md:col-span-1">
      <CardHeader className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={randomData.avatar} alt={randomData.name} />
          <AvatarFallback>{randomData.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl font-bold">{randomData.name}</CardTitle>
        <CardDescription className="text-muted-foreground">{role.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-muted-foreground">
          <Wallet className="w-5 h-5 mr-2" />
          <span>
            Wallet: {address.substring(0, 6)}...
            {address.substring(address.length - 4)}
          </span>
        </div>
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
        <div className="flex items-center text-muted-foreground">
          <User className="w-5 h-5 mr-2" />
          <span>Role: {role}</span>
        </div>
      </CardContent>
    </Card>
  );
}
