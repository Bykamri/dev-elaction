"use client";

import { useEffect, useState } from "react";
import { Check, Lightbulb, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "~~/components/ui/alert";
import { Button } from "~~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "~~/components/ui/dialog";

/**
 * WelcomeDialog Component
 *
 * A modal dialog component that displays important development notices and
 * information to users visiting the platform. Features intelligent display
 * timing with localStorage persistence to avoid showing the dialog too
 * frequently while ensuring users stay informed about the development status.
 *
 * Key Features:
 * - Automatic display timing with 2-day intervals
 * - localStorage persistence for user preferences
 * - Development status communication
 * - Mock data explanation and disclaimer
 * - Blockchain integration progress updates
 * - Professional alert styling with icons
 * - Responsive design with gradient accents
 *
 * Display Logic:
 * - Shows on first visit for new users
 * - Re-appears after 2 days since last viewing
 * - Tracks viewing timestamps in localStorage
 * - Automatic state management with useEffect
 *
 * Content Sections:
 * - Development status warning
 * - Mock data explanation
 * - Feature availability disclaimer
 * - Blockchain integration progress note
 * - User acknowledgment button
 *
 * @component
 * @category Layout
 * @subcategory Notifications
 */

/**
 * WelcomeDialog - Development Notice Modal Component
 *
 * Renders a development notice dialog that informs users about the current
 * status of the platform, including mock data usage and feature availability.
 * Implements intelligent timing to balance user awareness with user experience.
 *
 * @returns {JSX.Element} Modal dialog component with development information
 */
export function WelcomeDialog() {
  // Dialog visibility state management
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Effect to manage dialog display timing and persistence
   *
   * Checks localStorage for previous viewing history and determines
   * whether to show the dialog based on time elapsed since last viewing.
   * Implements a 2-day interval to prevent frequent interruptions.
   */
  useEffect(() => {
    // Retrieve last viewing timestamp from localStorage
    const lastSeenDate = localStorage.getItem("welcomeDialogLastSeen");
    const currentTime = new Date().getTime();

    if (!lastSeenDate) {
      // First-time visitors see the dialog immediately
      setIsOpen(true);
    } else {
      // Check if 2 days have passed since last viewing (2 * 24 * 60 * 60 * 1000 = 172800000 ms)
      const lastSeenTime = parseInt(lastSeenDate);
      const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

      if (currentTime - lastSeenTime >= twoDaysInMs) {
        setIsOpen(true);
      }
    }
  }, []);

  /**
   * Handles dialog closure and timestamp persistence
   *
   * Closes the dialog and saves the current timestamp to localStorage
   * to track when the user last viewed the development notice.
   */
  const handleClose = () => {
    setIsOpen(false);
    // Save current timestamp to localStorage for future reference
    const currentTime = new Date().getTime().toString();
    localStorage.setItem("welcomeDialogLastSeen", currentTime);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        {/* Header section with warning icon and title */}
        <div className="bg-yellow-50 border-b border-yellow-200 p-6 flex items-center space-x-3">
          <TriangleAlert className="h-8 w-8 text-yellow-600" />
          <DialogTitle className="text-xl font-bold text-yellow-800">Development Notice</DialogTitle>
        </div>

        {/* Main content with description and key points */}
        <div className="p-6 space-y-4">
          <DialogDescription className="text-muted-foreground">
            This website is currently in development phase and uses sample data for demonstration purposes.
          </DialogDescription>

          {/* Key points section with checkmark icons */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Key Points:</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>All Auctions, assets, and transactions shown are mock data</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>Smart contract integration is being actively developed</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>Some features may not work as expected</span>
              </li>
            </ul>
          </div>

          {/* Blockchain integration progress alert */}
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              We&apos;re working hard to integrate with the Lisk blockchain!
            </AlertDescription>
          </Alert>
        </div>

        {/* Footer with acknowledgment button */}
        <DialogFooter className="p-6 pt-0">
          <Button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-primary-foreground"
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
