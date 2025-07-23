"use client";

import { useEffect, useState } from "react";
import { Check, Lightbulb, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "~~/components/ui/alert";
import { Button } from "~~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "~~/components/ui/dialog";

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Periksa apakah pengguna telah melihat dialog sebelumnya dan kapan terakhir kali
    const lastSeenDate = localStorage.getItem("welcomeDialogLastSeen");
    const currentTime = new Date().getTime();

    if (!lastSeenDate) {
      // Jika belum pernah melihat dialog, tampilkan
      setIsOpen(true);
    } else {
      // Periksa apakah sudah lewat 2 hari (2 * 24 * 60 * 60 * 1000 = 172800000 ms)
      const lastSeenTime = parseInt(lastSeenDate);
      const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

      if (currentTime - lastSeenTime >= twoDaysInMs) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Simpan timestamp saat ini ke localStorage
    const currentTime = new Date().getTime().toString();
    localStorage.setItem("welcomeDialogLastSeen", currentTime);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="bg-yellow-50 border-b border-yellow-200 p-6 flex items-center space-x-3">
          <TriangleAlert className="h-8 w-8 text-yellow-600" />
          <DialogTitle className="text-xl font-bold text-yellow-800">Development Notice</DialogTitle>
        </div>
        <div className="p-6 space-y-4">
          <DialogDescription className="text-muted-foreground">
            This website is currently in development phase and uses sample data for demonstration purposes.
          </DialogDescription>

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

          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              We&apos;re working hard to integrate with the Lisk blockchain!
            </AlertDescription>
          </Alert>
        </div>
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
