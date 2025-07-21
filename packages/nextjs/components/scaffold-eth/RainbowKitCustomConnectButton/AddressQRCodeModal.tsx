import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~~/components/ui/dialog";

type AddressQRCodeModalProps = {
  address: AddressType;
  trigger: React.ReactNode;
};

export const AddressQRCodeModal = ({ address, trigger }: AddressQRCodeModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

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
  );
};
