export interface Reviewer {
  id: string;
  address: string;
  expertise: string[];
  reviewsCompleted: number;
  rating: number;
  joinedDate: string;
  isActive: boolean;
}

export const mockReviewers: Reviewer[] = [
  {
    id: "reviewer001",
    address: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
    expertise: ["Real Estate", "Art", "Luxury Items"],
    reviewsCompleted: 45,
    rating: 4.9,
    joinedDate: "2024-02-01",
    isActive: true,
  },
  {
    id: "reviewer002",
    address: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
    expertise: ["Electronics", "Vehicles", "Collectibles"],
    reviewsCompleted: 38,
    rating: 4.8,
    joinedDate: "2024-02-15",
    isActive: true,
  },
  {
    id: "reviewer003",
    address: "0x4d5e6f7890abcdef1234567890abcdef12345678",
    expertise: ["Art", "Antiques", "Jewelry"],
    reviewsCompleted: 52,
    rating: 4.9,
    joinedDate: "2024-01-20",
    isActive: true,
  },
  {
    id: "reviewer004",
    address: "0x5e6f7890abcdef1234567890abcdef123456789a",
    expertise: ["Real Estate", "Construction", "Land"],
    reviewsCompleted: 29,
    rating: 4.7,
    joinedDate: "2024-03-01",
    isActive: true,
  },
  {
    id: "reviewer005",
    address: "0x6f7890abcdef1234567890abcdef123456789abc",
    expertise: ["Electronics", "Technology", "Medical Equipment"],
    reviewsCompleted: 33,
    rating: 4.8,
    joinedDate: "2024-02-28",
    isActive: false, // Currently inactive
  },
];
