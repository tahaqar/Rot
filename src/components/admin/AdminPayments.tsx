import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Lock,
} from 'lucide-react';
import { PaymentMethodsConfig } from '../../types';
import { savePaymentConfig } from '../../services/dbService';

interface AdminPaymentsProps {
  paymentConfig: PaymentMethodsConfig;
  onRefresh: () => void;
}

export const AdminPayments: React.FC<AdminPaymentsProps> = ({
  paymentConfig,
  onRefresh,
}) => {
  const [config, setConfig] = useState<PaymentMethodsConfig>(paymentConfig);
  const [showZainSecret, setShowZainSecret] = useState(false);
  const [showCardSecret, setShowCardSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await savePaymentConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      setSaveError('فشل حفظ إعدادات بوابات الدفع: ' + (err.message || 'حاول مجدداً'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#12302a] font-['Cairo']">
            بوابات وطرق الدفع
          </h2>
          <p className="text-xs text-[#6b7680]">
            تفعيل وتعطيل وسائل الدفع وضبط مفاتيح الربط الإلكتروني الرسمية
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#12302a] hover:bg-[#1e4c42] text-[#e4e8bf] px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ تغييرات الدفع'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-[#e8f5e9] border border-[#a5d6a7] text-[#2e7d32] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>تم حفظ وتحديث إعدادات طرق الدفع في قاعدة البيانات بنجاح!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-[#ffebee] border border-[#ffcdd2] text-[#c62828] text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* 1. Cash on Delivery (COD) */}
      <div className="bg-white rounded-2xl border border-[#e6e8e4] p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e6e8e4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eef5f1] text-[#12302a] flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#12302a]">الدفع نقداً عند الاستلام (COD)</h3>
              <p className="text-xs text-[#6b7680]">خيار الدفع المباشر لمندوب التوصيل في بغداد والمحافظات</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.cod.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  cod: { ...config.cod, enabled: e.target.checked },
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#e6e8e4] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#12302a]"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">اسم الطريقة في صفحة إتمام الطلب</label>
            <input
              type="text"
              value={config.cod.label}
              onChange={(e) =>
                setConfig({
                  ...config,
                  cod: { ...config.cod, label: e.target.value },
                })
              }
              className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">الوصف المعروض للزبون</label>
            <input
              type="text"
              value={config.cod.description}
              onChange={(e) =>
                setConfig({
                  ...config,
                  cod: { ...config.cod, description: e.target.value },
                })
              }
              className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 2. Zain Cash Iraq */}
      <div className="bg-white rounded-2xl border border-[#e6e8e4] p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e6e8e4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff8e1] text-[#b78103] flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#12302a]">محفظة زين كاش العراق (Zain Cash)</h3>
                <span className="text-[10px] bg-[#eef5f1] text-[#12302a] px-2 py-0.5 rounded-full font-bold">
                  {config.zaincash.isTestEnv ? 'بيئة تجريبية Sandbox' : 'بيئة الإنتاج Live'}
                </span>
              </div>
              <p className="text-xs text-[#6b7680]">بوابة الدفع الإلكتروني الرسمي عبر تطبيق زين كاش</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.zaincash.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  zaincash: { ...config.zaincash, enabled: e.target.checked },
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#e6e8e4] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#12302a]"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">رقم محفظة التاجر (MSISDN / Phone)</label>
            <input
              type="text"
              placeholder="07702631412"
              value={config.zaincash.msisdn}
              onChange={(e) =>
                setConfig({
                  ...config,
                  zaincash: { ...config.zaincash, msisdn: e.target.value },
                })
              }
              className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">معرف التاجر (Merchant ID)</label>
            <input
              type="text"
              placeholder="5ff64f1..."
              value={config.zaincash.merchantId}
              onChange={(e) =>
                setConfig({
                  ...config,
                  zaincash: { ...config.zaincash, merchantId: e.target.value },
                })
              }
              className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">مفتاح التشفير السري (Secret Key)</label>
            <div className="relative">
              <input
                type={showZainSecret ? 'text' : 'password'}
                placeholder="$2y$10$..."
                value={config.zaincash.secret}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    zaincash: { ...config.zaincash, secret: e.target.value },
                  })
                }
                className="w-full pl-9 pr-3 py-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowZainSecret(!showZainSecret)}
                className="absolute left-2.5 top-3 text-[#6b7680] hover:text-[#12302a]"
              >
                {showZainSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12302a]">
            <input
              type="checkbox"
              checked={config.zaincash.isTestEnv}
              onChange={(e) =>
                setConfig({
                  ...config,
                  zaincash: { ...config.zaincash, isTestEnv: e.target.checked },
                })
              }
              className="w-4 h-4 accent-[#12302a] rounded"
            />
            <span>وضع الاختبار التجريبي (Sandbox Test Mode)</span>
          </label>
        </div>
      </div>

      {/* 3. MasterCard / Online Card Payment */}
      <div className="bg-white rounded-2xl border border-[#e6e8e4] p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e6e8e4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e3f2fd] text-[#1565c0] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#12302a]">بوابة بطاقات ماستركارد / فيزا / كي كارد</h3>
                <span className="text-[10px] bg-[#e8f5e9] text-[#2e7d32] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>آمن ومشفر PCI-DSS</span>
                </span>
              </div>
              <p className="text-xs text-[#6b7680]">ربط بوابات الدفع المصرفية المعتمدة في العراق</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.card.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  card: { ...config.card, enabled: e.target.checked },
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#e6e8e4] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#12302a]"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">مزود خدمة بوابة الدفع</label>
            <select
              value={config.card.provider}
              onChange={(e) =>
                setConfig({
                  ...config,
                  card: { ...config.card, provider: e.target.value as any },
                })
              }
              className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-bold"
            >
              <option value="qi">بوابة كي كارد الوطنية (Qi Card Payment Gateway)</option>
              <option value="areeba">أريبا العراق (Areeba Iraq)</option>
              <option value="paymob">باي موب (Paymob)</option>
              <option value="stripe">سترايب (Stripe Gateway)</option>
              <option value="custom">بوابة مصرفية مخصصة (Custom Bank Gateway)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">المفتاح العام (Public Key / Merchant ID)</label>
            <input
              type="text"
              placeholder="pk_live_..."
              value={config.card.publicKey}
              onChange={(e) =>
                setConfig({
                  ...config,
                  card: { ...config.card, publicKey: e.target.value },
                })
              }
              className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">المفتاح السري (Secret Key)</label>
            <div className="relative">
              <input
                type={showCardSecret ? 'text' : 'password'}
                placeholder="sk_live_..."
                value={config.card.secretKey || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    card: { ...config.card, secretKey: e.target.value },
                  })
                }
                className="w-full pl-9 pr-3 py-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowCardSecret(!showCardSecret)}
                className="absolute left-2.5 top-3 text-[#6b7680] hover:text-[#12302a]"
              >
                {showCardSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12302a]">
            <input
              type="checkbox"
              checked={config.card.isLive}
              onChange={(e) =>
                setConfig({
                  ...config,
                  card: { ...config.card, isLive: e.target.checked },
                })
              }
              className="w-4 h-4 accent-[#12302a] rounded"
            />
            <span>تفعيل البيئة الحية المباشرة (Live Production Mode)</span>
          </label>
        </div>
      </div>
    </form>
  );
};
