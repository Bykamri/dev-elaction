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

export const dynamicAssetFields: Record<string, { label: string; type: string; id: string; placeholder?: string }[]> = {
  "Digital Art": [
    { label: "Artist Name", type: "text", id: "artistName", placeholder: "e.g., PixelMaster" },
    { label: "Creation Date", type: "date", id: "creationDate" },
    { label: "File Format", type: "text", id: "fileFormat", placeholder: "e.g., PNG, JPG, GIF" },
  ],
  Watches: [
    { label: "Brand", type: "text", id: "brand", placeholder: "e.g., Rolex" },
    { label: "Model", type: "text", id: "model", placeholder: "e.g., Daytona 6263" },
    { label: "Year", type: "number", id: "year", placeholder: "e.g., 1970" },
    { label: "Movement Type", type: "text", id: "movementType", placeholder: "e.g., Automatic, Manual" },
  ],
  Books: [
    { label: "Author", type: "text", id: "author", placeholder: "e.g., F. Scott Fitzgerald" },
    { label: "Publisher", type: "text", id: "publisher", placeholder: "e.g., Charles Scribner's Sons" },
    { label: "Publication Year", type: "number", id: "publicationYear", placeholder: "e.g., 1925" },
    { label: "ISBN", type: "text", id: "isbn", placeholder: "e.g., 978-0743273565" },
  ],
  Collectibles: [
    { label: "Item Type", type: "text", id: "itemType", placeholder: "e.g., Sports Card, Stamp" },
    { label: "Condition", type: "text", id: "condition", placeholder: "e.g., Mint, Good" },
    { label: "Year/Era", type: "text", id: "yearEra", placeholder: "e.g., 1990s, Ancient Roman" },
  ],
  "Fine Art": [
    { label: "Artist Name", type: "text", id: "artistName", placeholder: "e.g., Vincent van Gogh" },
    { label: "Medium", type: "text", id: "medium", placeholder: "e.g., Oil on canvas, Sculpture" },
    { label: "Dimensions", type: "text", id: "dimensions", placeholder: "e.g., 24x36 inches" },
  ],
  Travel: [
    { label: "Destination", type: "text", id: "destination", placeholder: "e.g., Mediterranean, Tanzania" },
    { label: "Duration (Days)", type: "number", id: "durationDays", placeholder: "e.g., 7" },
    { label: "Inclusions", type: "textarea", id: "inclusions", placeholder: "e.g., Crew, Catering, Excursions" },
  ],
  Comics: [
    { label: "Series Title", type: "text", id: "seriesTitle", placeholder: "e.g., Amazing Fantasy" },
    { label: "Issue Number", type: "text", id: "issueNumber", placeholder: "e.g., #15" },
    { label: "Publisher", type: "text", id: "publisher", placeholder: "e.g., Marvel Comics" },
    { label: "Grade (CGC/PSA)", type: "text", id: "grade", placeholder: "e.g., CGC 8.0" },
  ],
  Memorabilia: [
    { label: "Origin", type: "text", id: "origin", placeholder: "e.g., Apollo 11, Celebrity" },
    { label: "Authenticity", type: "text", id: "authenticity", placeholder: "e.g., Certified, Autographed" },
    { label: "Item Type", type: "text", id: "itemType", placeholder: "e.g., Photo, Prop" },
  ],
  Electronics: [
    { label: "Brand", type: "text", id: "brand", placeholder: "e.g., Sony, Nintendo" },
    { label: "Model", type: "text", id: "model", placeholder: "e.g., PlayStation 1, Walkman" },
    { label: "Condition", type: "text", id: "condition", placeholder: "e.g., Fully functional, For parts" },
  ],
  Jewelry: [
    { label: "Material", type: "text", id: "material", placeholder: "e.g., Gold, Platinum" },
    { label: "Gemstone", type: "text", id: "gemstone", placeholder: "e.g., Diamond, Emerald" },
    { label: "Carat Weight", type: "number", id: "caratWeight", placeholder: "e.g., 2.5" },
  ],
  Vehicles: [
    { label: "Make", type: "text", id: "make", placeholder: "e.g., Ford, Harley-Davidson" },
    { label: "Model", type: "text", id: "model", placeholder: "e.g., Mustang, Sportster" },
    { label: "Year", type: "number", id: "year", placeholder: "e.g., 1965" },
    { label: "Mileage", type: "number", id: "mileage", placeholder: "e.g., 50000" },
  ],
  Default: [
    {
      label: "Additional Details",
      type: "textarea",
      id: "additionalDetails",
      placeholder: "Any other relevant details about the asset.",
    },
  ],
};

export const assetCategories = Object.keys(categoryConfig)
  .filter(key => key !== "Default")
  .sort();
