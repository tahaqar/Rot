import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Clock,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Product, Category, OrderDetails, WebsiteSettings } from '../../types';
import { AdminTab } from './AdminLayout';
import { DEFAULT_SETTINGS } from '../../services/dbService';

interface AdminOverviewProps {
  products?: Product[];
  categories?: Category[];
  orders?: OrderDetails[];
  settings?: WebsiteSettings;
  onNavigate: (tab: AdminTab) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  products = [],
  categories = [],
  orders = [],
  settings = DEFAULT_SETTINGS,
  onNavigate,
  onRefresh,
  isLoading,
}) => {
  const currentSettings = settings || DEFAULT_SETTINGS;
  const storeName = currentSettings?.websiteName || 'نغمة فنجان';

  // Compute real metrics from the database
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.inStock && (p.stockCount === undefined || p.stockCount > 0)).length;
  const outOfStockProducts = products.filter((p) => !p.inStock || p.stockCount === 0).length;
  const publishedProducts = products.filter((p) => p.isPublished !== false).length;
  const totalCategories = categories.length;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending' || !o.orderStatus).length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered').length;
  
  // Total Revenue calculation from delivered/confirmed orders
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-IQ').format(price) + ' ' + (currentSettings?.currency || 'د.ع');
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#12302a] to-[#1c483f] p-6 rounded-3xl text-white shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-['Cairo'] text-[#e4e8bf]">
            لوحة قيادة وإحصائيات {storeName}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            متابعة حية وشاملة للمبيعات، المخزون، والطلبات الواردة المتصلة بـ Cloud Firestore
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#e4e8bf] hover:bg-[#d8dea6] text-[#12302a] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'جاري التحديث...' : 'تحديث البيانات'}</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e8e4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7680]">إجمالي المبيعات</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#12302a] font-mono">
              {formatPrice(totalRevenue)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <span>من كافة الطلبات غير الملغية</span>
          </div>
        </div>

        {/* Stat 2: Orders Count & Pending */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e8e4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7680]">إجمالي الطلبات</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#12302a] font-mono">{totalOrders}</span>
            <span className="text-xs text-[#6b7680]">طلب</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
              {pendingOrders} قيد الانتظار
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              {deliveredOrders} تم التسليم
            </span>
          </div>
        </div>

        {/* Stat 3: Products & Stock */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e8e4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7680]">المنتجات والأدوات</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#12302a] font-mono">{totalProducts}</span>
            <span className="text-xs text-[#6b7680]">أداة وجهاز</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold">
              {inStockProducts} متوفر
            </span>
            {outOfStockProducts > 0 && (
              <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md">
                {outOfStockProducts} نفد من المخزون
              </span>
            )}
          </div>
        </div>

        {/* Stat 4: Categories */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e8e4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7680]">الأقسام والتصنيفات</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#12302a] font-mono">{totalCategories}</span>
            <span className="text-xs text-[#6b7680]">أقسام نشطة</span>
          </div>
          <div className="mt-2 text-[11px] text-[#6b7680] flex items-center justify-between">
            <span>{publishedProducts} منتج معروض بالمتجر</span>
          </div>
        </div>
      </div>

      {/* Fast Action Shortcuts */}
      <div className="bg-white p-5 rounded-2xl border border-[#e6e8e4] shadow-xs">
        <h3 className="text-xs font-black text-[#12302a] font-['Cairo'] mb-3">
          إجراءات وإدارة سريعة:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('products')}
            className="p-3 rounded-xl bg-[#fafaf8] hover:bg-[#eef5f1] border border-[#e6e8e4] flex items-center gap-2.5 text-right transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-[#12302a] text-[#e4e8bf] group-hover:scale-105 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#12302a] font-['Cairo']">إضافة منتج جديد</div>
              <div className="text-[10px] text-[#6b7680]">رفع الصور والمواصفات</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('orders')}
            className="p-3 rounded-xl bg-[#fafaf8] hover:bg-[#eef5f1] border border-[#e6e8e4] flex items-center gap-2.5 text-right transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-[#12302a] text-[#e4e8bf] group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#12302a] font-['Cairo']">متابعة الطلبات</div>
              <div className="text-[10px] text-[#6b7680]">{pendingOrders} طلبات جديدة</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('payments')}
            className="p-3 rounded-xl bg-[#fafaf8] hover:bg-[#eef5f1] border border-[#e6e8e4] flex items-center gap-2.5 text-right transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-[#12302a] text-[#e4e8bf] group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#12302a] font-['Cairo']">بوابات الدفع</div>
              <div className="text-[10px] text-[#6b7680]">زين كاش والدفع عند الاستلام</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="p-3 rounded-xl bg-[#fafaf8] hover:bg-[#eef5f1] border border-[#e6e8e4] flex items-center gap-2.5 text-right transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-[#12302a] text-[#e4e8bf] group-hover:scale-105 transition-transform">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#12302a] font-['Cairo']">إعدادات المتجر</div>
              <div className="text-[10px] text-[#6b7680]">أجور الشحن وبيانات التواصل</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-[#e6e8e4] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#e6e8e4] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#12302a] font-['Cairo']">
              أحدث الطلبات الواردة
            </h3>
            <p className="text-xs text-[#6b7680] mt-0.5">
              آخر 5 طلبات تم تسجيلها عبر متجر نغمة فنجان
            </p>
          </div>

          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold text-[#1e4c42] hover:text-[#12302a] flex items-center gap-1 cursor-pointer"
          >
            <span>عرض كافة الطلبات</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6b7680]">
            <ShoppingBag className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            لا توجد أي طلبات مسجلة حالياً
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#fafaf8] border-b border-[#e6e8e4] text-[#6b7680] font-bold">
                <tr>
                  <th className="py-3 px-4 font-['Cairo']">رقم الطلب</th>
                  <th className="py-3 px-4 font-['Cairo']">العميل</th>
                  <th className="py-3 px-4 font-['Cairo']">المدينة / العنوان</th>
                  <th className="py-3 px-4 font-['Cairo']">طريقة الدفع</th>
                  <th className="py-3 px-4 font-['Cairo']">الإجمالي</th>
                  <th className="py-3 px-4 font-['Cairo']">الحالة</th>
                  <th className="py-3 px-4 font-['Cairo']">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e8e4]">
                {recentOrders.map((order) => {
                  const statusLabel =
                    order.orderStatus === 'delivered'
                      ? 'تم التسليم'
                      : order.orderStatus === 'shipped'
                      ? 'تم الشحن'
                      : order.orderStatus === 'preparing'
                      ? 'جاري التجهيز'
                      : order.orderStatus === 'confirmed'
                      ? 'مؤكد'
                      : order.orderStatus === 'cancelled'
                      ? 'ملغي'
                      : 'قيد الانتظار';

                  const statusColor =
                    order.orderStatus === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : order.orderStatus === 'shipped'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : order.orderStatus === 'confirmed'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : order.orderStatus === 'cancelled'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200';

                  return (
                    <tr key={order.orderId} className="hover:bg-[#fafaf8]/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#12302a]">
                        {order.orderId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#17191c]">
                        {order.customerName}
                        <span className="block text-[11px] text-[#6b7680] font-mono">{order.phone}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#3d453f]">
                        <span className="font-bold">{order.city}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6b7680]">
                        {order.paymentMethod === 'cod'
                          ? 'الدفع عند الاستلام'
                          : order.paymentMethod === 'zaincash'
                          ? 'زين كاش'
                          : 'بطاقة مصرفية'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-[#12302a]">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#6b7680]">
                        {order.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
