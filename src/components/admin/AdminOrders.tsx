import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  CreditCard,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import { OrderDetails, OrderStatus, PaymentStatus, WebsiteSettings } from '../../types';
import { updateOrderStatusInDb, deleteOrderFromDb } from '../../services/dbService';

interface AdminOrdersProps {
  orders: OrderDetails[];
  settings?: WebsiteSettings;
  onRefresh: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  settings,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Status mappings
  const orderStatuses: { id: OrderStatus; label: string; bg: string; text: string; icon: any }[] = [
    { id: 'pending', label: 'قيد الانتظار', bg: 'bg-[#fff8e1]', text: 'text-[#b78103]', icon: Clock },
    { id: 'confirmed', label: 'مؤكد', bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]', icon: CheckCircle2 },
    { id: 'preparing', label: 'جاري التجهيز', bg: 'bg-[#e3f2fd]', text: 'text-[#1565c0]', icon: PackageCheck },
    { id: 'shipped', label: 'تم الشحن', bg: 'bg-[#f3e5f5]', text: 'text-[#7b1fa2]', icon: Truck },
    { id: 'delivered', label: 'تم التسليم', bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]', icon: CheckCircle2 },
    { id: 'cancelled', label: 'ملغي', bg: 'bg-[#ffebee]', text: 'text-[#c62828]', icon: XCircle },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      searchQuery === '' ||
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery) ||
      o.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || (o.orderStatus || 'pending') === statusFilter;

    const matchesPayment =
      paymentFilter === 'all' || o.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleUpdateStatus = async (orderDocId: string, newStatus: OrderStatus, newPaymentStatus?: PaymentStatus) => {
    setIsUpdating(true);
    try {
      await updateOrderStatusInDb(orderDocId, newStatus, newPaymentStatus);
      if (selectedOrder && (selectedOrder.id === orderDocId || selectedOrder.orderId === orderDocId)) {
        setSelectedOrder({
          ...selectedOrder,
          orderStatus: newStatus,
          paymentStatus: newPaymentStatus || selectedOrder.paymentStatus,
        });
      }
      onRefresh();
    } catch (err: any) {
      alert('فشل تحديث حالة الطلب: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderDocId: string) => {
    try {
      await deleteOrderFromDb(orderDocId);
      setIsDeleting(null);
      setSelectedOrder(null);
      onRefresh();
    } catch (err: any) {
      alert('فشل حذف الطلب: ' + err.message);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-IQ').format(price) + ' ' + (settings?.currency || 'د.ع');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#12302a] font-['Cairo']">
            الطلبات والمبيعات
          </h2>
          <p className="text-xs text-[#6b7680]">
            متابعة وإدارة طلبات الزبائن وتحديث حالات الشحن والدفع
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e6e8e4] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-[#6b7680]" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الهاتف، أو رقم الطلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] font-bold"
            >
              <option value="all">جميع حالات الطلب ({orders.length})</option>
              {orderStatuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full p-2 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] font-bold"
            >
              <option value="all">كل طرق الدفع</option>
              <option value="cod">الدفع عند الاستلام</option>
              <option value="zaincash">زين كاش</option>
              <option value="card">البطاقات المصرفية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#e6e8e4] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#fafaf8] border-b border-[#e6e8e4] text-[#6b7680]">
              <tr>
                <th className="py-3.5 px-4 font-bold">رقم الطلب</th>
                <th className="py-3.5 px-4 font-bold">العميل والموقع</th>
                <th className="py-3.5 px-4 font-bold">المنتجات</th>
                <th className="py-3.5 px-4 font-bold">الإجمالي</th>
                <th className="py-3.5 px-4 font-bold">طريقة الدفع</th>
                <th className="py-3.5 px-4 font-bold">الحالة</th>
                <th className="py-3.5 px-4 font-bold text-center">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2ef]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#6b7680]">
                    <ShoppingBag className="w-10 h-10 mx-auto text-[#d8dea6] mb-2" />
                    <p className="font-bold">لم يتم العثور على أي طلبات مطابقة.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = orderStatuses.find(
                    (s) => s.id === (order.orderStatus || 'pending')
                  ) || orderStatuses[0];

                  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

                  return (
                    <tr key={order.id || order.orderId} className="hover:bg-[#fafaf8]/80 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-[#12302a] block">
                          {order.orderId}
                        </span>
                        <span className="text-[10px] text-[#6b7680] block mt-0.5">
                          {order.date || 'اليوم'}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#17191c]">{order.customerName}</div>
                        <div className="text-[11px] text-[#6b7680] font-mono dir-ltr text-right">
                          {order.phone}
                        </div>
                        <div className="text-[10px] text-[#6b7680] truncate max-w-xs">
                          {order.city} - {order.address}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-[#eef5f1] text-[#12302a] font-bold px-2 py-0.5 rounded-md text-[11px]">
                          {totalItems} قطع ({order.items.length} منتج)
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-mono font-black text-[#12302a]">
                        {formatPrice(order.total)}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="text-[11px] font-bold text-[#12302a] block">
                            {order.paymentMethod === 'cod'
                              ? 'عند الاستلام'
                              : order.paymentMethod === 'zaincash'
                              ? 'زين كاش'
                              : 'بطاقة مصرفية'}
                          </span>
                          <span
                            className={`inline-block text-[10px] font-bold mt-0.5 px-1.5 py-0.2 rounded-sm ${
                              order.paymentStatus === 'paid'
                                ? 'bg-[#e8f5e9] text-[#2e7d32]'
                                : 'bg-[#fff8e1] text-[#b78103]'
                            }`}
                          >
                            {order.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}
                        >
                          <statusInfo.icon className="w-3 h-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="py-1.5 px-3 rounded-xl bg-[#12302a] hover:bg-[#1e4c42] text-[#e4e8bf] text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp">
            
            {/* Header */}
            <div className="p-5 border-b border-[#e6e8e4] flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg text-[#12302a]">
                    طلب #{selectedOrder.orderId}
                  </span>
                  <span className="text-xs text-[#6b7680]">({selectedOrder.date})</span>
                </div>
                <p className="text-xs text-[#6b7680]">تفاصيل الطلب ومعلومات الزبون</p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-[#fafaf8] text-[#6b7680] hover:text-[#12302a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Customer Contact & WhatsApp Action */}
              <div className="bg-[#fafaf8] p-4 rounded-2xl border border-[#e6e8e4] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-[#12302a]">{selectedOrder.customerName}</h4>
                    <div className="flex items-center gap-2 text-xs text-[#6b7680] mt-1">
                      <Phone className="w-3.5 h-3.5 text-[#1e4c42]" />
                      <span className="font-mono font-bold text-[#12302a] dir-ltr text-right">{selectedOrder.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6b7680] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1e4c42]" />
                      <span>{selectedOrder.city} - {selectedOrder.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${selectedOrder.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `مرحباً ${selectedOrder.customerName}، بخصوص طلبك رقم ${selectedOrder.orderId} من متجر نغمة فنجان...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>مراسلة واتساب</span>
                    </a>

                    <a
                      href={`tel:${selectedOrder.phone}`}
                      className="px-3.5 py-2 rounded-xl bg-[#12302a] hover:bg-[#1e4c42] text-[#e4e8bf] text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>اتصال</span>
                    </a>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="pt-2 border-t border-[#e6e8e4] text-xs">
                    <span className="font-bold text-[#12302a]">ملاحظات الزبون: </span>
                    <span className="text-[#6b7680]">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>

              {/* Status Updater Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#eef5f1] border border-[#d8dea6]/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12302a] block">حالة مسار الطلب</label>
                  <select
                    disabled={isUpdating}
                    value={selectedOrder.orderStatus || 'pending'}
                    onChange={(e) =>
                      handleUpdateStatus(
                        selectedOrder.id || selectedOrder.orderId,
                        e.target.value as OrderStatus,
                        selectedOrder.paymentStatus
                      )
                    }
                    className="w-full p-2 text-xs border border-[#d8dea6] rounded-xl bg-white focus:outline-hidden font-bold"
                  >
                    {orderStatuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12302a] block">حالة الدفع</label>
                  <select
                    disabled={isUpdating}
                    value={selectedOrder.paymentStatus || 'pending'}
                    onChange={(e) =>
                      handleUpdateStatus(
                        selectedOrder.id || selectedOrder.orderId,
                        selectedOrder.orderStatus || 'pending',
                        e.target.value as PaymentStatus
                      )
                    }
                    className="w-full p-2 text-xs border border-[#d8dea6] rounded-xl bg-white focus:outline-hidden font-bold"
                  >
                    <option value="pending">قيد الدفع (Pending)</option>
                    <option value="paid">تم استلام المبلغ (Paid)</option>
                    <option value="failed">فشلت العملية (Failed)</option>
                    <option value="refunded">مسترجع (Refunded)</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#12302a]">المنتجات المطلوبة</h4>
                <div className="border border-[#e6e8e4] rounded-2xl overflow-hidden divide-y divide-[#f0f2ef]">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#fafaf8] border border-[#e6e8e4] flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4 text-[#12302a]" />
                        </div>
                        <div>
                          <div className="font-bold text-[#12302a]">{item.product.name}</div>
                          <div className="text-[10px] text-[#6b7680]">
                            الكمية: {item.quantity} × {formatPrice(item.product.price)}
                          </div>
                        </div>
                      </div>

                      <div className="font-mono font-black text-[#12302a]">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Totals */}
              <div className="p-4 rounded-2xl bg-[#fafaf8] border border-[#e6e8e4] space-y-2 text-xs">
                <div className="flex justify-between text-[#6b7680]">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono font-bold">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-[#27ae60]">
                    <span>الخصم المطبق:</span>
                    <span className="font-mono font-bold">-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6b7680]">
                  <span>أجور التوصيل:</span>
                  <span className="font-mono font-bold">
                    {selectedOrder.shippingFee === 0 ? 'مجاناً' : formatPrice(selectedOrder.shippingFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#e6e8e4] flex justify-between text-sm font-black text-[#12302a]">
                  <span>المبلغ الإجمالي النهائي:</span>
                  <span className="font-mono text-base">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Bottom Delete Order */}
              <div className="flex items-center justify-between pt-2 border-t border-[#e6e8e4]">
                <button
                  type="button"
                  onClick={() => setIsDeleting(selectedOrder.id || selectedOrder.orderId)}
                  className="text-xs text-[#c62828] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف هذا الطلب نهائياً</span>
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="py-2 px-5 rounded-xl bg-[#12302a] text-white text-xs font-bold cursor-pointer"
                >
                  إغلاق
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-center shadow-xl animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-[#ffebee] text-[#c62828] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#12302a]">تأكيد حذف الطلب</h3>
            <p className="text-xs text-[#6b7680] leading-relaxed">
              هل أنت متأكد من حذف هذا الطلب من سجلات المتجر السحابية نهائياً؟
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsDeleting(null)}
                className="py-2.5 px-4 rounded-xl border border-[#e6e8e4] text-xs font-bold text-[#6b7680] hover:bg-[#fafaf8]"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDeleteOrder(isDeleting)}
                className="py-2.5 px-4 rounded-xl bg-[#c62828] hover:bg-[#b71c1c] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
