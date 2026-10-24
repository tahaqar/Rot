import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Sparkles, Filter } from 'lucide-react';
import { Product } from '../types';
import { CoffeeProductIcon } from './CoffeeIcons';
import { formatPrice } from '../utils/formatters';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const POPULAR_TAGS = ['V60', 'طاحونة C3', 'فيلو ستاغ', 'سيراميك', 'ميزان ذكي', 'إسبريسو', 'فلاتر'];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onAddToCart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.isPublished !== false &&
        (p.name.toLowerCase().includes(term) ||
          (p.nameEn && p.nameEn.toLowerCase().includes(term)) ||
          p.brand.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term))
    );
  }, [searchTerm, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a1411]/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-12 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#e6e8e4] bg-[#fafaf8] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#12302a] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="ابحث عن أداة تقطير، طاحونة، قمع، غلاية، ميزان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-[#12302a] placeholder-[#6b7680] focus:outline-hidden font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-[#6b7680] hover:text-[#12302a] bg-white border border-[#e6e8e4] px-2 py-1 rounded-lg cursor-pointer"
            >
              مسح
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white border border-[#e6e8e4] text-[#12302a] hover:bg-[#eef5f1] transition-colors cursor-pointer"
            aria-label="إغلاق البحث"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Popular Tags */}
        <div className="px-5 py-3 bg-[#eef5f1]/50 border-b border-[#e6e8e4] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-[#6b7680] shrink-0">الأكثر بحثاً:</span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchTerm(tag)}
              className="text-xs bg-white text-[#12302a] border border-[#e6e8e4] hover:border-[#12302a] px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {searchTerm.trim() === '' ? (
            <div className="py-12 text-center text-[#6b7680] space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#eef5f1] flex items-center justify-center mx-auto text-[#12302a]">
                <Search className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-[#12302a]">ابدأ البحث في متجر نغمة فنجان</h3>
              <p className="text-xs max-w-sm mx-auto">
                اكتب اسم الأداة أو الماركة (Hario, Timemore, Fellow, Comandante) للوصول المباشر.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-[#6b7680] space-y-2">
              <p className="text-sm font-bold text-[#12302a]">لم نجد نتائج تطابق "{searchTerm}"</p>
              <p className="text-xs">تأكد من كتابة الكلمات بشكل صحيح أو جرب البحث باسم الماركة.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#fafaf8] border border-[#e6e8e4] hover:border-[#12302a] hover:bg-white transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-[#eef5f1] flex items-center justify-center shrink-0 p-1.5 text-[#12302a] overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <CoffeeProductIcon type={product.iconType} className="w-8 h-8" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#1e4c42] bg-[#eef5f1] px-1.5 py-0.5 rounded">
                      {product.brand}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#12302a] truncate mt-0.5 group-hover:text-[#173d35]">
                      {product.name}
                    </h4>
                    <span className="text-xs font-black text-[#12302a] block mt-0.5 font-mono">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="p-2.5 rounded-xl bg-[#12302a] text-[#e4e8bf] hover:bg-[#173d35] transition-colors shrink-0 mr-2 cursor-pointer"
                  aria-label="إضافة للسلة"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
