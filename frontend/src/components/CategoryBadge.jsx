import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Film,
  Zap,
  Home,
  Plane,
  Tag
} from 'lucide-react';

export const getCategoryIcon = (category, size = 14) => {
  switch (category) {
    case 'Food':
      return <Utensils size={size} />;
    case 'Transportation':
      return <Car size={size} />;
    case 'Shopping':
      return <ShoppingBag size={size} />;
    case 'Education':
      return <GraduationCap size={size} />;
    case 'Healthcare':
      return <HeartPulse size={size} />;
    case 'Entertainment':
      return <Film size={size} />;
    case 'Bills and Utilities':
      return <Zap size={size} />;
    case 'Rent':
      return <Home size={size} />;
    case 'Travel':
      return <Plane size={size} />;
    default:
      return <Tag size={size} />;
  }
};

export const CategoryBadge = ({ category }) => {
  const safeCategoryClass = (category || 'Other').replace(/\s+/g, '-');
  return (
    <span className={`badge badge-category-${safeCategoryClass}`}>
      {getCategoryIcon(category, 13)}
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;
