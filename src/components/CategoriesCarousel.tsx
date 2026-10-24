import React, { useRef } from 'react';
import { Category } from '../types';
import { CoffeeProductIcon } from './CoffeeIcons';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CategoriesCarouselProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesCarousel: React.FC<CategoriesCarouselProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'right' ? 200 : -200;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 my-3 sm:my-4">
      {/* Header with Title and Scroll Controls */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-black font-['Tajawal',sans-serif] text-[#12302B]">
            الأقسام
          </h2>
          <span className="text-[11px] text-[#4b5563] font-medium font-mono">
            ({categories.length})
          </span>
        </div>

        {/* Desktop scroll buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-[#e6e8e4] bg-white text-[#12302B] hover:bg-[#f4f7f5] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
            aria-label="تمرير للأمام"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-[#e6e8e4] bg-white text-[#12302B] hover:bg-[#f4f7f5] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
            aria-label="تمرير للخلف"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Categories Bar: Full Names without Truncation, >=44px Touch Targets */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
      >
        {categories.map((cat) => {
          const isSelected =
            selectedCategory === cat.id ||
            (selectedCategory !== 'all' && (
              selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
              selectedCategory === cat.name ||
              selectedCategory.toLowerCase() === cat.name.toLowerCase()
            ));

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer transition-all duration-200 select-none border text-xs sm:text-sm font-bold font-['Tajawal',sans-serif] ${
                isSelected
                  ? 'bg-[#12302B] text-white border-[#12302B] shadow-sm ring-2 ring-[#12302B]/20 scale-[1.02]'
                  : 'bg-white text-[#1f2937] hover:text-[#12302B] hover:bg-[#f4f7f5] border-[#e6e8e4] shadow-2xs'
              }`}
              title={cat.name}
            >
              {/* Category Icon */}
              <div
                className={`w-5 h-5 flex items-center justify-center shrink-0 transition-transform ${
                  isSelected ? 'text-[#e4e8bf]' : 'text-[#12302B]'
                }`}
              >
                <CoffeeProductIcon type={cat.iconType} className="w-full h-full stroke-[2]" />
              </div>

              {/* Full Category Name without truncation */}
              <span className="whitespace-nowrap leading-none tracking-tight">
                {cat.name}
              </span>

              {/* Optional Product Count Badge if available */}
              {cat.itemCount !== undefined && cat.itemCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                    isSelected
                      ? 'bg-white/20 text-[#e4e8bf]'
                      : 'bg-[#f4f7f5] text-[#4b5563]'
                  }`}
                >
                  {cat.itemCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
