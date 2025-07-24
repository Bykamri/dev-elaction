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

interface AddReviewerDialogProps {
  onReviewerAdded?: (address: string) => void;
}

export function AddReviewerDialog({ onReviewerAdded }: AddReviewerDialogProps) {
  const [reviewerAddress, setReviewerAddress] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { addReviewer, isLoading, error, setError } = useAddReviewer();
  const { address: connectedAddress, isAdmin, isDeployer, isConnected } = useAdminRole();

  // Check if user has permission to add reviewers
  const hasPermission = isConnected && (isAdmin || isDeployer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPermission) {
      toast.error("You don't have permission to add reviewers. Only admin or deployer can add reviewers.");
      return;
    }

    if (reviewerAddress.trim() === "") {
      toast.error("Alamat reviewer tidak boleh kosong.");
      return;
    }

    // Validate Ethereum address format
    if (!reviewerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error("Format alamat Ethereum tidak valid. Gunakan format 0x...");
      return;
    }

    try {
      setError(null);
      const result = await addReviewer(reviewerAddress.trim());

      if (result.success) {
        toast.success(`Reviewer berhasil ditambahkan! Tx: ${result.txHash}`);
        onReviewerAdded?.(reviewerAddress.trim());
        setReviewerAddress("");
        setIsOpen(false);
      }
    } catch (err: any) {
      console.error("Error adding reviewer:", err);
      toast.error(err.message || "Gagal menambahkan reviewer. Silakan coba lagi.");
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setReviewerAddress("");
      setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-transparent" disabled={!hasPermission}>
          <UserPlus className="h-4 w-4 mr-2" /> Add Reviewer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Reviewer</DialogTitle>
          <DialogDescription>
            Enter the wallet address of the new reviewer to add them to the smart contract. This will grant them
            REVIEWER_ROLE permissions.
          </DialogDescription>
        </DialogHeader>

        {!isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please connect your wallet to add reviewers.</AlertDescription>
          </Alert>
        )}

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

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reviewer-address">Reviewer Wallet Address</Label>
            <Input
              id="reviewer-address"
              placeholder="0xAbCdEf1234567890AbCdEf1234567890AbCdEf12"
              value={reviewerAddress}
              onChange={e => setReviewerAddress(e.target.value)}
              disabled={isLoading || !hasPermission}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || !reviewerAddress.trim() || !hasPermission}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
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
