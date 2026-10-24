import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Tag, Sparkles } from 'lucide-react';
import { CartItem } from '../types';
import { CoffeeProductIcon } from './CoffeeIcons';
import { formatPrice } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
  appliedCoupon: string | null;
  discountAmount: number;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onContinueShopping,
  appliedCoupon,
  discountAmount,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = onApplyCoupon(couponCode.trim());
    setCouponMessage({
      text: res.message,
      isError: !res.success,
    });
    if (res.success) {
      setCouponCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0a1411]/50 backdrop-blur-sm flex items-end sm:items-stretch sm:justify-start transition-opacity">
      
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Panel: Slide-in Bottom Sheet on Mobile (rounded-t-[20px]), Slide-drawer on Desktop */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:w-[420px] bg-white rounded-t-[20px] sm:rounded-none sm:rounded-l-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-full z-10 animate-in slide-in-from-bottom sm:slide-in-from-left duration-300"
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-white">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Fixed Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#e6e8e4] bg-[#f8faf8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#eef5f1] text-[#12302a] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Cairo'] text-[#12302a]">
                سلة المشتريات
              </h2>
              <span className="text-xs text-[#6b7680] font-mono">
                {items.reduce((s, i) => s + i.quantity, 0)} قطع
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-[#c0392b] hover:underline px-2 py-1 cursor-pointer"
                title="إفراغ السلة"
              >
                إفراغ
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-[#e6e8e4] text-[#12302a] flex items-center justify-center hover:bg-[#eef5f1] transition-colors cursor-pointer"
              aria-label="إغلاق السلة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6b7680] space-y-4 my-8">
              <div className="w-20 h-20 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#12302a]">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold font-['Cairo'] text-[#12302a]">سلتك فارغة حالياً</h3>
                <p className="text-xs text-[#6b7680] mt-1 max-w-[240px] mx-auto">
                  استكشف أدوات القهوة المختصة، الطواحين، والموازين الذكية وابدأ بطلبك الآن.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onContinueShopping();
                }}
                className="py-2.5 px-6 rounded-full bg-[#12302a] text-[#e4e8bf] text-xs font-bold hover:bg-[#173d35] transition-all cursor-pointer"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-[#e6e8e4] bg-[#f8faf8] hover:border-[#12302a]/30 transition-colors"
              >
                {/* Product Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-white border border-[#e6e8e4] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <CoffeeProductIcon type={item.product.iconType} className="w-8 h-8 text-[#12302a]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#12302a] truncate font-['Cairo']">
                    {item.product.name}
                  </h4>
                  <div className="text-xs font-bold text-[#1e4c42] mt-0.5 font-mono">
                    {formatPrice(item.product.price)}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-[#e6e8e4] rounded-full bg-white p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#12302a] hover:bg-[#eef5f1] transition-colors cursor-pointer"
                        aria-label="إنقاص الكمية"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs font-mono text-[#12302a]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#12302a] hover:bg-[#eef5f1] transition-colors cursor-pointer"
                        aria-label="زيادة الكمية"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-[#c0392b] hover:text-red-700 p-1 cursor-pointer mr-auto"
                      aria-label="حذف المنتج"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Coupon Code Section */}
          {items.length > 0 && (
            <div className="pt-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-[#6b7680] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="كود الخصم (مثل: COFFEE10)"
                    className="w-full pr-9 pl-3 py-2 text-xs rounded-full border border-[#e6e8e4] bg-[#f8faf8] focus:outline-hidden focus:border-[#12302a] font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#12302a] text-[#e4e8bf] text-xs font-bold hover:bg-[#173d35] transition-all cursor-pointer"
                >
                  تطبيق
                </button>
              </form>

              {couponMessage && (
                <div className={`text-xs mt-1.5 px-3 py-1 rounded-full ${couponMessage.isError ? 'text-red-600 bg-red-50' : 'text-emerald-700 bg-emerald-50'}`}>
                  {couponMessage.text}
                </div>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2 rounded-xl mt-2 border border-emerald-200">
                  <span className="flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    كوبون مفعل: {appliedCoupon}
                  </span>
                  <button
                    onClick={onRemoveCoupon}
                    className="text-red-600 hover:underline text-[11px] cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Bottom Actions Bar */}
        {items.length > 0 && (
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md p-4 border-t border-[#e6e8e4] space-y-3 shadow-lg">
            
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6b7680]">
                <span>المجموع الفرعي:</span>
                <span className="font-mono text-[#12302a] font-bold">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>قيمة الخصم:</span>
                  <span className="font-mono">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6b7680]">
                <span>أجور التوصيل:</span>
                <span className="text-[#12302a] font-medium">تُحسب في خطوة الشحن</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-[#12302a] pt-2 border-t border-[#e6e8e4]">
                <span>المجموع الإجمالي:</span>
                <span className="font-mono font-bold">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={onProceedToCheckout}
              className="w-full py-3.5 rounded-full bg-[#12302a] hover:bg-[#173d35] text-[#e4e8bf] text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>متابعة إتمام الطلب</span>
              <ArrowLeft className="w-4 h-4 text-[#e4e8bf]" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
