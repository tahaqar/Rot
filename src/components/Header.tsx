import React from 'react';
import { ShoppingBag, Menu, Heart, Sparkles, Coffee } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  settings?: WebsiteSettings;
  onOpenDrawer: () => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenBrewGuide: () => void;
  onLogoClick: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  settings,
  onOpenDrawer,
  onOpenCart,
  onOpenWishlist,
  onLogoClick,
}) => {
  const websiteName = settings?.websiteName || 'نغمة فنجان';
  const isAnnouncementActive = settings?.isAnnouncementActive;
  const announcementText = settings?.announcementText;
  const logoUrl = settings?.logoUrl || '/assets/aistudio/cropped_circle_image_9af6fab3.png';

  return (
    <>
      {/* Optional Top Announcement Bar */}
      {isAnnouncementActive && announcementText && (
        <div className="bg-[#12302B] text-[#e4e8bf] px-3 py-1.5 text-center text-xs font-bold font-['Tajawal',sans-serif] flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{announcementText}</span>
        </div>
      )}

      {/* Compact Mobile-First Sticky Header (Touch Targets >= 44px) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e6e8e4] px-3 sm:px-5 py-1.5 transition-shadow shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          
          {/* Right side in RTL: Circular Logo + Store Title (min-h-[44px] touch target) */}
          <div
            onClick={onLogoClick}
            className="flex items-center gap-2.5 cursor-pointer select-none group min-h-[44px] py-1"
            role="button"
            tabIndex={0}
            aria-label="الصفحة الرئيسية للمتجر"
          >
            {/* Compact Circular Logo Frame: 40x40px */}
            <div className="w-10 h-10 rounded-full border border-[#12302B]/20 shadow-2xs bg-[#f4f7f5] overflow-hidden flex items-center justify-center shrink-0 group-hover:border-[#12302B] group-hover:shadow-xs transition-all duration-200">
              <img
                src={logoUrl}
                alt={websiteName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback in case path fails
                  const target = e.currentTarget;
                  target.src = '/assets/aistudio/cropped_circle_image_9af6fab3.png';
                }}
              />
            </div>

            {/* Store Name (Compact, Bold) */}
            <div className="flex flex-col text-right">
              <span className="text-base sm:text-lg font-black font-['Tajawal',sans-serif] text-[#12302B] tracking-tight leading-none group-hover:text-[#173d35] transition-colors">
                {websiteName}
              </span>
              <span className="text-[10px] text-[#4b5563] font-medium mt-0.5 leading-none">
                قهوة مختصة
              </span>
            </div>
          </div>

          {/* Left side in RTL: Controls Group (Wishlist + Cart + Menu) with >=44px touch targets */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Wishlist Button: 44x44px touch target */}
            <button
              onClick={onOpenWishlist}
              className="w-11 h-11 rounded-full border border-[#e6e8e4] bg-white text-[#12302B] hover:bg-[#f4f7f5] transition-colors relative flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
              aria-label="المفضلة"
              title="المفضلة"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  wishlistCount > 0 ? 'fill-[#c0392b] text-[#c0392b]' : 'text-[#12302B]'
                }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute 1 top-0.5 -right-0.5 bg-[#c0392b] text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-xs font-mono">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button: 44x44px touch target with deep green background */}
            <button
              id="cartBtn"
              onClick={onOpenCart}
              className="w-11 h-11 rounded-full border border-[#12302B] bg-[#12302B] text-white hover:bg-[#1a403a] transition-all relative flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
              aria-label="سلة المشتريات"
              title="سلة المشتريات"
            >
              <ShoppingBag className="w-5 h-5 text-[#e4e8bf]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e74c3c] text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-xs animate-pulse font-mono">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu Button: 44x44px touch target */}
            <button
              id="menuBtn"
              onClick={onOpenDrawer}
              className="w-11 h-11 rounded-full border border-[#e6e8e4] bg-white text-[#12302B] hover:bg-[#f4f7f5] transition-colors flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
              aria-label="القائمة الجانبية"
              title="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>

        </div>
      </header>
    </>
  );
};
