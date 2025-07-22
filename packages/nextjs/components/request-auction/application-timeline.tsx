"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { cn } from "~~/lib/utils";

interface TimelineEvent {
  status: "submitted" | "in_review" | "completed" | "rejected";
  title: string;
  date: string;
}

interface ApplicationTimelineProps {
  events: TimelineEvent[];
}

export function ApplicationTimeline({ events }: ApplicationTimelineProps) {
  const getDotColorClass = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "submitted":
        return "bg-green-500";
      case "in_review":
        return "bg-orange-500";
      case "completed":
        return "bg-blue-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">Application Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className={cn("h-3 w-3 rounded-full flex-shrink-0 mt-1", getDotColorClass(event.status))} />
            <div>
              <p className="font-medium text-foreground">{event.title}</p>
              <p className="text-sm text-muted-foreground">{event.date}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
