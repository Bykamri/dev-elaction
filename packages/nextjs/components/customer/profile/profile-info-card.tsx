"use client";

import { Calendar, RefreshCw, User, Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "~~/components/ui/avatar";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { mockProfileData } from "~~/lib/mock-profile";

interface ProfileInfoCardProps {
  onRefresh?: () => void;
}

export function ProfileInfoCard({ onRefresh }: ProfileInfoCardProps) {
  const { address } = useAccount();

  if (!address) {
    return (
      <Card className="md:col-span-1">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please connect your wallet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-1">
      <CardHeader className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={mockProfileData.profilePicture} alt={mockProfileData.name} />
          <AvatarFallback>{mockProfileData.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl font-bold">{mockProfileData.name}</CardTitle>
        <CardDescription className="text-muted-foreground">{mockProfileData.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-muted-foreground">
          <User className="w-5 h-5 mr-2" />
          <span>{mockProfileData.bio}</span>
        </div>
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
            {mockProfileData.joinedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
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
