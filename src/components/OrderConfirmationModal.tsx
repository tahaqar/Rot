import React from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, ShoppingBag, MapPin, Phone, Calendar } from 'lucide-react';
import { OrderDetails } from '../types';
import { formatPrice } from '../utils/formatters';

interface OrderConfirmationModalProps {
  order: OrderDetails | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const paymentName = {
    cod: 'الدفع نقداً عند الاستلام (كاش)',
    zaincash: 'محفظة زين كاش العراق',
    card: 'بطاقة مصرفية / ماستر كارد',
    asiapay: 'آسيا حوالة / سوبر كاش'
  }[order.paymentMethod];

  // Construct WhatsApp Order Message
  const waText = encodeURIComponent(
    `مرحباً متجر نغمة فنجان، قمت بتأكيد طلب جديد بنجاح عبر المتجر:\n` +
    `🔢 رقم الطلب: ${order.orderId}\n` +
    `👤 الاسم: ${order.customerName}\n` +
    `📱 الهاتف: ${order.phone}\n` +
    `📍 العنوان: ${order.city} - ${order.address}\n` +
    `💳 طريقة الدفع: ${paymentName}\n` +
    `💰 الإجمالي: ${formatPrice(order.total)}\n` +
    `📦 المنتجات:\n` +
    order.items.map((i) => ` • ${i.product.name} (عدد: ${i.quantity})`).join('\n')
  );

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a1411]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Top celebratory header */}
        <div className="bg-[#12302a] text-[#eef5f1] p-6 text-center space-y-2 relative">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#e4e8bf] text-[#12302a] flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-[#12302a]" />
          </div>
          <h2 className="text-xl font-black text-white font-['Cairo']">تم استلام طلبك بنجاح!</h2>
          <p className="text-xs text-[#e4e8bf] max-w-sm mx-auto">
            شكراً لثقتك بمتجر نغمة فنجان - نكهات تترك أثراً. سيقوم فريقنا بتجهيز طلبك وتوصيله بأسرع وقت.
          </p>

          <div className="pt-2 inline-flex items-center gap-2 bg-[#173d35] px-3.5 py-1.5 rounded-full text-xs font-mono">
            <span className="text-[#e4e8bf]">رقم الطلب:</span>
            <span className="font-bold text-white tracking-wider">{order.orderId}</span>
            <button
              onClick={handleCopyOrderId}
              className="text-[#e4e8bf] hover:text-white transition-colors"
              title="نسخ رقم الطلب"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Invoice details */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#fafaf8] border border-[#e6e8e4]">
            <div className="space-y-1">
              <span className="text-[11px] text-[#6b7680] block">المستلم</span>
              <strong className="text-[#12302a] block">{order.customerName}</strong>
              <span className="text-[11px] text-[#6b7680] dir-ltr block text-right">{order.phone}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-[#6b7680] block">مكان وتاريخ التوصيل</span>
              <strong className="text-[#12302a] block">{order.city}</strong>
              <span className="text-[11px] text-[#6b7680] block">{order.date}</span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="border border-[#e6e8e4] rounded-2xl overflow-hidden">
            <div className="bg-[#fafaf8] px-4 py-2 font-bold text-xs text-[#12302a] border-b border-[#e6e8e4]">
              المنتجات في الطلب:
            </div>
            <div className="p-4 space-y-2.5">
              {order.items.map((it) => (
                <div key={it.product.id} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#12302a]">{it.product.name}</span>
                    <span className="text-[#6b7680] mr-2">× {it.quantity}</span>
                  </div>
                  <span className="font-bold text-[#17191c]">{formatPrice(it.product.price * it.quantity)}</span>
                </div>
              ))}

              <div className="pt-3 border-t border-[#e6e8e4] space-y-1 text-xs">
                <div className="flex justify-between text-[#6b7680]">
                  <span>المجموع الفرعي:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>الخصم المطبق:</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6b7680]">
                  <span>أجور التوصيل:</span>
                  <span>{order.shippingFee === 0 ? 'مجاني' : formatPrice(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-[#12302a] pt-2 border-t border-[#e6e8e4]">
                  <span>الإجمالي:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Confirmation Button */}
          <div className="pt-2 space-y-2">
            <a
              href={`https://wa.me/9647702631412?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <MessageCircle className="w-5 h-5" />
              <span>متابعة وتأكيد الطلب مباشرة عبر واتساب</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-[#eef5f1] hover:bg-[#e4e8bf] text-[#12302a] font-bold text-xs transition-colors"
            >
              متابعة التسوق في المتجر
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
