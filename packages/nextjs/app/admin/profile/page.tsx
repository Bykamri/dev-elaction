"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { AddReviewerDialog } from "~~/components/admin/profile/add-reviewer-dialog";
import { AdminInfoCard } from "~~/components/admin/profile/admin-info-card";
import { AdminMetricsCard } from "~~/components/admin/profile/admin-metrics-card";
import { RecentAdminActivity } from "~~/components/admin/profile/recent-admin-activity";
import { ReviewerList } from "~~/components/admin/profile/reviewer-list";
import { ConnectWalletGuard } from "~~/components/auth/ConnectWalletGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { mockCompletedAuctions } from "~~/lib/mock-revenue";
import { mockReviewers } from "~~/lib/mock-reviewers";

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<string>("overview"); // State for active tab

  // Use mock completed auctions for admin metrics
  const approvedAuctions = mockCompletedAuctions.filter((auction: any) => auction.status === "closed");
  const rejectedAuctions: any[] = []; // Mock rejected auctions
  const totalUsers = 100; // Static count since we removed mock users dependency

  const totalRevenueProcessed = approvedAuctions.reduce((sum: number, auction: any) => {
    const bidValue = parseFloat(auction.finalBid || "0");
    return sum + bidValue;
  }, 0);

  // Recent admin actions based on completed auctions
  const recentAdminActions = approvedAuctions
    .sort((a: any, b: any) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
    .slice(0, 5);

  const handleAddReviewer = (address: string) => {
    console.log("Adding new reviewer with address:", address);
    // The actual blockchain integration is now handled by the AddReviewerDialog component
  };

  return (
    <ConnectWalletGuard pageName="Admin Profile">
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
          <p className="text-muted-foreground">Manage your admin account and view platform overview.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {" "}
            {/* Updated grid-cols back to 2 */}
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviewer-list">
              {" "}
              {/* Moved "Add Reviewer" out of TabsTrigger */}
              <Users className="h-4 w-4 mr-2" /> Reviewer List
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 flex justify-end">
            {/* Add Reviewer button outside of TabsList, triggering the dialog */}
            <AddReviewerDialog onReviewerAdded={handleAddReviewer} />
          </div>

          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <AdminInfoCard />
              <AdminMetricsCard
                approvedAuctionsCount={approvedAuctions.length}
                rejectedAuctionsCount={rejectedAuctions.length}
                totalUsersCount={totalUsers}
                totalRevenueProcessed={totalRevenueProcessed}
              />
            </div>
            <RecentAdminActivity recentActions={recentAdminActions} />
          </TabsContent>

          <TabsContent value="reviewer-list" className="mt-6">
            {" "}
            {/* New Tab Content */}
            <ReviewerList reviewers={mockReviewers} />
          </TabsContent>
        </Tabs>
      </main>
    </ConnectWalletGuard>
  );
}
