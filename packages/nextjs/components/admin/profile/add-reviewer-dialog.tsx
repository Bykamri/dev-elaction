"use client";

import type React from "react";
import { useState } from "react";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "~~/components/ui/alert";
import { Button } from "~~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/ui/dialog";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { useAddReviewer } from "~~/hooks/useAddReviewer";
import { useAdminRole } from "~~/hooks/useAdminRole";

/**
 * @fileoverview Add Reviewer Dialog Component
 *
 * This component provides a dialog interface for admin users to add new reviewers
 * to the blockchain smart contract. It handles wallet address validation, permission
 * checking, and secure blockchain interactions for granting REVIEWER_ROLE permissions.
 * The component includes comprehensive error handling and user feedback mechanisms.
 *
 * @author Dev Team
 * @version 1.0.0
 */

/**
 * Props interface for AddReviewerDialog component
 * @interface AddReviewerDialogProps
 */
interface AddReviewerDialogProps {
  /** Optional callback function triggered when a reviewer is successfully added */
  onReviewerAdded?: (address: string) => void;
}

/**
 * AddReviewerDialog Component
 *
 * A dialog component that allows admin users to add new reviewers to the smart contract.
 * Features include wallet address validation, permission checking, and blockchain interaction
 * with comprehensive error handling and user feedback.
 *
 * Key Features:
 * - Ethereum address validation with regex pattern matching
 * - Permission-based access control (admin/deployer only)
 * - Real-time form validation and error display
 * - Loading states during blockchain transactions
 * - Toast notifications for user feedback
 * - Automatic dialog state management
 *
 * @component
 * @param {AddReviewerDialogProps} props - Component props
 * @returns {JSX.Element} The rendered add reviewer dialog
 */
export function AddReviewerDialog({ onReviewerAdded }: AddReviewerDialogProps) {
  // State for managing the input wallet address
  const [reviewerAddress, setReviewerAddress] = useState("");
  // State for controlling dialog open/close status
  const [isOpen, setIsOpen] = useState(false);

  // Custom hooks for blockchain interactions and role management
  const { addReviewer, isLoading, error, setError } = useAddReviewer();
  const { address: connectedAddress, isAdmin, isDeployer, isConnected } = useAdminRole();

  // Permission check - only admin or deployer can add reviewers
  const hasPermission = isConnected && (isAdmin || isDeployer);

  /**
   * Handles form submission for adding a new reviewer
   * Validates permissions, input format, and executes blockchain transaction
   *
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check user permissions before proceeding
    if (!hasPermission) {
      toast.error("You don't have permission to add reviewers. Only admin or deployer can add reviewers.");
      return;
    }

    // Validate that address is not empty
    if (reviewerAddress.trim() === "") {
      toast.error("Reviewer address cannot be empty.");
      return;
    }

    // Validate Ethereum address format using regex
    if (!reviewerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error("Invalid Ethereum address format. Please use format 0x...");
      return;
    }

    try {
      // Clear any previous errors
      setError(null);

      // Execute blockchain transaction to add reviewer
      const result = await addReviewer(reviewerAddress.trim());

      // Handle successful transaction
      if (result.success) {
        toast.success(`Reviewer successfully added! Transaction: ${result.txHash}`);

        // Trigger optional callback with the added address
        onReviewerAdded?.(reviewerAddress.trim());

        // Reset form and close dialog
        setReviewerAddress("");
        setIsOpen(false);
      }
    } catch (err: any) {
      // Display user-friendly error message without console logging
      toast.error(err.message || "Failed to add reviewer. Please try again.");
    }
  };

  /**
   * Handles dialog open/close state changes
   * Resets form data when dialog is closed
   *
   * @param {boolean} open - New dialog open state
   */
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    // Reset form data when closing dialog
    if (!open) {
      setReviewerAddress("");
      setError(null);
    }
  };

  return (
    // Main dialog component with controlled open state
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* Dialog trigger button - disabled if user lacks permissions */}
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-transparent" disabled={!hasPermission}>
          <UserPlus className="h-4 w-4 mr-2" /> Add Reviewer
        </Button>
      </DialogTrigger>

      {/* Dialog content with form and validation */}
      <DialogContent className="sm:max-w-[425px]">
        {/* Dialog header with title and description */}
        <DialogHeader>
          <DialogTitle>Add New Reviewer</DialogTitle>
          <DialogDescription>
            Enter the wallet address of the new reviewer to add them to the smart contract. This will grant them
            REVIEWER_ROLE permissions.
          </DialogDescription>
        </DialogHeader>

        {/* Warning alert for disconnected wallet */}
        {!isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please connect your wallet to add reviewers.</AlertDescription>
          </Alert>
        )}

        {/* Permission error alert for unauthorized users */}
        {isConnected && !hasPermission && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don&apos;t have permission to add reviewers. Only admin or deployer addresses can add reviewers.
              Connected address: {connectedAddress?.substring(0, 6)}...
              {connectedAddress?.substring(connectedAddress.length - 4)}
            </AlertDescription>
          </Alert>
        )}

        {/* Main form for adding reviewer */}
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            {/* Input field for reviewer wallet address */}
            <Label htmlFor="reviewer-address">Reviewer Wallet Address</Label>
            <Input
              id="reviewer-address"
              placeholder="0xAbCdEf1234567890AbCdEf1234567890AbCdEf12"
              value={reviewerAddress}
              onChange={e => setReviewerAddress(e.target.value)}
              disabled={isLoading || !hasPermission}
              required
            />
            {/* Error message display */}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {/* Dialog footer with submit button */}
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || !reviewerAddress.trim() || !hasPermission}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {/* Conditional button content based on loading state */}
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Reviewer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
