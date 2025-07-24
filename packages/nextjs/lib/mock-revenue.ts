export interface CompletedAuction {
  id: string;
  title: string;
  finalBid: string;
  currency: "IDRX";
  status: "closed";
  endTime: string;
  winner: string;
  category: string;
  description: string;
}

export const mockCompletedAuctions: CompletedAuction[] = [
  {
    id: "auction-001",
    title: "Luxury Villa in Seminyak",
    finalBid: "850000",
    currency: "IDRX",
    status: "closed",
    endTime: "2024-12-15T10:30:00Z",
    winner: "0x1234...5678",
    category: "Real Estate",
    description: "Beautiful beachfront villa with private pool and garden.",
  },
  {
    id: "auction-002",
    title: "Vintage Rolex Submariner",
    finalBid: "125000",
    currency: "IDRX",
    status: "closed",
    endTime: "2024-12-14T15:45:00Z",
    winner: "0x2345...6789",
    category: "Luxury Watches",
    description: "1965 Rolex Submariner in excellent condition with original box.",
  },
  {
    id: "auction-003",
    title: "Tesla Model S Plaid",
    finalBid: "320000",
    currency: "IDRX",
    status: "closed",
    endTime: "2024-12-13T18:20:00Z",
    winner: "0x3456...7890",
    category: "Vehicles",
    description: "2023 Tesla Model S Plaid with full self-driving capability.",
  },
  {
    id: "auction-004",
    title: "Contemporary Art Collection",
    finalBid: "185000",
    currency: "IDRX",
    status: "closed",
    endTime: "2024-12-12T14:15:00Z",
    winner: "0x4567...8901",
    category: "Art",
    description: "Curated collection of modern Indonesian contemporary art pieces.",
  },
  {
    id: "auction-005",
    title: "MacBook Pro M3 Max 16-inch",
    finalBid: "45000",
    currency: "IDRX",
    status: "closed",
    endTime: "2024-12-11T11:30:00Z",
    winner: "0x5678...9012",
    category: "Electronics",
    description: "Brand new MacBook Pro with M3 Max chip, 64GB RAM, 2TB SSD.",
  },
  {
    id: "auction-006",
    title: "Bali Investment Land",
    finalBid: "750000",
    currency: "IDRX",
    status: "closed",
    endTime: "2024-12-10T16:45:00Z",
    winner: "0x6789...0123",
    category: "Real Estate",
    description: "Prime investment land in Canggu area, 2000 sqm with development permit.",
  },
  {
    id: "auction-007",
    title: "Yamaha YZF-R1M 2024",
    finalBid: "95000",
    currency: "IDRX",
    status: "closed",
    endTime: "2024-12-09T13:20:00Z",
    winner: "0x7890...1234",
    category: "Motorcycles",
    description: "Limited edition Yamaha superbike with carbon fiber bodywork.",
  },
  {
    id: "auction-008",
    title: "Rare Pokémon Card Collection",
    finalBid: "28000",
    currency: "IDRX",
    status: "closed",
    endTime: "2024-12-08T09:15:00Z",
    winner: "0x8901...2345",
    category: "Collectibles",
    description: "First edition holographic Charizard and other rare cards in mint condition.",
  },
  {
    id: "auction-009",
    title: "Luxury Yacht Share - 25%",
    finalBid: "420000",
    currency: "IDRX",
    status: "closed",
    endTime: "2024-12-07T17:30:00Z",
    winner: "0x9012...3456",
    category: "Maritime",
    description: "25% ownership share in 50-foot luxury yacht based in Marina Bay.",
  },
  {
    id: "auction-010",
    title: "Hermès Birkin Bag Limited Edition",
    finalBid: "180000",
    currency: "IDRX",
    status: "closed",
    endTime: "2024-12-06T12:45:00Z",
    winner: "0x0123...4567",
    category: "Luxury Fashion",
    description: "Rare Hermès Birkin 35cm in Himalaya Niloticus crocodile with diamond hardware.",
  },
];

// Revenue calculation utilities
export const PLATFORM_FEE_PERCENTAGE = 0.05; // 5% platform fee

export const calculateRevenueMetrics = (auctions: CompletedAuction[]) => {
  const totalAuctionValue = auctions.reduce((sum, auction) => {
    const bidValue = parseFloat(auction.finalBid);
    return sum + bidValue;
  }, 0);

  const totalPlatformFees = totalAuctionValue * PLATFORM_FEE_PERCENTAGE;
  const netRevenue = totalAuctionValue - totalPlatformFees;
  const averageAuctionValue = auctions.length > 0 ? totalAuctionValue / auctions.length : 0;

  return {
    totalAuctionValue,
    totalPlatformFees,
    netRevenue,
    averageAuctionValue,
    completedAuctionsCount: auctions.length,
  };
};
