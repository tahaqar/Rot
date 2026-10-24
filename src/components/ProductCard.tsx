import React, { useState } from 'react';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { CoffeeProductIcon } from './CoffeeIcons';
import { formatPrice } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onViewProduct,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleWish = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  const isAvailable = product.inStock && (product.stockCount === undefined || product.stockCount > 0);

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onViewProduct(product)}
      className="group bg-white rounded-2xl border border-[#e6e8e4] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col relative select-none"
    >
      {/* Top Part: Square Image Container with soft cream background */}
      <div className="relative aspect-square w-full bg-[#f9faf8] overflow-hidden flex items-center justify-center p-2 rounded-t-2xl">
        
        {/* Promotional Badge on top right in RTL */}
        {product.badge && (
          <span className="absolute top-2 right-2 z-10 bg-[#12302B] text-[#e4e8bf] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs font-['Tajawal',sans-serif]">
            {product.badge}
          </span>
        )}

        {/* Wishlist Button on top left in RTL: >=44px touch target */}
        <button
          onClick={handleWish}
          className="absolute top-1.5 left-1.5 z-10 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/90 backdrop-blur-xs text-[#12302B] hover:text-[#c0392b] flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer border border-[#e6e8e4]"
          aria-label="إضافة إلى المفضلة"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWishlisted ? 'fill-[#c0392b] text-[#c0392b]' : 'text-[#4b5563]'
            }`}
          />
        </button>

        {/* Product Image or Vector Illustration with subtle scale on hover */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-1.5 transform group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-[#12302B] transform group-hover:scale-105 transition-transform duration-300">
            <CoffeeProductIcon type={product.iconType} className="w-full h-full" />
          </div>
        )}
      </div>

      {/* Bottom Part: Product Details */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-1">
          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold font-['Tajawal',sans-serif] text-[#17191c] line-clamp-2 leading-snug group-hover:text-[#12302B] transition-colors min-h-[36px] sm:min-h-[40px]">
            {product.name}
          </h3>

          {/* Brand & Subcategory Chip */}
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {product.brand && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f4f7f5] text-[#12302B] border border-[#e6e8e4] truncate max-w-[110px]">
                {product.brand}
              </span>
            )}
            {product.subcategory && (
              <span className="text-[10px] font-medium text-[#4b5563] truncate hidden sm:inline">
                {product.subcategory}
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e6e8e4] my-2" />

        {/* Price & Cart Action Bar (Touch Targets >= 44px) */}
        <div className="flex items-center justify-between gap-1.5">
          
          {/* Price */}
          <div className="flex flex-col text-right">
            <div className="text-xs sm:text-sm font-black font-mono text-[#12302B] leading-tight">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[10px] text-[#6b7280] line-through font-mono">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Cart Button: >=44px touch target (w-11 h-11) */}
          <button
            onClick={handleAdd}
            disabled={!isAvailable}
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl transition-all flex items-center justify-center shadow-xs active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
              justAdded
                ? 'bg-[#1e4c42] text-white'
                : 'bg-[#12302B] text-white hover:bg-[#1a403a]'
            }`}
            aria-label={`إضافة ${product.name} للسلة`}
            title={isAvailable ? 'إضافة للسلة' : 'غير متوفر'}
          >
            {justAdded ? (
              <Check className="w-5 h-5 text-[#e4e8bf]" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-[#e4e8bf]" />
            )}
          </button>

        </div>
      </div>
    </div>
  );
};
