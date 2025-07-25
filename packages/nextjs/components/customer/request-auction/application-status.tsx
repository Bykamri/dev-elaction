"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~~/components/ui/alert";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardTitle } from "~~/components/ui/card";
import { cn } from "~~/lib/utils";

/**
 * ApplicationStatus Component
 *
 * A comprehensive status display component that provides visual feedback for auction application
 * submission and review processes. This component serves as a centralized status page that users
 * see after submitting auction requests, providing clear information about their application's
 * current state in the review workflow.
 *
 * Key Features:
 * - Dynamic status visualization with contextual icons and colors
 * - Comprehensive status tracking across the application lifecycle
 * - Visual status badges with semantic color coding
 * - Contextual messaging based on application state
 * - Date tracking for submission and last update timestamps
 * - Navigation functionality to return to main application
 * - Responsive card design with centered layout
 * - Special alert notifications for specific status states
 *
 * Application States Supported:
 * - Pending: Initial submission awaiting admin review
 * - In Review: Active review process by admin team
 * - Rejected: Application declined with support contact guidance
 * - Published: Successfully submitted application ready for processing
 * - Unknown: Fallback state for undefined statuses
 *
 * Visual Design Elements:
 * - Large circular icons with status-appropriate backgrounds
 * - Color-coded badges for quick status identification
 * - Contextual alert messages for important updates
 * - Professional typography hierarchy for clear information display
 * - Responsive layout with maximum width constraints
 *
 * @component
 * @category Customer
 * @subcategory Request Auction
 */

/**
 * Type definition for application status states
 *
 * Defines the possible states an auction application can be in during the review process.
 * Each state represents a distinct phase in the application lifecycle.
 */
type AdminStatus = "pending" | "in_review" | "rejected" | "published";

/**
 * Props interface for the ApplicationStatus component
 *
 * @interface ApplicationStatusProps
 * @property {AdminStatus} status - Current status of the application in the review process
 * @property {string} submittedDate - Date when the application was originally submitted
 * @property {string} lastUpdatedDate - Date when the application status was last modified
 */
interface ApplicationStatusProps {
  /** Current status of the application (pending, in_review, rejected, published) */
  status: AdminStatus;
  /** Formatted date string indicating when the application was submitted */
  submittedDate: string;
  /** Formatted date string indicating when the application was last updated */
  lastUpdatedDate: string;
}

/**
 * ApplicationStatus Component Function
 *
 * Renders a comprehensive status display card for auction application review processes.
 * The component dynamically adapts its visual appearance, messaging, and functionality
 * based on the current application status, providing users with clear feedback about
 * their submission's progress through the admin review workflow.
 *
 * Component Architecture:
 * - Dynamic content generation based on status prop
 * - Contextual styling with semantic color coding
 * - Responsive card layout with centered content alignment
 * - Navigation integration for user flow management
 * - Conditional alert displays for specific statuses
 *
 * @param {ApplicationStatusProps} props - Component props containing status and date information
 * @returns {JSX.Element} The rendered application status card with contextual information
 */
export function ApplicationStatus({ status, submittedDate, lastUpdatedDate }: ApplicationStatusProps) {
  // Router instance for navigation functionality
  const router = useRouter();

  // Initialize variables for dynamic content based on status
  let iconComponent;
  let titleText;
  let descriptionText;
  let badgeText;
  let badgeColorClass;
  let iconBgColorClass;
  let iconColorClass;

  /**
   * Status-based content configuration
   *
   * This switch statement configures all visual and textual elements based on the
   * current application status. Each case defines the appropriate icon, colors,
   * text content, and styling for that specific status state.
   */
  switch (status) {
    case "pending":
      // Pending status: Initial submission awaiting review
      iconComponent = <Clock className="h-12 w-12" />;
      titleText = "Application Pending";
      descriptionText = "Your application has been submitted and is awaiting initial review by the admin.";
      badgeText = "PENDING";
      badgeColorClass = "bg-yellow-100 text-yellow-800";
      iconBgColorClass = "bg-yellow-100";
      iconColorClass = "text-yellow-500";
      break;
    case "in_review":
      // In review status: Active review process by admin team
      iconComponent = <Clock className="h-12 w-12" />;
      titleText = "UNDER REVIEW";
      descriptionText = "Your application is being reviewed by our team. We'll contact you within 3-5 business days.";
      badgeText = "UNDER REVIEW";
      badgeColorClass = "bg-orange-100 text-orange-800";
      iconBgColorClass = "bg-orange-100";
      iconColorClass = "text-orange-500";
      break;
    case "rejected":
      // Rejected status: Application declined with support guidance
      iconComponent = <XCircle className="h-12 w-12" />;
      titleText = "Application Rejected";
      descriptionText = "Unfortunately, your application has been rejected. Please contact support for more details.";
      badgeText = "REJECTED";
      badgeColorClass = "bg-red-100 text-red-800";
      iconBgColorClass = "bg-red-100";
      iconColorClass = "text-red-500";
      break;
    case "published":
      // Published status: Successfully submitted and ready for processing
      iconComponent = <CheckCircle className="h-12 w-12" />;
      titleText = "Application Submitted!";
      descriptionText = "Congratulations! Your application has been submitted.";
      badgeText = "SUBMITTED";
      badgeColorClass = "bg-green-100 text-green-800";
      iconBgColorClass = "bg-green-100";
      iconColorClass = "text-green-500";
      break;
    default:
      // Fallback for unknown or undefined status states
      iconComponent = <Clock className="h-12 w-12" />;
      titleText = "Unknown Status";
      descriptionText = "An unknown status has occurred. Please contact support.";
      badgeText = "UNKNOWN";
      badgeColorClass = "bg-gray-100 text-gray-800";
      iconBgColorClass = "bg-gray-100";
      iconColorClass = "text-gray-500";
  }

  // Render the complete application status card
  return (
    // Main card container with responsive width and shadow styling
    <Card className="w-full max-w-2xl p-8 text-center shadow-lg">
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        {/* Status icon with circular background and contextual coloring */}
        <div className={cn("flex h-24 w-24 items-center justify-center rounded-full", iconBgColorClass)}>
          <div className={iconColorClass}>{iconComponent}</div>
        </div>

        {/* Status badge with dynamic styling based on current state */}
        <Badge className={cn("text-sm font-semibold px-4 py-2 rounded-full", badgeColorClass)}>{badgeText}</Badge>

        {/* Main title displaying current status message */}
        <CardTitle className="text-2xl font-bold text-foreground">{titleText}</CardTitle>

        {/* Descriptive text providing context about the current status */}
        <p className="text-muted-foreground max-w-md">{descriptionText}</p>

        {/* Conditional alert for published status with additional information */}
        {status === "published" && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Application Submitted!</AlertTitle>
            <AlertDescription className="text-blue-700">
              Your application has been submitted successfully and is currently under review by our team.
            </AlertDescription>
          </Alert>
        )}

        {/* Date information section showing submission and update timestamps */}
        <div className="text-sm text-muted-foreground space-y-1 mt-4">
          <p>Submitted: {submittedDate}</p>
          <p>Last Updated: {lastUpdatedDate}</p>
        </div>

        {/* Navigation button to return to main application */}
        <Button
          variant="outline"
          className="mt-6 w-full max-w-xs border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700 bg-transparent"
          onClick={() => router.push("/")}
        >
          Back to Home
        </Button>
      </CardContent>
    </Card>
  );
}
