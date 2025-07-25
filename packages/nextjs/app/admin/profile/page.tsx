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

/**
 * @title Admin Profile Page Component
 * @dev Main admin dashboard page for managing platform overview and reviewer management
 * @notice This page provides admin users with:
 *   - Platform metrics and statistics overview
 *   - Recent admin activity tracking
 *   - Reviewer management functionality
 *   - Revenue and auction analytics
 * @notice Protected by ConnectWalletGuard to ensure only connected wallet users can access
 */
export default function AdminProfilePage() {
  // ============ State Management ============

  /**
   * @dev Active tab state for switching between Overview and Reviewer List views
   * @notice Controls which tab content is currently displayed to the admin user
   */
  const [activeTab, setActiveTab] = useState<string>("overview");

  // ============ Data Processing and Analytics ============

  /**
   * @dev Filter completed auctions that have been approved and closed
   * @notice Used for calculating platform metrics and recent activity
   */
  const approvedAuctions = mockCompletedAuctions.filter((auction: any) => auction.status === "closed");

  /**
   * @dev Placeholder for rejected auctions data
   * @notice Currently empty array, will be populated with real data in production
   */
  const rejectedAuctions: any[] = [];

  /**
   * @dev Total platform users count
   * @notice Placeholder value, should be fetched from user management system
   */
  const totalUsers = 100;

  /**
   * @dev Calculate total revenue processed through the platform
   * @notice Sums up all final bid amounts from approved/closed auctions
   * @returns Total revenue as a number for display in metrics
   */
  const totalRevenueProcessed = approvedAuctions.reduce((sum: number, auction: any) => {
    const bidValue = parseFloat(auction.finalBid || "0");
    return sum + bidValue;
  }, 0);

  /**
   * @dev Get the 5 most recent admin actions for activity display
   * @notice Sorts auctions by end time (most recent first) and limits to 5 items
   * @returns Array of recent auction activities for the activity feed
   */

  const recentAdminActions = approvedAuctions
    .sort((a: any, b: any) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
    .slice(0, 5);

  // ============ Event Handlers ============

  /**
   * @dev Handler function for adding new reviewers to the platform
   * @param address The wallet address of the new reviewer to be added
   * @notice This function will be called when admin successfully adds a new reviewer
   * @notice In production, this should make API calls to update reviewer permissions
   */
  const handleAddReviewer = (address: string) => {
    // TODO: Implement actual reviewer addition logic
    // This should interact with the smart contract to grant REVIEWER_ROLE
    // For now, we acknowledge the address parameter will be used in future implementation
    void address;
  };

  // ============ Component Render ============

  return (
    <ConnectWalletGuard pageName="Admin Profile">
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
          <p className="text-muted-foreground">Manage your admin account and view platform overview.</p>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviewer-list">
              <Users className="h-4 w-4 mr-2" /> Reviewer List
            </TabsTrigger>
          </TabsList>

          {/* Add Reviewer Button - Positioned for easy access */}
          <div className="mt-6 flex justify-end">
            <AddReviewerDialog onReviewerAdded={handleAddReviewer} />
          </div>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-6">
            {/* Admin Information and Metrics Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <AdminInfoCard />
              <AdminMetricsCard
                approvedAuctionsCount={approvedAuctions.length}
                rejectedAuctionsCount={rejectedAuctions.length}
                totalUsersCount={totalUsers}
                totalRevenueProcessed={totalRevenueProcessed}
              />
            </div>
            {/* Recent Activity Feed */}
            <RecentAdminActivity recentActions={recentAdminActions} />
          </TabsContent>

          {/* Reviewer Management Tab Content */}
          <TabsContent value="reviewer-list" className="mt-6">
            <ReviewerList reviewers={mockReviewers} />
          </TabsContent>
        </Tabs>
      </main>
    </ConnectWalletGuard>
  );
}
