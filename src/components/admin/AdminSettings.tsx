import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Video,
  Truck,
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Coins,
} from 'lucide-react';
import { WebsiteSettings } from '../../types';
import { saveSettings, DEFAULT_SETTINGS } from '../../services/dbService';

interface AdminSettingsProps {
  settings?: WebsiteSettings;
  onRefresh: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings = DEFAULT_SETTINGS,
  onRefresh,
}) => {
  const [form, setForm] = useState<WebsiteSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...(settings || {}),
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setForm((prev) => ({
        ...DEFAULT_SETTINGS,
        ...prev,
        ...settings,
      }));
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await saveSettings(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      setSaveError('فشل حفظ الإعدادات في السحابة: ' + (err.message || 'حاول مجدداً'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#12302a] font-['Cairo']">
            إعدادات وهوية المتجر
          </h2>
          <p className="text-xs text-[#6b7680]">
            تخصيص معلومات الاتصال، وسائل التواصل، أجور التوصيل، وشريط الإعلانات
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#12302a] hover:bg-[#1e4c42] text-[#e4e8bf] px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-[#e8f5e9] border border-[#a5d6a7] text-[#2e7d32] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>تم حفظ الإعدادات وتحديث المتجر بالكامل لجميع الزوار فوراً!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-[#ffebee] border border-[#ffcdd2] text-[#c62828] text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* 1. General Brand Info */}
      <div className="bg-white rounded-2xl border border-[#e6e8e4] p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#e6e8e4]">
          <Store className="w-5 h-5 text-[#1e4c42]" />
          <h3 className="text-sm font-black text-[#12302a]">الهوية والاسم التجاري</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">اسم المتجر</label>
            <input
              type="text"
              required
              value={form.websiteName || ''}
              onChange={(e) => setForm({ ...form, websiteName: e.target.value })}
              className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">الشعار اللفظي (Slogan)</label>
            <input
              type="text"
              value={form.slogan || ''}
              onChange={(e) => setForm({ ...form, slogan: e.target.value })}
              className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-[#12302a]">العنوان والموقع الجغرافي</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute right-3 top-3 text-[#6b7680]" />
              <input
                type="text"
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full pl-3 pr-9 py-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Direct Contact Info */}
      <div className="bg-white rounded-2xl border border-[#e6e8e4] p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#e6e8e4]">
          <Phone className="w-5 h-5 text-[#1e4c42]" />
          <h3 className="text-sm font-black text-[#12302a]">بيانات التواصل وخدمة العملاء</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">رقم هاتف الاتصال الرئيسي</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute right-3 top-3 text-[#6b7680]" />
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="07702631412"
                className="w-full pl-3 pr-9 py-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">رقم الواتساب للطلبات</label>
            <div className="relative">
              <MessageCircle className="w-4 h-4 absolute right-3 top-3 text-[#2ecc71]" />
              <input
                type="text"
                value={form.whatsapp || ''}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="07702631412"
                className="w-full pl-3 pr-9 py-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Social Channels */}
      <div className="bg-white rounded-2xl border border-[#e6e8e4] p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#e6e8e4]">
          <Instagram className="w-5 h-5 text-[#1e4c42]" />
          <h3 className="text-sm font-black text-[#12302a]">روابط منصات التواصل الاجتماعي</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">يوزر إنستغرام (Instagram)</label>
            <div className="relative">
              <Instagram className="w-4 h-4 absolute right-3 top-3 text-pink-600" />
              <input
                type="text"
                value={form.instagram || ''}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="nag.fng"
                className="w-full pl-3 pr-9 py-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">رابط الفيسبوك (Facebook)</label>
            <div className="relative">
              <Facebook className="w-4 h-4 absolute right-3 top-3 text-blue-600" />
              <input
                type="text"
                value={form.facebook || ''}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full pl-3 pr-9 py-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">يوزر تيك توك (TikTok)</label>
            <div className="relative">
              <Video className="w-4 h-4 absolute right-3 top-3 text-gray-800" />
              <input
                type="text"
                value={form.tiktok || ''}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                placeholder="@nag_fng"
                className="w-full pl-3 pr-9 py-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Delivery & Currency */}
      <div className="bg-white rounded-2xl border border-[#e6e8e4] p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#e6e8e4]">
          <Truck className="w-5 h-5 text-[#1e4c42]" />
          <h3 className="text-sm font-black text-[#12302a]">أجور التوصيل والعملة</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">أجور التوصيل داخل بغداد (د.ع)</label>
            <input
              type="number"
              value={form.deliveryFeeBaghdad ?? 5000}
              onChange={(e) => setForm({ ...form, deliveryFeeBaghdad: Number(e.target.value) })}
              className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">أجور التوصيل للمحافظات (د.ع)</label>
            <input
              type="number"
              value={form.deliveryFeeProvinces ?? 5000}
              onChange={(e) => setForm({ ...form, deliveryFeeProvinces: Number(e.target.value) })}
              className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#12302a]">رمز العملة</label>
            <input
              type="text"
              value={form.currency || 'د.ع'}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden font-bold"
            />
          </div>
        </div>
      </div>

      {/* 5. Announcement Bar */}
      <div className="bg-white rounded-2xl border border-[#e6e8e4] p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e6e8e4]">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#1e4c42]" />
            <h3 className="text-sm font-black text-[#12302a]">شريط الإعلانات والعروض العلوي</h3>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAnnouncementActive || false}
              onChange={(e) => setForm({ ...form, isAnnouncementActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#12302a]"></div>
            <span className="mr-3 text-xs font-bold text-[#12302a]">تفعيل الشريط</span>
          </label>
        </div>

        <div className="text-xs space-y-1.5">
          <label className="font-bold text-[#12302a]">نص الإعلان أو العرض الترويجي</label>
          <input
            type="text"
            value={form.announcementText || ''}
            onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
            placeholder="مثال: خصم خاص 10% بمناسبة الافتتاح | كود: NAGHMA10"
            className="w-full p-2.5 border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>
    </form>
  );
};
