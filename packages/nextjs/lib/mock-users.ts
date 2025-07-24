export interface User {
  id: string;
  address: string;
  role: "admin" | "customer" | "reviewer";
  joinedDate: string;
  isActive: boolean;
}

export const mockUsers: User[] = [
  {
    id: "admin456",
    address: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    role: "admin",
    joinedDate: "2024-01-15",
    isActive: true,
  },
  {
    id: "reviewer001",
    address: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
    role: "reviewer",
    joinedDate: "2024-02-01",
    isActive: true,
  },
  {
    id: "reviewer002",
    address: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
    role: "reviewer",
    joinedDate: "2024-02-15",
    isActive: true,
  },
  {
    id: "customer001",
    address: "0x4d5e6f7890abcdef1234567890abcdef12345678",
    role: "customer",
    joinedDate: "2024-03-01",
    isActive: true,
  },
  {
    id: "customer002",
    address: "0x5e6f7890abcdef1234567890abcdef123456789a",
    role: "customer",
    joinedDate: "2024-03-15",
    isActive: true,
  },
  {
    id: "customer003",
    address: "0x6f7890abcdef1234567890abcdef123456789abc",
    role: "customer",
    joinedDate: "2024-04-01",
    isActive: false,
  },
];
