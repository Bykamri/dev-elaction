import { Award, Book, type LucideIcon, Paintbrush, Palette, Plane, Star, Tag, Watch, Zap } from "lucide-react";

export const categoryConfig: Record<string, { icon: LucideIcon; className: string }> = {
  "Digital Art": { icon: Palette, className: "bg-blue-100 text-blue-800" },
  Watches: { icon: Watch, className: "bg-yellow-100 text-yellow-800" },
  Books: { icon: Book, className: "bg-green-100 text-green-800" },
  Collectibles: { icon: Star, className: "bg-red-100 text-red-800" },
  "Fine Art": { icon: Paintbrush, className: "bg-indigo-100 text-indigo-800" },
  Travel: { icon: Plane, className: "bg-teal-100 text-teal-800" },
  Comics: { icon: Zap, className: "bg-orange-100 text-orange-800" },
  Memorabilia: { icon: Award, className: "bg-purple-100 text-purple-800" },
  Electronics: { icon: Zap, className: "bg-gray-200 text-gray-800" },
  Jewelry: { icon: Star, className: "bg-pink-100 text-pink-800" },
  Vehicles: { icon: Plane, className: "bg-lime-100 text-lime-800" },
  Default: { icon: Tag, className: "bg-gray-100 text-gray-800" },
};
