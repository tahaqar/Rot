import React from 'react';
import { Phone, MapPin, MessageCircle, Instagram, Facebook, ShieldCheck, Heart, Lock } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface FooterProps {
  settings?: WebsiteSettings;
  onSelectCategory?: (catId: string) => void;
  onOpenBrewGuide?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onSelectCategory,
  onOpenBrewGuide,
  onOpenAdmin,
}) => {
  const phone = settings?.phone || '07702631412';
  const whatsapp = settings?.whatsapp || '07702631412';
  const facebookUrl = settings?.facebook || 'https://www.facebook.com/share/1EgrT8MYdD/';
  const instagramAccount = settings?.instagram || 'nag.fng';
  const slogan = settings?.slogan || 'نكهات تترك أثراً';
  const websiteName = settings?.websiteName || 'نغمة فنجان';
  const address = settings?.address || 'العراق - بغداد | التوصيل متاح لجميع المحافظات';

  const cleanWaNumber = whatsapp.replace(/[^0-9]/g, '');
  const formattedWa = cleanWaNumber.startsWith('964') ? cleanWaNumber : '964' + (cleanWaNumber.startsWith('0') ? cleanWaNumber.slice(1) : cleanWaNumber);

  return (
    <footer className="bg-[#eef5f1] border-t border-[#e6e8e4] text-[#17191c] pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Brand & Slogan Header in Footer */}
        <div className="text-center space-y-2 max-w-lg mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#12302a] shadow-xs bg-white overflow-hidden flex items-center justify-center mb-1">
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
          <span className="brand-logo text-3xl sm:text-4xl font-extrabold text-[#12302a] tracking-tight block font-['Cairo']">
            {websiteName}
          </span>
          <p className="text-sm font-bold text-[#1e4c42]">
            {slogan}
          </p>
          <p className="text-xs text-[#6b7680] leading-relaxed">
            قهوة مختصة || أجهزة وطواحين | بيع جملة ومفرد | شحن وتوصيل لكافة مناطق ومحافظات العراق.
          </p>
        </div>

        {/* 2 Balanced Columns: Customer Support & Location/Socials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-right border-y border-[#d8dea6]/60 py-8">
          
          {/* Customer Support & Orders */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#12302a] font-['Cairo']">
              خدمة العملاء والطلبات المباشرة
            </h4>
            <p className="text-xs text-[#6b7680] leading-relaxed">
              فريقنا متواجد يومياً لخدمتكم ومساعدتكم في اختيار أفضل المعدات والأجهزة.
            </p>
            <div className="pt-1 flex flex-col items-center md:items-start gap-1">
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 text-base font-black text-[#12302a] hover:text-[#173d35] dir-ltr font-mono"
              >
                <Phone className="w-4 h-4 text-[#1e4c42]" />
                {phone}
              </a>
              <span className="text-[11px] text-[#6b7680]">هاتف / واتساب للطلب والاستفسار: {phone}</span>
            </div>
          </div>

          {/* Location & Branches & Social Media */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#12302a] font-['Cairo']">
              الشحن والتواصل
            </h4>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-[#12302a]">
              <MapPin className="w-4 h-4 text-[#1e4c42]" />
              <span>{address}</span>
            </div>
            <p className="text-xs text-[#6b7680]">
              شحن سريع مع ضمان فحص ومعاينة المنتج قبل الاستلام.
            </p>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start gap-3 pt-2">
              <a
                href={`https://wa.me/${formattedWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#12302a] text-[#e4e8bf] flex items-center justify-center hover:bg-[#1e4c42] transition-all shadow-xs hover:scale-105"
                aria-label="واتساب"
                title="واتساب"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`https://instagram.com/${instagramAccount}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#12302a] text-[#e4e8bf] flex items-center justify-center hover:bg-[#1e4c42] transition-all shadow-xs hover:scale-105"
                aria-label={`انستغرام ${instagramAccount}`}
                title={`انستغرام: ${instagramAccount}`}
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#12302a] text-[#e4e8bf] flex items-center justify-center hover:bg-[#1e4c42] transition-all shadow-xs hover:scale-105"
                aria-label="فيسبوك نغمة فنجان"
                title="صفحة الفيسبوك"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright & Slogan + Admin link */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6b7680] font-bold">
          <p>{websiteName} — {slogan} © 2026 | جميع الحقوق محفوظة</p>
          
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-[11px] text-[#6b7680] hover:text-[#12302a] transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-white/60"
            >
              <Lock className="w-3 h-3" />
              <span>لوحة التحكم والإدارة</span>
            </button>
          )}
        </div>

      </div>
    </footer>
  );
};
