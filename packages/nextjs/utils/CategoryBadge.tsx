import { categoryConfig } from "~~/lib/categoryConfig";

interface CategoryBadgeProps {
  category: string;
}

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const config = categoryConfig[category] || categoryConfig.Default;

  const { icon: Icon, className } = config;

  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm  ${className}`}>
      <Icon className="mr-2 h-3 w-3" />
      {category}
    </div>
  );
};
