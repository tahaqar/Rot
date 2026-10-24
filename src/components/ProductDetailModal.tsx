import React, { useState } from 'react';
import {
  X,
  Heart,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Instagram,
  Play,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { Product } from '../types';
import { CoffeeProductIcon } from './CoffeeIcons';
import { formatPrice } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  relatedProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  relatedProducts,
  onSelectProduct,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'brew'>('specs');
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const maxStock = product.stockCount !== undefined ? product.stockCount : 99;
  const isAvailable = product.inStock && maxStock > 0;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1400);
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    onBuyNow(product, quantity);
  };

  const specsList = product.specs ? Object.entries(product.specs) : [];
  const featuresList = product.features || [];
  const brewTips = product.brewGuideTips || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0a1411]/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-in Bottom Sheet (Mobile) / Centered Dialog (Desktop) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl bg-white rounded-t-[20px] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300"
      >
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-white">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Fixed Top Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-[#e6e8e4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.brand && (
              <span className="text-xs font-bold bg-[#eef5f1] text-[#12302a] px-3 py-1 rounded-full">
                {product.brand}
              </span>
            )}
            <span className="text-xs text-[#6b7680] font-mono hidden sm:inline">
              SKU: {product.sku}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="w-9 h-9 rounded-full border border-[#e6e8e4] text-[#12302a] hover:bg-[#eef5f1] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="المفضلة"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#c0392b] text-[#c0392b]' : 'text-[#6b7680]'}`} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#f4f7f5] text-[#12302a] hover:bg-[#eef5f1] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            {/* Square Image Box */}
            <div className="bg-[#f8faf8] rounded-2xl aspect-square flex items-center justify-center p-4 relative overflow-hidden border border-[#e6e8e4]">
              {product.badge && (
                <span className="absolute top-3 right-3 z-10 bg-[#12302a] text-[#e4e8bf] text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  {product.badge}
                </span>
              )}
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center text-[#12302a]">
                  <CoffeeProductIcon type={product.iconType} className="w-full h-full" />
                </div>
              )}
            </div>

            {/* Product Meta & Description */}
            <div className="space-y-3">
              <h1 className="text-base sm:text-xl font-bold font-['Cairo'] text-[#12302a] leading-snug">
                {product.name}
              </h1>

              {product.nameEn && (
                <p className="text-xs text-[#6b7680] font-mono">
                  {product.nameEn}
                </p>
              )}

              {/* Price card */}
              <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-[#e6e8e4] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#6b7680] font-medium">السعر</div>
                  <div className="text-xl sm:text-2xl font-bold text-[#12302a] font-mono">
                    {formatPrice(product.price)}
                  </div>
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-left">
                    <span className="bg-[#e74c3c] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      خصم {formatPrice(product.originalPrice - product.price)}
                    </span>
                    <div className="text-xs text-[#9ca3af] line-through font-mono mt-0.5">
                      {formatPrice(product.originalPrice)}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#4a554c] leading-relaxed">
                {product.description}
              </p>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-[#12302a] pt-1">
                <div className="bg-[#f8faf8] border border-[#e6e8e4] p-2 rounded-xl flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#1e4c42]" />
                  <span>أصلي 100%</span>
                </div>
                <div className="bg-[#f8faf8] border border-[#e6e8e4] p-2 rounded-xl flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-[#1e4c42]" />
                  <span>شحن سريع</span>
                </div>
                <div className="bg-[#f8faf8] border border-[#e6e8e4] p-2 rounded-xl flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-[#1e4c42]" />
                  <span>معاينة الطلب</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instagram / Video Link if available */}
          {(product.instagramUrl || product.videoUrl) && (
            <a
              href={product.instagramUrl || product.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 border border-pink-200/80 hover:border-pink-300 shadow-2xs group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#12302a] flex items-center gap-1">
                    <span>شاهد فيديو / ريلز استعراض الأداة</span>
                    <Play className="w-3 h-3 fill-pink-600 text-pink-600 inline" />
                  </div>
                  <div className="text-[10px] text-pink-700 font-medium">
                    مقطع توضيحي مباشر لطريقة الاستخدام
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-pink-600" />
            </a>
          )}

          {/* Tabs for specs / features / brew */}
          {(specsList.length > 0 || featuresList.length > 0 || brewTips.length > 0) && (
            <div className="border border-[#e6e8e4] rounded-2xl overflow-hidden mt-4">
              <div className="flex border-b border-[#e6e8e4] bg-[#f8faf8]">
                {specsList.length > 0 && (
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`flex-1 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'specs'
                        ? 'bg-white text-[#12302a] border-b-2 border-[#12302a]'
                        : 'text-[#6b7680] hover:text-[#12302a]'
                    }`}
                  >
                    المواصفات
                  </button>
                )}
                {featuresList.length > 0 && (
                  <button
                    onClick={() => setActiveTab('features')}
                    className={`flex-1 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'features'
                        ? 'bg-white text-[#12302a] border-b-2 border-[#12302a]'
                        : 'text-[#6b7680] hover:text-[#12302a]'
                    }`}
                  >
                    المميزات
                  </button>
                )}
                {brewTips.length > 0 && (
                  <button
                    onClick={() => setActiveTab('brew')}
                    className={`flex-1 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'brew'
                        ? 'bg-white text-[#12302a] border-b-2 border-[#12302a]'
                        : 'text-[#6b7680] hover:text-[#12302a]'
                    }`}
                  >
                    نصائح الاستخلاص
                  </button>
                )}
              </div>

              <div className="p-4 text-xs text-[#17191c] bg-white">
                {activeTab === 'specs' && specsList.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {specsList.map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center p-2 rounded-xl bg-[#f8faf8] border border-[#e6e8e4]/60">
                        <span className="text-[#6b7680]">{key}:</span>
                        <span className="font-bold text-[#12302a]">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'features' && featuresList.length > 0 && (
                  <ul className="space-y-2">
                    {featuresList.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#12302a] mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'brew' && brewTips.length > 0 && (
                  <ul className="space-y-2">
                    {brewTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#eef5f1] p-2.5 rounded-xl">
                        <span className="text-[#12302a] font-bold">☕</span>
                        <span className="leading-relaxed font-medium">{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-[#12302a] mb-2.5 font-['Cairo']">
                أدوات مقترحة تناسب طلبك:
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectProduct(rel);
                      setQuantity(1);
                    }}
                    className="shrink-0 w-32 bg-[#f8faf8] border border-[#e6e8e4] rounded-2xl p-2 text-center cursor-pointer hover:border-[#12302a] transition-colors"
                  >
                    <div className="bg-white rounded-xl aspect-square flex items-center justify-center p-2 mb-1.5 overflow-hidden">
                      {rel.imageUrl ? (
                        <img
                          src={rel.imageUrl}
                          alt={rel.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <CoffeeProductIcon type={rel.iconType} className="w-8 h-8 text-[#12302a]" />
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-[#12302a] line-clamp-1">{rel.name}</div>
                    <div className="text-[11px] font-bold text-[#1e4c42] mt-0.5 font-mono">{formatPrice(rel.price)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sticky Bottom Actions Bar: Quantity + Add to Cart / Buy Now */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 border-t border-[#e6e8e4] shadow-lg flex items-center gap-3">
          
          {/* Quantity Stepper */}
          <div className="flex items-center border border-[#e6e8e4] bg-[#f8faf8] rounded-full p-1 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={!isAvailable}
              className="w-8 h-8 rounded-full bg-white text-[#12302a] flex items-center justify-center font-bold hover:bg-[#eef5f1] transition-colors cursor-pointer disabled:opacity-50"
              aria-label="تقليل الكمية"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-bold text-xs sm:text-sm text-[#12302a] font-mono">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
              disabled={!isAvailable || quantity >= maxStock}
              className="w-8 h-8 rounded-full bg-white text-[#12302a] flex items-center justify-center font-bold hover:bg-[#eef5f1] transition-colors cursor-pointer disabled:opacity-50"
              aria-label="زيادة الكمية"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`flex-1 py-3 px-4 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              addedAnimation
                ? 'bg-[#1e4c42] text-[#e4e8bf]'
                : 'bg-[#12302a] hover:bg-[#173d35] text-white'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4" />
                <span>أُضيفت بنجاح!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-[#e4e8bf]" />
                <span>إضافة للسلة ({formatPrice(product.price * quantity)})</span>
              </>
            )}
          </button>

          {/* Quick Buy Now on tablet/desktop or secondary */}
          <button
            onClick={handleBuyNow}
            disabled={!isAvailable}
            className="hidden sm:inline-flex py-3 px-4 rounded-full text-xs sm:text-sm font-bold bg-[#e4e8bf] hover:bg-[#d8dea6] text-[#12302a] border border-[#d8dea6] transition-all items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 text-[#1e4c42]" />
            <span>شراء مباشر</span>
          </button>

        </div>

      </div>
    </div>
  );
};
