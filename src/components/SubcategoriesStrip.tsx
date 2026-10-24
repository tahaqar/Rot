import React from 'react';
import { Subcategory, Category, Product } from '../types';

interface SubcategoriesStripProps {
  category?: Category;
  selectedSubcategory: string;
  onSelectSubcategory: (subcategoryId: string) => void;
  products?: Product[];
}

export const SubcategoriesStrip: React.FC<SubcategoriesStripProps> = ({
  category,
  selectedSubcategory,
  onSelectSubcategory,
  products = [],
}) => {
  if (!category || !category.subcategories || category.subcategories.length === 0) {
    return null;
  }

  const rawSubcategories = category.subcategories;

  // Calculate live item count for each subcategory branch
  const getSubcategoryCount = (sub: Subcategory) => {
    return products.filter((p) => {
      if (p.isPublished === false) return false;
      const subId = (p.subcategoryId || '').trim().toLowerCase();
      const subName = (p.subcategory || '').trim().toLowerCase();
      const targetId = sub.id.trim().toLowerCase();
      const targetName = sub.name.trim().toLowerCase();
      return subId === targetId || subName === targetName;
    }).length;
  };

  // Hide any branch whose product count is 0 as requested
  const activeBranches = rawSubcategories.filter((s) => getSubcategoryCount(s) > 0);

  // If number of branches with products is less than 2, hide the entire row as requested
  if (activeBranches.length < 2) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 my-2 font-['Tajawal',sans-serif]">
      {/* Horizontal scrollable chips: frameless, clean */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {/* 'الكل' chip */}
        <button
          type="button"
          onClick={() => onSelectSubcategory('all')}
          className={`min-h-[44px] shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center select-none active:scale-95 border ${
            selectedSubcategory === 'all'
              ? 'bg-[#12302B] text-white border-[#12302B] shadow-xs'
              : 'bg-white text-[#12302B] border-[#e6e8e4] hover:bg-[#f4f7f5]'
          }`}
        >
          الكل
        </button>

        {/* Branch names chips */}
        {activeBranches.map((subcat) => {
          const isSelected =
            selectedSubcategory.trim().toLowerCase() === subcat.id.trim().toLowerCase() ||
            selectedSubcategory.trim().toLowerCase() === subcat.name.trim().toLowerCase();

          return (
            <button
              key={subcat.id}
              type="button"
              onClick={() => onSelectSubcategory(subcat.id)}
              className={`min-h-[44px] shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center select-none active:scale-95 border ${
                isSelected
                  ? 'bg-[#12302B] text-white border-[#12302B] shadow-xs'
                  : 'bg-white text-[#12302B] border-[#e6e8e4] hover:bg-[#f4f7f5]'
              }`}
            >
              {subcat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
