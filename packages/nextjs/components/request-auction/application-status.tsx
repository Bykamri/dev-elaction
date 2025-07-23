"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~~/components/ui/alert";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardTitle } from "~~/components/ui/card";
import { cn } from "~~/lib/utils";

type AdminStatus = "pending" | "in_review" | "rejected" | "published";

interface ApplicationStatusProps {
  status: AdminStatus;
  submittedDate: string;
  lastUpdatedDate: string;
}

export function ApplicationStatus({ status, submittedDate, lastUpdatedDate }: ApplicationStatusProps) {
  const router = useRouter();
  let iconComponent;
  let titleText;
  let descriptionText;
  let badgeText;
  let badgeColorClass;
  let iconBgColorClass;
  let iconColorClass;

  switch (status) {
    case "pending":
      iconComponent = <Clock className="h-12 w-12" />;
      titleText = "Application Pending";
      descriptionText = "Your application has been submitted and is awaiting initial review by the admin.";
      badgeText = "PENDING";
      badgeColorClass = "bg-yellow-100 text-yellow-800";
      iconBgColorClass = "bg-yellow-100";
      iconColorClass = "text-yellow-500";
      break;
    case "in_review":
      iconComponent = <Clock className="h-12 w-12" />;
      titleText = "UNDER REVIEW";
      descriptionText = "Your application is being reviewed by our team. We'll contact you within 3-5 business days.";
      badgeText = "UNDER REVIEW";
      badgeColorClass = "bg-orange-100 text-orange-800";
      iconBgColorClass = "bg-orange-100";
      iconColorClass = "text-orange-500";
      break;
    case "rejected":
      iconComponent = <XCircle className="h-12 w-12" />;
      titleText = "Application Rejected";
      descriptionText = "Unfortunately, your application has been rejected. Please contact support for more details.";
      badgeText = "REJECTED";
      badgeColorClass = "bg-red-100 text-red-800";
      iconBgColorClass = "bg-red-100";
      iconColorClass = "text-red-500";
      break;
    case "published":
      iconComponent = <CheckCircle className="h-12 w-12" />;
      titleText = "Application Submitted!";
      descriptionText = "Congratulations! Your application has been submitted.";
      badgeText = "SUBMITTED";
      badgeColorClass = "bg-green-100 text-green-800";
      iconBgColorClass = "bg-green-100";
      iconColorClass = "text-green-500";
      break;
    default:
      iconComponent = <Clock className="h-12 w-12" />;
      titleText = "Unknown Status";
      descriptionText = "An unknown status has occurred. Please contact support.";
      badgeText = "UNKNOWN";
      badgeColorClass = "bg-gray-100 text-gray-800";
      iconBgColorClass = "bg-gray-100";
      iconColorClass = "text-gray-500";
  }

  return (
    <Card className="w-full max-w-2xl p-8 text-center shadow-lg">
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        <div className={cn("flex h-24 w-24 items-center justify-center rounded-full", iconBgColorClass)}>
          <div className={iconColorClass}>{iconComponent}</div>
        </div>

        <Badge className={cn("text-sm font-semibold px-4 py-2 rounded-full", badgeColorClass)}>{badgeText}</Badge>

        <CardTitle className="text-2xl font-bold text-foreground">{titleText}</CardTitle>
        <p className="text-muted-foreground max-w-md">{descriptionText}</p>

        {status === "published" && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Application Submitted!</AlertTitle>
            <AlertDescription className="text-blue-700">
              Your application has been submitted successfully and is currently under review by our team.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-1 mt-4">
          <p>Submitted: {submittedDate}</p>
          <p>Last Updated: {lastUpdatedDate}</p>
        </div>

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
