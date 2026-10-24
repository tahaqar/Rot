import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'ابحث عن منتجات...',
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-1">
      <div className="relative flex items-center w-full">
        
        {/* Full-width Oval rounded-full Search Bar matching Screenshot 3 */}
        <div className="relative w-full flex items-center h-[48px] sm:h-[50px] bg-white border border-[#e5e7eb] rounded-full px-4 sm:px-5 shadow-xs hover:border-[#12302a]/30 focus-within:border-[#12302a] focus-within:shadow-sm transition-all duration-200">
          
          {/* Lens Icon at the right side in RTL */}
          <Search className="w-5 h-5 text-[#6b7280] shrink-0 ml-3 pointer-events-none" />

          {/* Text Input */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full bg-transparent text-sm sm:text-base text-[#111827] placeholder-[#9ca3af] focus:outline-hidden font-medium"
          />

          {/* Clear button if search is active */}
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="w-7 h-7 rounded-full bg-[#f3f4f6] text-[#6b7280] hover:text-[#111827] hover:bg-[#e5e7eb] flex items-center justify-center transition-colors cursor-pointer mr-1"
              aria-label="مسح نص البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

