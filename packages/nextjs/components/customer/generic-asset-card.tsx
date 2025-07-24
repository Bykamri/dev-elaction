"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { CategoryBadge } from "~~/utils/CategoryBadge";

// Tipe untuk mock asset data
type GenericAssetCardProps = {
  asset: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    currentPrice: string;
    status: string;
    seller?: string;
    timeLeft?: string;
    linkUrl?: string;
  };
};

export const GenericAssetCard = ({ asset }: GenericAssetCardProps) => {
  // Default link jika tidak ada
  const linkToDetails = asset.linkUrl || `/assets/${asset.id}`;
  const isFinished = asset.status === "sold" || asset.status === "finished";

  const getStatusBadge = () => {
    if (asset.status === "active" || asset.status === "live") {
      return <Badge className="absolute top-3 left-3 bg-blue-100 text-blue-800 border-blue-300">Live</Badge>;
    }
    if (asset.status === "sold") {
      return <Badge className="absolute top-3 left-3 bg-green-100 text-green-800 border-green-300">Terjual</Badge>;
    }
    if (asset.status === "finished") {
      return (
        <Badge variant="secondary" className="absolute top-3 left-3">
          Selesai
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Link href={linkToDetails} passHref>
        <div className="relative">
          <Image src={asset.imageUrl} alt={asset.title} width={400} height={300} className="w-full h-48 object-cover" />
          {getStatusBadge()}
          <div className="absolute top-3 right-3">
            <CategoryBadge category={asset.category} />
          </div>
        </div>
      </Link>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground truncate" title={asset.title}>
          {asset.title}
        </CardTitle>
        {asset.seller && (
          <CardDescription className="text-sm flex items-center" title={asset.seller}>
            <User className="w-4 h-4 mr-1.5" />
            <span>Oleh: {asset.seller}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 flex-grow">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">{isFinished ? "Harga Akhir" : "Harga Saat Ini"}</p>
            <p className="text-2xl font-bold text-blue-600">{asset.currentPrice}</p>
          </div>
          <div className="text-right">
            {!isFinished && asset.timeLeft && (
              <>
                <p className="text-sm text-muted-foreground">Sisa Waktu</p>
                <p className="text-lg font-semibold flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {asset.timeLeft}
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button asChild className="w-full" disabled={isFinished}>
          <Link href={linkToDetails}>
            {isFinished ? "Lihat Detail" : "Lihat Asset"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};
