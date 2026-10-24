import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Truck,
  CreditCard,
  Wallet,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  Building,
} from 'lucide-react';
import { CartItem, OrderDetails, WebsiteSettings, PaymentMethodsConfig } from '../types';
import { formatPrice } from '../utils/formatters';
import { saveOrderToDb } from '../services/dbService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discountAmount: number;
  settings?: WebsiteSettings;
  paymentConfig?: PaymentMethodsConfig;
  onOrderPlaced: (order: OrderDetails) => void;
}

const IRAQI_PROVINCES = [
  'بغداد - الكرخ',
  'بغداد - الرصافة',
  'أربيل',
  'البصرة',
  'السليمانية',
  'النجف الأشرف',
  'كربلاء المقدسة',
  'نينوى (الموصل)',
  'بابل (الحلة)',
  'كركوك',
  'دهوك',
  'ديالى (بعقوبة)',
  'الأنبار (الرمادي/الفلوجة)',
  'واسط (الكوت)',
  'ذي قار (الناصرية)',
  'ميسان (العمارة)',
  'الديوانية (القادسية)',
  'المثنى (السماوة)',
  'صلاح الدين (تكريت/سامراء)',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discountAmount,
  settings,
  paymentConfig,
  onOrderPlaced,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(IRAQI_PROVINCES[0]);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Default payment method from config
  const isCodEnabled = paymentConfig?.cod?.enabled ?? true;
  const isZainCashEnabled = paymentConfig?.zaincash?.enabled ?? true;
  const isCardEnabled = paymentConfig?.card?.enabled ?? true;

  const defaultMethod = isCodEnabled
    ? 'cod'
    : isZainCashEnabled
    ? 'zaincash'
    : isCardEnabled
    ? 'card'
    : 'cod';

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'zaincash' | 'card' | 'asiapay'>(
    defaultMethod
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const isBaghdad = city.includes('بغداد');
  const baghdadFee = settings?.deliveryFeeBaghdad !== undefined ? settings.deliveryFeeBaghdad : 5000;
  const provincesFee = settings?.deliveryFeeProvinces !== undefined ? settings.deliveryFeeProvinces : 5000;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal >= 75000 ? 0 : isBaghdad ? baghdadFee : provincesFee;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!customerName.trim()) {
      errs.name = 'يرجى إدخال الاسم الكامل';
    }
    if (!phone.trim() || phone.trim().length < 10) {
      errs.phone = 'يرجى إدخال رقم هاتف عراقي صالح (مثال: 07702631412)';
    }
    if (!address.trim()) {
      errs.address = 'يرجى إدخال تفاصيل العنوان والمنطقة بدقة';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const orderId = 'NF-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder: OrderDetails = {
        orderId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        city,
        address: address.trim(),
        notes: notes.trim(),
        paymentMethod,
        items,
        subtotal,
        discount: discountAmount,
        shippingFee,
        total,
        orderStatus: 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        date: new Date().toLocaleDateString('ar-IQ', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      // Real Cloud Database Persistence via Firestore
      await saveOrderToDb(newOrder);

      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    } catch (err: any) {
      console.error('Order placement error:', err);
      setSubmitError('حدث خطأ أثناء حفظ الطلب في الخادم: ' + (err.message || 'يرجى المحاولة مجدداً'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a1411]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#e6e8e4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#12302a] text-[#e4e8bf] flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-base font-black text-[#12302a]">إتمام الطلب والتوصيل</h2>
              <p className="text-[11px] text-[#6b7680]">تسوق آمن ومضمون من متجر {settings?.websiteName || 'نغمة فنجان'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#eef5f1] text-[#12302a] hover:bg-[#e4e8bf] transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {submitError && (
            <div className="p-3.5 rounded-xl bg-[#ffebee] border border-[#ffcdd2] text-[#c62828] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Section: Customer info */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-black text-[#12302a] flex items-center gap-2 font-['Cairo']">
              <span className="w-5 h-5 rounded-full bg-[#eef5f1] text-[#12302a] flex items-center justify-center text-xs">1</span>
              بيانات المستلم وعنوان التوصيل
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17191c] mb-1">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: علي محمد"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full p-3 text-xs sm:text-sm border rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden ${
                    errors.name ? 'border-[#c0392b]' : 'border-[#e6e8e4] focus:border-[#12302a]'
                  }`}
                />
                {errors.name && <span className="text-[11px] text-[#c0392b] mt-0.5 block">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17191c] mb-1">
                  رقم الهاتف (واتساب) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="07702631412"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full p-3 text-xs sm:text-sm border rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden dir-ltr text-right font-mono ${
                    errors.phone ? 'border-[#c0392b]' : 'border-[#e6e8e4] focus:border-[#12302a]'
                  }`}
                />
                {errors.phone && <span className="text-[11px] text-[#c0392b] mt-0.5 block">{errors.phone}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17191c] mb-1">
                  المحافظة / المدينة *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:border-[#12302a] focus:outline-hidden font-bold"
                >
                  {IRAQI_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17191c] mb-1">
                  تفاصيل الحي / الشارع / أقرب نقطة دالة *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الكرادة، شارع العرصات، قرب تقاطع..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full p-3 text-xs sm:text-sm border rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden ${
                    errors.address ? 'border-[#c0392b]' : 'border-[#e6e8e4] focus:border-[#12302a]'
                  }`}
                />
                {errors.address && <span className="text-[11px] text-[#c0392b] mt-0.5 block">{errors.address}</span>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17191c] mb-1">
                ملاحظات خاصة بالتوصيل (اختياري)
              </label>
              <input
                type="text"
                placeholder="توقيت مناسب للتسليم أو تعليمات للمندوب"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 text-xs sm:text-sm border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:border-[#12302a] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section: Payment Method */}
          <div className="space-y-3 pt-4 border-t border-[#e6e8e4]">
            <h3 className="text-xs sm:text-sm font-black text-[#12302a] flex items-center gap-2 font-['Cairo']">
              <span className="w-5 h-5 rounded-full bg-[#eef5f1] text-[#12302a] flex items-center justify-center text-xs">2</span>
              طريقة الدفع المفضلة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Cash on delivery */}
              {isCodEnabled && (
                <label
                  className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between gap-2 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#12302a] bg-[#eef5f1]/80 shadow-xs'
                      : 'border-[#e6e8e4] bg-[#fafaf8] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#12302a] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#1e4c42]" />
                      <span>{paymentConfig?.cod?.label || 'الدفع عند الاستلام'}</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-[#12302a] accent-[#12302a]"
                    />
                  </div>
                  <div className="text-[10px] text-[#6b7680]">
                    {paymentConfig?.cod?.description || 'ادفع كاش للمندوب بعد استلام الطلب'}
                  </div>
                </label>
              )}

              {/* ZainCash */}
              {isZainCashEnabled && (
                <label
                  className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between gap-2 transition-all ${
                    paymentMethod === 'zaincash'
                      ? 'border-[#12302a] bg-[#eef5f1]/80 shadow-xs'
                      : 'border-[#e6e8e4] bg-[#fafaf8] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#12302a] flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-[#1e4c42]" />
                      <span>زين كاش (Zain Cash)</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="zaincash"
                      checked={paymentMethod === 'zaincash'}
                      onChange={() => setPaymentMethod('zaincash')}
                      className="w-4 h-4 text-[#12302a] accent-[#12302a]"
                    />
                  </div>
                  <div className="text-[10px] text-[#6b7680]">تحويل إلكتروني فوري ومباشر</div>
                </label>
              )}

              {/* Cards */}
              {isCardEnabled && (
                <label
                  className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#12302a] bg-[#eef5f1]/80 shadow-xs'
                      : 'border-[#e6e8e4] bg-[#fafaf8] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#12302a] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#1e4c42]" />
                      <span>ماستركارد / فيزا</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-4 h-4 text-[#12302a] accent-[#12302a]"
                    />
                  </div>
                  <div className="text-[10px] text-[#6b7680]">Qi Card / Master / Visa</div>
                </label>
              )}

            </div>
          </div>

          {/* Section: Order Summary review */}
          <div className="p-4 rounded-2xl bg-[#fafaf8] border border-[#e6e8e4] space-y-2 text-xs">
            <div className="font-bold text-[#12302a] mb-2 text-xs sm:text-sm">ملخص المنتجات المحجوزة:</div>
            {items.map((i) => (
              <div key={i.product.id} className="flex justify-between text-[#17191c]">
                <span>{i.product.name} × {i.quantity}</span>
                <span className="font-bold font-mono">{formatPrice(i.product.price * i.quantity)}</span>
              </div>
            ))}

            <div className="pt-2 border-t border-[#e6e8e4] space-y-1.5">
              <div className="flex justify-between text-[#6b7680]">
                <span>المجموع الفرعي:</span>
                <span className="font-bold font-mono">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#27ae60]">
                  <span>الخصم المطبق:</span>
                  <span className="font-bold font-mono">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6b7680]">
                <span>أجور التوصيل ({city}):</span>
                <span className="font-bold font-mono">
                  {shippingFee === 0 ? 'مجاناً' : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#e6e8e4] flex justify-between text-sm sm:text-base font-black text-[#12302a]">
                <span>المبلغ النهائي للدفع:</span>
                <span className="font-mono">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-[#12302a] hover:bg-[#173d35] text-white text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>جاري تسجيل الطلب في السحابة...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#e4e8bf]" />
                <span>تأكيد الطلب وإرساله الآن</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
