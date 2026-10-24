import React, { useMemo } from 'react';
import { X, ArrowUpDown, Filter, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Category, Product } from '../types';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  brands: { id: string; name: string; origin?: string; itemCount?: number }[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  selectedSubcategory: string;
  onSelectSubcategory: (subId: string) => void;
  selectedBrand: string;
  onSelectBrand: (brandName: string) => void;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'rating';
  onSortChange: (sort: 'popular' | 'price-asc' | 'price-desc' | 'rating') => void;
  onlyInStock: boolean;
  onToggleInStock: (value: boolean) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  products: Product[];
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  categories,
  brands,
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  selectedBrand,
  onSelectBrand,
  sortBy,
  onSortChange,
  onlyInStock,
  onToggleInStock,
  onResetFilters,
  totalFilteredCount,
  products,
}) => {
  // Compute available branches/subcategories with product count > 0 (Hides any branch with 0 products)
  const availableBranches = useMemo(() => {
    let rawSubs: { id: string; name: string }[] = [];

    if (selectedCategory && selectedCategory !== 'all') {
      const activeCat = categories.find(
        (c) =>
          c.id.toLowerCase() === selectedCategory.toLowerCase() ||
          c.name.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
      );
      if (activeCat && activeCat.subcategories) {
        rawSubs = activeCat.subcategories;
      }
    } else {
      // Gather subcategories across all categories
      const seen = new Set<string>();
      categories.forEach((cat) => {
        (cat.subcategories || []).forEach((sub) => {
          if (!seen.has(sub.id)) {
            seen.add(sub.id);
            rawSubs.push(sub);
          }
        });
      });
    }

    // Calculate product count for each branch and strictly filter out any branch where count === 0
    return rawSubs
      .map((sub) => {
        const count = products.filter((p) => {
          if (p.isPublished === false) return false;
          const subIdMatch =
            p.subcategoryId && p.subcategoryId.trim().toLowerCase() === sub.id.toLowerCase();
          const subNameMatch =
            p.subcategory && p.subcategory.trim().toLowerCase() === sub.name.trim().toLowerCase();
          const catMatch =
            p.category && p.category.trim().toLowerCase() === sub.id.toLowerCase();
          return subIdMatch || subNameMatch || catMatch;
        }).length;

        return { ...sub, count };
      })
      .filter((sub) => sub.count > 0); // Crucial rule: Hide any branch whose product count is 0
  }, [categories, selectedCategory, products]);

  // Filter available brands that have at least 1 product
  const availableBrands = useMemo(() => {
    return brands.filter((b) => (b.itemCount === undefined || b.itemCount > 0));
  }, [brands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0a1411]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-in Bottom Sheet (Mobile First) / Centered Modal (Desktop) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-white rounded-t-[24px] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300 border-t border-[#e6e8e4]"
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#fafaf8]">
          <div className="w-12 h-1 rounded-full bg-[#cbd5e1]" />
        </div>

        {/* Header Bar */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-[#e6e8e4] bg-[#fafaf8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#12302B]/10 flex items-center justify-center text-[#12302B]">
              <Filter className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black font-['Tajawal',sans-serif] text-[#12302B] leading-tight">
                التصفية والخيارات
              </h2>
              <p className="text-[11px] text-[#4b5563] font-medium leading-none mt-0.5">
                تخصيص الفروع، الماركات، والترتيب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetFilters}
              className="min-h-[44px] px-2 text-xs font-bold text-[#c0392b] hover:underline flex items-center gap-1 cursor-pointer select-none active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white border border-[#e6e8e4] text-[#12302B] flex items-center justify-center hover:bg-[#f4f7f5] transition-colors cursor-pointer active:scale-95 shadow-2xs"
              aria-label="إغلاق التصفية"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Filters Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1 bg-white">
          
          {/* 1. Subcategories / Branches Section (فروع القسم - أخفِ أي فرع منتجاته 0) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-bold text-[#12302B] font-['Tajawal',sans-serif] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#12302B]" />
                <span>فروع وتصنيفات المنتجات:</span>
              </label>
              {selectedSubcategory !== 'all' && (
                <button
                  onClick={() => onSelectSubcategory('all')}
                  className="text-[11px] text-[#c0392b] font-bold hover:underline cursor-pointer"
                >
                  عرض جميع الفروع
                </button>
              )}
            </div>

            {availableBranches.length === 0 ? (
              <div className="p-3 bg-[#fafaf8] rounded-xl border border-[#e6e8e4] text-center text-xs text-[#4b5563]">
                لا توجد فروع فرعية إضافية متاحة لهذا القسم
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSelectSubcategory('all')}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedSubcategory === 'all'
                      ? 'bg-[#12302B] text-white border-[#12302B] shadow-2xs'
                      : 'bg-[#fafaf8] border-[#e6e8e4] text-[#1f2937] hover:bg-[#f4f7f5]'
                  }`}
                >
                  {selectedSubcategory === 'all' && <Check className="w-3.5 h-3.5" />}
                  <span>جميع الفروع</span>
                </button>

                {availableBranches.map((branch) => {
                  const isSelected =
                    selectedSubcategory.toLowerCase() === branch.id.toLowerCase() ||
                    selectedSubcategory.trim().toLowerCase() === branch.name.trim().toLowerCase();

                  return (
                    <button
                      key={branch.id}
                      onClick={() => onSelectSubcategory(isSelected ? 'all' : branch.id)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#12302B] text-white border-[#12302B] shadow-2xs'
                          : 'bg-[#fafaf8] border-[#e6e8e4] text-[#1f2937] hover:bg-[#f4f7f5]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{branch.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          isSelected ? 'bg-white/20 text-[#e4e8bf]' : 'bg-white text-[#4b5563] border border-[#e6e8e4]'
                        }`}
                      >
                        {branch.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Brands Filter Section (الماركات) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-bold text-[#12302B] font-['Tajawal',sans-serif]">
                الماركة التجارية:
              </label>
              {selectedBrand !== 'all' && (
                <button
                  onClick={() => onSelectBrand('all')}
                  className="text-[11px] text-[#c0392b] font-bold hover:underline cursor-pointer"
                >
                  جميع الماركات
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar p-0.5">
              <button
                onClick={() => onSelectBrand('all')}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedBrand === 'all'
                    ? 'bg-[#12302B] text-white border-[#12302B] shadow-2xs'
                    : 'bg-[#fafaf8] border-[#e6e8e4] text-[#1f2937] hover:bg-[#f4f7f5]'
                }`}
              >
                {selectedBrand === 'all' && <Check className="w-3.5 h-3.5" />}
                <span>جميع الماركات</span>
              </button>

              {availableBrands.map((b) => {
                const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
                return (
                  <button
                    key={b.id}
                    onClick={() => onSelectBrand(isSelected ? 'all' : b.name)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#12302B] text-white border-[#12302B] shadow-2xs'
                        : 'bg-[#fafaf8] border-[#e6e8e4] text-[#1f2937] hover:bg-[#f4f7f5]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{b.name}</span>
                    {b.itemCount !== undefined && b.itemCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          isSelected ? 'bg-white/20 text-[#e4e8bf]' : 'bg-white text-[#4b5563] border border-[#e6e8e4]'
                        }`}
                      >
                        {b.itemCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Sorting Order (الترتيب) */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#12302B] mb-2 font-['Tajawal',sans-serif] flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#12302B]" />
              <span>ترتيب المنتجات:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'popular', label: 'الأكثر طلباً' },
                { id: 'rating', label: 'الأعلى تقييماً' },
                { id: 'price-asc', label: 'السعر: الأقل أولاً' },
                { id: 'price-desc', label: 'السعر: الأعلى أولاً' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSortChange(item.id as any)}
                  className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border text-center transition-all cursor-pointer ${
                    sortBy === item.id
                      ? 'bg-[#12302B] text-[#e4e8bf] border-[#12302B] shadow-2xs'
                      : 'bg-[#fafaf8] border-[#e6e8e4] text-[#1f2937] hover:bg-[#f4f7f5]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. In Stock Only Toggle (المتوفر بالمخزن فقط) */}
          <div
            onClick={() => onToggleInStock(!onlyInStock)}
            className="min-h-[44px] p-3 rounded-xl bg-[#fafaf8] border border-[#e6e8e4] flex items-center justify-between cursor-pointer select-none hover:border-[#12302B]/40 transition-colors"
          >
            <span className="text-xs sm:text-sm font-bold text-[#12302B]">
              عرض المنتجات المتوفرة في المخزن فقط
            </span>
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => onToggleInStock(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 rounded text-[#12302B] accent-[#12302B] cursor-pointer"
            />
          </div>

        </div>

        {/* Sticky Bottom Actions Bar (Touch Targets >= 44px) */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md p-3 sm:p-4 border-t border-[#e6e8e4] shadow-lg flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 min-h-[48px] py-3 rounded-xl bg-[#12302B] text-white hover:bg-[#1a403a] text-sm sm:text-base font-bold shadow-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>عرض النتائج</span>
            <span className="font-mono bg-white/20 text-[#e4e8bf] px-2 py-0.5 rounded-full text-xs">
              {totalFilteredCount} منتج
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
