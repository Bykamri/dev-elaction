import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

export const useProposalData = (proposalId: bigint, auctionFactoryContract: any) => {
  const { address: connectedAddress } = useAccount();

  const [proposal, setProposal] = useState<any>();
  const [assetName, setAssetName] = useState("Memuat...");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "https://preview-responsive-header-design-kzmg27jq27z2q98j8m6v.vusercontent.net/placeholder.svg?height=200&width=300",
  );
  const [images, setImages] = useState<string[]>([]);
  const [isReviewer, setIsReviewer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shortDescription, setShortDescription] = useState("");
  const [categories, setCategories] = useState("");

  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (auctionFactoryContract && !hasFetched.current) {
        hasFetched.current = true;
        setIsLoading(true);

        try {
          const proposalData = await auctionFactoryContract.read.proposals([proposalId]);
          setProposal(proposalData);

          const metadataURI = proposalData[1];
          if (metadataURI) {
            const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://ipfs.io";
            const ipfsHash = metadataURI.replace("ipfs://", "");
            const fullUrl = `${gateway}/ipfs/${ipfsHash}`;

            fetch(fullUrl)
              .then(res => res.json())
              .then(data => {
                setAssetName(data.name || "Tanpa Nama");
                setDescription(data.description || "Tidak ada deskripsi."); // Ambil deskripsi
                setShortDescription(data.shortDescription || "Tidak ada deskripsi singkat.");
                setCategories(data.type || "Tidak ada kategori.");

                // Ambil gambar utama dari properti "thumbnail"
                if (data.thumbnail) {
                  const imageHash = data.thumbnail.replace("ipfs://", "");
                  setImageUrl(`https://gateway.pinata.cloud/ipfs/${imageHash}`);
                }

                // Ambil semua gambar untuk galeri dari properti "images"
                if (data.imageUri && Array.isArray(data.imageUri)) {
                  const imageUrls = data.imageUri.map(
                    (imgUri: string) => `${gateway}/ipfs/${imgUri.replace("ipfs://", "")}`,
                  );
                  setImages(imageUrls);
                }
              });
          }

          if (connectedAddress) {
            const reviewerRole = await auctionFactoryContract.read.REVIEWER_ROLE();
            const hasRole = await auctionFactoryContract.read.hasRole([reviewerRole, connectedAddress]);
            setIsReviewer(hasRole);
          }
        } catch (e) {
          console.error(`Gagal mengambil data untuk proposal ${proposalId}:`, e);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [proposalId, auctionFactoryContract, connectedAddress]);

  return {
    proposal,
    assetName,
    description,
    imageUrl,
    images,
    isReviewer,
    isLoading,
    shortDescription,
    categories,
  };
};
