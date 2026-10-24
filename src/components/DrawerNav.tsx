import React, { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronLeft,
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Sparkles,
  Package,
  Compass,
  Lock,
} from 'lucide-react';
import { Category, WebsiteSettings } from '../types';
import { BRANDS } from '../data/brands';

interface DrawerNavProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  brands?: { id: string; name: string; origin?: string; itemCount?: number }[];
  settings?: WebsiteSettings;
  selectedCategory: string;
  selectedSubcategory?: string;
  onSelectCategory: (catId: string) => void;
  onSelectSubcategory?: (subId: string) => void;
  onSelectBrand: (brandName: string) => void;
  onOpenBrewGuide: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin?: () => void;
}

export const DrawerNav: React.FC<DrawerNavProps> = ({
  isOpen,
  onClose,
  categories,
  brands = BRANDS,
  settings,
  selectedCategory,
  selectedSubcategory = 'all',
  onSelectCategory,
  onSelectSubcategory,
  onSelectBrand,
  onOpenBrewGuide,
  onOpenWishlist,
  onOpenAdmin,
}) => {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);

  if (!isOpen) return null;

  const phone = settings?.phone || '07702631412';
  const whatsapp = settings?.whatsapp || '07702631412';
  const facebookUrl = settings?.facebook || 'https://www.facebook.com/share/1EgrT8MYdD/';
  const instagramAccount = settings?.instagram || 'nag.fng';
  const websiteName = settings?.websiteName || 'نغمة فنجان';
  const slogan = settings?.slogan || 'نكهات تترك أثراً';
  const address = settings?.address || 'العراق - بغداد | توصيل لكافة المحافظات';

  const cleanWaNumber = whatsapp.replace(/[^0-9]/g, '');
  const formattedWa = cleanWaNumber.startsWith('964')
    ? cleanWaNumber
    : '964' + (cleanWaNumber.startsWith('0') ? cleanWaNumber.slice(1) : cleanWaNumber);

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-[#0a1411]/50 backdrop-blur-xs z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 bottom-0 right-0 w-[85%] max-w-[380px] bg-white z-50 shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="relative p-6 text-center border-b border-[#e6e8e4] bg-[#eef5f1]/50">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-[#e4e8bf] text-[#12302a] flex items-center justify-center font-bold hover:bg-[#d8dea6] transition-colors cursor-pointer"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Circular Store Logo */}
          <div className="w-16 h-16 mx-auto mb-2.5 rounded-full border-2 border-[#12302a] shadow-xs bg-white overflow-hidden flex items-center justify-center">
            <img
              src={settings?.logoUrl || '/assets/aistudio/cropped_circle_image_9af6fab3.png'}
              alt={websiteName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = '/assets/aistudio/cropped_circle_image_9af6fab3.png';
              }}
            />
          </div>

          <div className="brand-logo text-2xl font-extrabold text-[#12302a] font-['Cairo']">
            {websiteName}
          </div>
          <p className="text-xs text-[#1e4c42] mt-1 font-bold">{slogan}</p>
          <p className="text-[11px] text-[#6b7680] mt-0.5">أدوات ومعدات القهوة المختصة | بغداد</p>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-2 space-y-1">
          {/* Categories Accordion */}
          <div className="border border-[#e6e8e4] rounded-xl overflow-hidden mb-2">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="w-full flex items-center justify-between p-3.5 bg-[#fafaf8] text-sm font-bold text-[#12302a] hover:bg-[#eef5f1] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#1e4c42]" />
                أقسام وتصنيفات المتجر
              </span>
              <ChevronDown className={`w-4 h-4 text-[#1e4c42] transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            {categoriesOpen && (
              <div className="p-2 space-y-1 bg-white border-t border-[#e6e8e4]">
                {categories.map((cat) => {
                  const isCatSelected = selectedCategory === cat.id;
                  const hasBranches = cat.subcategories && cat.subcategories.length > 0;
                  const isExpanded = expandedCatId === cat.id;

                  return (
                    <div key={cat.id} className="rounded-lg overflow-hidden">
                      <div
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isCatSelected
                            ? 'bg-[#12302a] text-white'
                            : 'text-[#17191c] hover:bg-[#eef5f1]'
                        }`}
                      >
                        <div
                          className="flex-1 flex items-center justify-between"
                          onClick={() => {
                            onSelectCategory(cat.id);
                            if (onSelectSubcategory) onSelectSubcategory('all');
                            onClose();
                          }}
                        >
                          <span>{cat.name}</span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full mr-2 ${
                              isCatSelected
                                ? 'bg-[#1e4c42] text-[#e4e8bf]'
                                : 'bg-[#eef5f1] text-[#6b7680]'
                            }`}
                          >
                            {cat.itemCount ?? 0} منتج
                          </span>
                        </div>

                        {hasBranches && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedCatId(isExpanded ? null : cat.id);
                            }}
                            className={`p-1 rounded-md transition-colors cursor-pointer mr-1 ${
                              isCatSelected
                                ? 'hover:bg-white/20 text-[#e4e8bf]'
                                : 'hover:bg-gray-200 text-[#6b7680]'
                            }`}
                            title="عرض فروع القسم"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Expandable subcategory branches */}
                      {hasBranches && isExpanded && (
                        <div className="bg-[#f8faf8] mr-3 my-1 pl-2 pr-3 py-1.5 border-r-2 border-[#12302a] rounded-l-lg space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCategory(cat.id);
                              if (onSelectSubcategory) onSelectSubcategory('all');
                              onClose();
                            }}
                            className={`w-full text-right text-[11px] font-bold py-1 px-2 rounded-md transition-colors ${
                              isCatSelected && selectedSubcategory === 'all'
                                ? 'text-[#12302a] bg-[#eef5f1]'
                                : 'text-[#6b7680] hover:text-[#12302a]'
                            }`}
                          >
                            • كل فروع {cat.name}
                          </button>
                          {cat.subcategories!.map((sub) => {
                            const isSubSelected =
                              isCatSelected &&
                              (selectedSubcategory === sub.id || selectedSubcategory === sub.name);
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => {
                                  onSelectCategory(cat.id);
                                  if (onSelectSubcategory) onSelectSubcategory(sub.id);
                                  onClose();
                                }}
                                className={`w-full text-right text-[11px] font-bold py-1 px-2 rounded-md transition-colors flex items-center justify-between ${
                                  isSubSelected
                                    ? 'text-[#12302a] bg-[#eef5f1]'
                                    : 'text-[#6b7680] hover:text-[#12302a]'
                                }`}
                              >
                                <span>- {sub.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Brands Accordion */}
          <div className="border border-[#e6e8e4] rounded-xl overflow-hidden mb-2">
            <button
              onClick={() => setBrandsOpen(!brandsOpen)}
              className="w-full flex items-center justify-between p-3.5 bg-[#fafaf8] text-sm font-bold text-[#12302a] hover:bg-[#eef5f1] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#1e4c42]" />
                الماركات العالمية المتوفرة
              </span>
              <ChevronDown className={`w-4 h-4 text-[#1e4c42] transition-transform duration-200 ${brandsOpen ? 'rotate-180' : ''}`} />
            </button>

            {brandsOpen && (
              <div className="p-2 grid grid-cols-2 gap-1.5 bg-white border-t border-[#e6e8e4]">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => {
                      onSelectBrand(brand.name);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-[#fafaf8] hover:bg-[#eef5f1] text-right border border-[#e6e8e4]/60 transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-xs text-[#12302a]">{brand.name}</div>
                    <div className="text-[10px] text-[#6b7680]">{brand.origin}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Link */}
          <button
            onClick={() => {
              onClose();
              onOpenWishlist();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#e6e8e4] text-sm font-bold text-[#12302a] hover:bg-[#eef5f1] transition-colors cursor-pointer"
          >
            <span>قائمة المنتجات المفضلة</span>
            <ChevronLeft className="w-4 h-4 text-[#1e4c42]" />
          </button>

          {/* Admin Dashboard link */}
          {onOpenAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#12302a]/20 bg-[#eef5f1] text-sm font-bold text-[#12302a] hover:bg-[#e4e8bf] transition-colors cursor-pointer mt-2"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#1e4c42]" />
                <span>لوحة تحكم المدير</span>
              </span>
              <ChevronLeft className="w-4 h-4 text-[#1e4c42]" />
            </button>
          )}
        </div>

        {/* Drawer Contact & Location Footer */}
        <div className="p-5 border-t border-[#e6e8e4] bg-[#fafaf8] text-center space-y-4 mt-auto">
          <div>
            <h4 className="text-xs font-bold text-[#12302a] mb-1">خدمة العملاء والطلبات المباشرة</h4>
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 text-sm font-extrabold text-[#12302a] hover:text-[#173d35] transition-colors dir-ltr font-mono"
            >
              <Phone className="w-4 h-4 text-[#1e4c42]" />
              {phone}
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#6b7680]">
            <MapPin className="w-3.5 h-3.5 text-[#1e4c42]" />
            <span>{address}</span>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-3 pt-1">
            <a
              href={`https://wa.me/${formattedWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-[#12302a] text-[#e4e8bf] flex items-center justify-center hover:bg-[#1e4c42] transition-colors"
              aria-label="واتساب"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href={`https://instagram.com/${instagramAccount}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-[#12302a] text-[#e4e8bf] flex items-center justify-center hover:bg-[#1e4c42] transition-colors"
              aria-label="انستغرام"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-[#12302a] text-[#e4e8bf] flex items-center justify-center hover:bg-[#1e4c42] transition-colors"
              aria-label="فيسبوك نغمة فنجان"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>

          <p className="text-[10px] text-[#8a9188] font-bold">{websiteName} — {slogan} © 2026</p>
        </div>
      </div>
    </>
  );
};
