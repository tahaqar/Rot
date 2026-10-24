import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  CreditCard,
  Settings,
  UserCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Store,
} from 'lucide-react';
import { WebsiteSettings } from '../../types';
import { DEFAULT_SETTINGS } from '../../services/dbService';

export type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'payments'
  | 'settings'
  | 'account';

interface AdminLayoutProps {
  currentTab?: AdminTab;
  activeTab?: AdminTab;
  onSelectTab?: (tab: AdminTab) => void;
  onTabChange?: (tab: AdminTab) => void;
  onLogout: () => void;
  onExitToStore?: () => void;
  onBackToStore?: () => void;
  adminEmail: string;
  settings?: WebsiteSettings;
  pendingOrdersCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  onTabChange,
  onLogout,
  onExitToStore,
  onBackToStore,
  adminEmail,
  settings = DEFAULT_SETTINGS,
  pendingOrdersCount = 0,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const effectiveTab: AdminTab = activeTab || currentTab || 'overview';
  const handleTabSelect = onTabChange || onSelectTab || (() => {});
  const handleExit = onBackToStore || onExitToStore || (() => {});

  const currentSettings = settings || DEFAULT_SETTINGS;
  const storeName = currentSettings?.websiteName || 'نغمة فنجان';
  const storeSlogan = currentSettings?.slogan || 'نكهات تترك أثراً';

  const menuItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'لوحة التحكم والإحصائيات', icon: LayoutDashboard },
    { id: 'products', label: 'إدارة المنتجات والمخزون', icon: Package },
    { id: 'categories', label: 'التصنيفات والأقسام', icon: FolderTree },
    { id: 'orders', label: 'الطلبات والمبيعات', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'payments', label: 'بوابات وطرق الدفع', icon: CreditCard },
    { id: 'settings', label: 'إعدادات وهوية المتجر', icon: Settings },
    { id: 'account', label: 'حساب المشرف والأمان', icon: UserCheck },
  ];

  const handleNavClick = (tab: AdminTab) => {
    handleTabSelect(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#17191c] flex flex-col md:flex-row font-['Tajawal',sans-serif] dir-rtl text-right">
      
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden bg-[#12302a] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-[#173d35] text-[#e4e8bf] hover:bg-[#1e4c42] transition-colors"
            aria-label="القائمة"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="w-9 h-9 rounded-full border border-[#e4e8bf]/30 bg-white overflow-hidden shrink-0">
            <img
              src={currentSettings?.logoUrl || '/assets/aistudio/cropped_circle_image_9af6fab3.png'}
              alt={storeName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = '/assets/aistudio/cropped_circle_image_9af6fab3.png';
              }}
            />
          </div>

          <div>
            <span className="font-extrabold text-sm font-['Cairo'] text-[#e4e8bf] block leading-tight">
              {storeName}
            </span>
            <span className="block text-[10px] text-white/70">لوحة الإدارة السحابية</span>
          </div>
        </div>

        <button
          onClick={handleExit}
          className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-[#e4e8bf] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
        >
          <Store className="w-3.5 h-3.5" />
          <span>المتجر</span>
        </button>
      </header>

      {/* Sidebar Navigation for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-72 bg-[#12302a] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-[#173d35] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#e4e8bf]/50 bg-white overflow-hidden shrink-0 shadow-xs">
                <img
                  src={currentSettings?.logoUrl || '/assets/aistudio/cropped_circle_image_9af6fab3.png'}
                  alt={storeName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = '/assets/aistudio/cropped_circle_image_9af6fab3.png';
                  }}
                />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#e4e8bf] font-['Cairo'] tracking-tight leading-tight">
                  {storeName}
                </h2>
                <p className="text-[11px] text-[#d8dea6]/80 font-bold mt-0.5">
                  {storeSlogan}
                </p>
                <div className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#1e4c42] text-[9px] text-[#e4e8bf] font-mono">
                  سحابة Firebase المباشرة
                </div>
              </div>
            </div>
            {/* Close button on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items list */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = effectiveTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-right cursor-pointer ${
                    isActive
                      ? 'bg-[#e4e8bf] text-[#12302a] shadow-sm font-extrabold'
                      : 'text-white/80 hover:bg-[#173d35] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#12302a]' : 'text-[#d8dea6]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-[#12302a] text-[#e4e8bf]'
                          : 'bg-[#e74c3c] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Actions */}
        <div className="p-4 border-t border-[#173d35] space-y-2 bg-[#0d2420]">
          {/* Active Admin Profile */}
          <div className="px-2 py-1 flex items-center justify-between text-xs">
            <div className="truncate max-w-[170px]">
              <span className="text-[11px] text-white/50 block">المشرف المسجل:</span>
              <span className="text-white font-mono font-bold text-[11px] truncate block" title={adminEmail}>
                {adminEmail}
              </span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ecc71] animate-pulse" title="متصل"></span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleExit}
              className="py-2 px-2 rounded-xl bg-[#173d35] hover:bg-[#1e4c42] text-[#e4e8bf] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="عرض المتجر"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>المتجر</span>
            </button>

            <button
              onClick={onLogout}
              className="py-2 px-2 rounded-xl bg-[#e74c3c]/20 hover:bg-[#e74c3c] text-[#ffb8b8] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar on Desktop */}
        <div className="hidden md:flex bg-white border-b border-[#e6e8e4] px-8 py-4 items-center justify-between shadow-2xs sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-black text-[#12302a] font-['Cairo']">
              {menuItems.find((i) => i.id === effectiveTab)?.label}
            </h1>
            <p className="text-xs text-[#6b7680]">
              إدارة متجر {storeName} | قاعدة البيانات السحابية المركزية
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExit}
              className="flex items-center gap-2 bg-[#eef5f1] hover:bg-[#d8dea6] text-[#12302a] px-4 py-2 rounded-xl text-xs font-bold transition-all border border-[#d8dea6]/60 cursor-pointer"
            >
              <Store className="w-4 h-4 text-[#1e4c42]" />
              <span>معاينة المتجر المباشر</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};
