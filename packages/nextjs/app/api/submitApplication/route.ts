import { NextResponse } from "next/server";
import { PinataSDK } from "pinata";
import { v4 as uuidv4 } from "uuid";

interface FormData {
  generalInfo: {
    assetName: string;
    assetType: string;
    description: string;
    shortDescription: string;
  };
  assetDetails: Record<string, any>;
  imageFiles: {
    fileName: string;
    dataUrl: string;
    fileType: string;
  }[];
}

export async function POST(request: Request) {
  try {
    const pinata = new PinataSDK({
      pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
      pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud",
    });

    const body: FormData = await request.json();
    const { generalInfo, assetDetails, imageFiles } = body;

    if (!generalInfo.assetName || !generalInfo.assetType || imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data nama, tipe aset, atau gambar tidak lengkap." },
        { status: 400 },
      );
    }

    const uploadPromises = imageFiles.map(async imageFile => {
      const base64Data = imageFile.dataUrl.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const newFileName = `${uuidv4()}-${imageFile.fileName}`;
      const file = new File([buffer], newFileName, { type: imageFile.fileType });
      const uploadResult = await pinata.upload.public.file(file);
      return `ipfs://${uploadResult.cid.toString()}`;
    });

    const imageUris = await Promise.all(uploadPromises);

    const atribut = Object.entries(assetDetails).map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()),
      value: String(value),
    }));

    const metadata = {
      name: generalInfo.assetName,
      shortDescription: generalInfo.shortDescription,
      description: generalInfo.description,
      type: generalInfo.assetType,
      thumbnail: imageUris[0],
      imageUri: imageUris,
      attributes: atribut,
    };

    const metadataFileName = `${generalInfo.assetName.replace(/\s+/g, "-")}-metadata.json`;

    const metadataString = JSON.stringify(metadata, null, 2);

    const metadataBuffer = Buffer.from(metadataString);

    const metadataFile = new File([metadataBuffer], metadataFileName, { type: "application/json" });

    const metadataUpload = await pinata.upload.public.file(metadataFile);

    const metadataUri = `ipfs://${metadataUpload.cid.toString()}`;

    console.log("Raw Metadata URI created:", metadataUri);

    return NextResponse.json({ success: true, metadataUri: metadataUri }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
