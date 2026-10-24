import React from 'react';
import { X, Heart, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { CoffeeProductIcon } from './CoffeeIcons';
import { formatPrice } from '../utils/formatters';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a1411]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e6e8e4] bg-[#fafaf8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-[#c0392b] text-[#c0392b]" />
            <h2 className="text-base font-black text-[#12302a] font-['Cairo']">
              قائمة المفضلة ({wishlistProducts.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white border border-[#e6e8e4] text-[#12302a] hover:bg-[#eef5f1] transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {wishlistProducts.length === 0 ? (
            <div className="py-14 text-center text-[#6b7680] space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#eef5f1] flex items-center justify-center mx-auto text-[#6b7680]">
                <Heart className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-[#12302a]">لا توجد عناصر في المفضلة</h3>
              <p className="text-xs max-w-xs mx-auto">
                اضغط على علامة القلب على أي منتج لحفظه والعودة إليه لاحقاً.
              </p>
            </div>
          ) : (
            wishlistProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#fafaf8] border border-[#e6e8e4] hover:border-[#12302a] transition-colors cursor-pointer group"
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
                      <CoffeeProductIcon type={product.iconType} className="w-8 h-8 text-[#12302a]" />
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

                <div className="flex items-center gap-1.5 shrink-0 mr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    className="p-2.5 rounded-xl bg-[#12302a] text-[#e4e8bf] hover:bg-[#173d35] transition-colors cursor-pointer"
                    title="إضافة إلى السلة"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromWishlist(product.id);
                    }}
                    className="p-2.5 rounded-xl bg-white border border-[#e6e8e4] text-[#6b7680] hover:text-[#c0392b] hover:border-[#c0392b] transition-colors cursor-pointer"
                    title="حذف من المفضلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
