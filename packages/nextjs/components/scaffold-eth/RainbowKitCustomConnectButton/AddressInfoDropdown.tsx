"use client";

import { NetworkOptions } from "./NetworkOptions";
import { QRCodeSVG } from "qrcode.react";
import { getAddress } from "viem";
import { Address as AddressType } from "viem";
import { useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { Address, BlockieAvatar, isENS } from "~~/components/scaffold-eth";
import { Button } from "~~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: AddressType;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);

  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <BlockieAvatar address={checkSumAddress} size={26} ensImage={ensAvatar} />
          <span className="ml-2 mr-1">
            {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
          </span>
          <ChevronDownIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem onClick={() => copyToClipboard(checkSumAddress)}>
          {isCopiedToClipboard ? (
            <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
          )}
          <span>{isCopiedToClipboard ? "Copied!" : "Copy Address"}</span>
        </DropdownMenuItem>

        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={e => e.preventDefault()}>
              <QrCodeIcon className="mr-2 h-4 w-4" />
              <span>View QR Code</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your Address</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6 p-4">
              <QRCodeSVG value={address} size={256} />
              <Address address={address} format="long" disableAddressLink onlyEnsOrAddress />
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenuItem asChild>
          <a href={blockExplorerAddressLink} target="_blank" rel="noopener noreferrer">
            <ArrowTopRightOnSquareIcon className="mr-2 h-4 w-4" />
            <span>View on Block Explorer</span>
          </a>
        </DropdownMenuItem>

        {allowedNetworks.length > 1 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArrowsRightLeftIcon className="mr-2 h-4 w-4" />
              <span>Switch Network</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <NetworkOptions />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="focus:bg-red-500/10" onClick={() => disconnect()}>
          <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4 text-red-500" />
          <span className="text-red-500">Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
