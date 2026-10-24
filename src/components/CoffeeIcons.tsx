import React from 'react';

interface IconProps {
  name?: string;
  type?: string;
  className?: string;
}

export interface AvailableIconOption {
  id: string;
  name: string;
  category: 'pourover' | 'grinder' | 'espresso' | 'tools' | 'other';
}

export const AVAILABLE_COFFEE_ICONS: AvailableIconOption[] = [
  { id: 'dripperset', name: 'قمع تقطير V60', category: 'pourover' },
  { id: 'chemex', name: 'إبريق كيمكس Chemex', category: 'pourover' },
  { id: 'aeropress', name: 'أيروبريس Aeropress', category: 'pourover' },
  { id: 'frenchPress', name: 'فرنش بريس French Press', category: 'pourover' },
  { id: 'siphon', name: 'سايفون ياباني Siphon', category: 'pourover' },
  { id: 'coldbrew', name: 'كولد برو Cold Brew', category: 'pourover' },
  { id: 'kettle', name: 'إبريق ترشيح Kettle', category: 'pourover' },
  { id: 'server', name: 'سيرفر وأكواب زجاجية', category: 'pourover' },
  { id: 'filter', name: 'فلاتر ورقية Filters', category: 'pourover' },
  { id: 'grinderManual', name: 'طاحونة يدوية Grinder', category: 'grinder' },
  { id: 'grinderElectric', name: 'طاحونة كهربائية Pro', category: 'grinder' },
  { id: 'scale', name: 'ميزان ذكي Scale', category: 'tools' },
  { id: 'thermometer', name: 'مقياس حرارة', category: 'tools' },
  { id: 'cup', name: 'أكواب وسيراميك Cups', category: 'tools' },
  { id: 'pitcher', name: 'بيتشر تبخير الحليب', category: 'espresso' },
  { id: 'portafilter', name: 'بورتافلتر مكشوف', category: 'espresso' },
  { id: 'tamper', name: 'مكبس إسبريسو Tamper', category: 'espresso' },
  { id: 'distributor', name: 'موزع بن Leveler', category: 'espresso' },
  { id: 'wdt', name: 'إبرة تفكيك WDT Tool', category: 'espresso' },
  { id: 'mokaPot', name: 'موكا بوت Moka Pot', category: 'espresso' },
  { id: 'coffeeBeans', name: 'حبوب بن مختص', category: 'other' },
  { id: 'bundle', name: 'بكج وهدايا الباريستا', category: 'other' },
  { id: 'sparkles', name: 'أدوات مميزة وحصرية', category: 'other' },
  { id: 'roaster', name: 'محمصة قهوة منزلية', category: 'other' },
];

export const CoffeeIcon: React.FC<IconProps> = ({ name, type, className = "w-12 h-12" }) => {
  const iconKey = name || type || 'dripperset';

  // 1. If iconKey is an Image URL or Data URL
  if (typeof iconKey === 'string' && (iconKey.startsWith('http://') || iconKey.startsWith('https://') || iconKey.startsWith('data:image/') || iconKey.startsWith('/'))) {
    return (
      <img
        src={iconKey}
        alt="icon"
        className={`${className} object-contain`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // 2. If iconKey is an Emoji or short character (e.g. ☕, 🫖, ⚖️, etc.)
  if (typeof iconKey === 'string' && iconKey.length <= 4 && !AVAILABLE_COFFEE_ICONS.some((i) => i.id === iconKey)) {
    return (
      <span className={`${className} flex items-center justify-center text-2xl select-none leading-none`}>
        {iconKey}
      </span>
    );
  }

  switch (iconKey) {
    case 'dripperset':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 18h32l-10 16v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V34z" fill="currentColor" fillOpacity="0.08" />
          <path d="M12 18h40" />
          <path d="M18 18l10 18h8l10-18" />
          <path d="M24 36v12h16V36" />
          <rect x="20" y="48" width="24" height="6" rx="2" fill="currentColor" fillOpacity="0.15" />
          <circle cx="16" cy="12" r="2.5" />
          <circle cx="48" cy="12" r="2.5" />
          <line x1="32" y1="20" x2="32" y2="30" strokeDasharray="2 3" />
        </svg>
      );

    case 'chemex':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 14h28l-8 18 10 20a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2l10-20L18 14z" fill="currentColor" fillOpacity="0.08" />
          <path d="M16 14h32" />
          <rect x="25" y="30" width="14" height="6" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" />
          <line x1="28" y1="36" x2="26" y2="44" />
          <line x1="36" y1="36" x2="38" y2="44" />
        </svg>
      );

    case 'server':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 18h20l6 28a4 4 0 0 1-4 4.5H20a4 4 0 0 1-4-4.5L22 18z" fill="currentColor" fillOpacity="0.08" />
          <path d="M20 18h24" />
          <path d="M44 26h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-5" />
          <line x1="22" y1="30" x2="30" y2="30" />
          <line x1="22" y1="36" x2="33" y2="36" />
          <line x1="22" y1="42" x2="30" y2="42" />
          <path d="M20 18l-4 4" />
        </svg>
      );

    case 'grinderManual':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="22" y="22" width="20" height="32" rx="4" fill="currentColor" fillOpacity="0.08" />
          <line x1="22" y1="38" x2="42" y2="38" />
          <line x1="32" y1="14" x2="32" y2="22" />
          <circle cx="32" cy="14" r="3" fill="currentColor" />
          <path d="M32 14h18l2 6" />
          <circle cx="52" cy="20" r="3" fill="currentColor" fillOpacity="0.3" />
          <line x1="26" y1="28" x2="38" y2="28" strokeDasharray="1 3" />
          <line x1="26" y1="46" x2="38" y2="46" strokeDasharray="1 3" />
        </svg>
      );

    case 'grinderElectric':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14h24l-3 14H23L20 14z" fill="currentColor" fillOpacity="0.1" />
          <rect x="22" y="28" width="20" height="24" rx="3" />
          <rect x="26" y="52" width="12" height="4" rx="1" />
          <circle cx="32" cy="40" r="4" fill="currentColor" fillOpacity="0.2" />
          <path d="M42 36h6v12h-6" />
          <line x1="28" y1="10" x2="36" y2="10" />
        </svg>
      );

    case 'kettle':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 24h20l4 24H18L22 24z" fill="currentColor" fillOpacity="0.08" />
          <path d="M22 24c0-4 4-6 10-6s10 2 10 6" />
          <circle cx="32" cy="15" r="2.5" fill="currentColor" />
          <path d="M42 28h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-6" />
          <path d="M22 34c-6 0-14-6-14-16 0-2 4-2 6 2 2 4 4 10 8 10" />
          <rect x="14" y="48" width="36" height="5" rx="2" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );

    case 'scale':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="20" width="36" height="32" rx="6" fill="currentColor" fillOpacity="0.08" />
          <rect x="20" y="38" width="24" height="9" rx="2" fill="currentColor" fillOpacity="0.2" />
          <line x1="24" y1="42" x2="28" y2="42" />
          <line x1="36" y1="42" x2="40" y2="42" />
          <circle cx="20" cy="27" r="2.5" />
          <circle cx="44" cy="27" r="2.5" />
          <line x1="28" y1="27" x2="36" y2="27" strokeDasharray="2 2" />
        </svg>
      );

    case 'filter':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 18h36l-18 34L14 18z" fill="currentColor" fillOpacity="0.08" />
          <path d="M18 24h28l-14 24L18 24z" strokeDasharray="2 3" />
          <line x1="32" y1="18" x2="32" y2="48" strokeDasharray="3 3" />
        </svg>
      );

    case 'tamper':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M28 14h8a4 4 0 0 1 4 4v12l4 6v8H20v-8l4-6V18a4 4 0 0 1 4-4z" fill="currentColor" fillOpacity="0.08" />
          <rect x="16" y="44" width="32" height="8" rx="2" fill="currentColor" fillOpacity="0.2" />
          <line x1="24" y1="22" x2="40" y2="22" />
        </svg>
      );

    case 'distributor':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="26" r="16" fill="currentColor" fillOpacity="0.08" />
          <rect x="16" y="38" width="32" height="12" rx="3" fill="currentColor" fillOpacity="0.2" />
          <line x1="24" y1="26" x2="40" y2="26" strokeWidth="3" />
          <line x1="32" y1="18" x2="32" y2="34" strokeWidth="3" />
        </svg>
      );

    case 'cup':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 22h24v16a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8V22z" fill="currentColor" fillOpacity="0.08" />
          <path d="M42 26h6a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-6" />
          <path d="M14 50h32" />
          <path d="M24 16c0-3 2-4 2-6" strokeDasharray="1 2" />
          <path d="M30 16c0-3 2-4 2-6" strokeDasharray="1 2" />
          <path d="M36 16c0-3 2-4 2-6" strokeDasharray="1 2" />
        </svg>
      );

    case 'aeropress':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="22" y="14" width="20" height="8" rx="2" fill="currentColor" fillOpacity="0.2" />
          <rect x="24" y="22" width="16" height="24" />
          <path d="M18 46h28l-2 8H20l-2-8z" fill="currentColor" fillOpacity="0.1" />
          <line x1="28" y1="28" x2="36" y2="28" />
          <line x1="28" y1="34" x2="36" y2="34" />
          <line x1="28" y1="40" x2="36" y2="40" />
        </svg>
      );

    case 'frenchPress':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="20" y="20" width="24" height="34" rx="3" fill="currentColor" fillOpacity="0.08" />
          <line x1="32" y1="10" x2="32" y2="36" strokeWidth="2.5" />
          <circle cx="32" cy="10" r="3" fill="currentColor" />
          <line x1="22" y1="36" x2="42" y2="36" strokeWidth="3" />
          <path d="M44 26h8a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3h-8" />
        </svg>
      );

    case 'siphon':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="20" r="10" fill="currentColor" fillOpacity="0.08" />
          <line x1="32" y1="30" x2="32" y2="38" />
          <circle cx="32" cy="46" r="10" fill="currentColor" fillOpacity="0.1" />
          <path d="M22 56h20" strokeWidth="3" />
        </svg>
      );

    case 'coldbrew':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="20" y="16" width="24" height="38" rx="5" fill="currentColor" fillOpacity="0.08" />
          <rect x="24" y="24" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.25" />
          <rect x="32" y="34" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.25" />
          <line x1="20" y1="16" x2="44" y2="16" strokeWidth="3" />
        </svg>
      );

    case 'mokaPot':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 18l4 16h16l4-16z" fill="currentColor" fillOpacity="0.1" />
          <path d="M24 34l-3 18h22l-3-18z" fill="currentColor" fillOpacity="0.15" />
          <line x1="22" y1="34" x2="42" y2="34" strokeWidth="3" />
          <circle cx="32" cy="14" r="2.5" fill="currentColor" />
          <path d="M44 24h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
        </svg>
      );

    case 'pitcher':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 18l-3 32h26l-4-32H22z" fill="currentColor" fillOpacity="0.08" />
          <path d="M19 18l-6 6h6" />
          <path d="M41 24h8a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4h-6" />
        </svg>
      );

    case 'portafilter':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="26" cy="28" r="14" fill="currentColor" fillOpacity="0.08" />
          <circle cx="26" cy="28" r="9" />
          <path d="M36 38l16 16a3 3 0 0 0 4-4L40 34" strokeWidth="3" />
          <path d="M26 42v6" />
        </svg>
      );

    case 'coffeeBeans':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="26" cy="30" rx="12" ry="16" transform="rotate(-25 26 30)" fill="currentColor" fillOpacity="0.12" />
          <path d="M20 20c4 6 0 14 8 20" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="42" cy="36" rx="10" ry="14" transform="rotate(35 42 36)" fill="currentColor" fillOpacity="0.18" />
          <path d="M38 28c3 5 0 11 6 16" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'thermometer':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M30 14a4 4 0 0 1 8 0v24a8 8 0 1 1-8 0V14z" fill="currentColor" fillOpacity="0.08" />
          <circle cx="34" cy="45" r="4" fill="currentColor" />
          <line x1="34" y1="22" x2="34" y2="42" strokeWidth="2.5" />
          <line x1="38" y1="20" x2="42" y2="20" />
          <line x1="38" y1="26" x2="42" y2="26" />
          <line x1="38" y1="32" x2="42" y2="32" />
        </svg>
      );

    case 'roaster':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="16" y="20" width="32" height="24" rx="4" fill="currentColor" fillOpacity="0.08" />
          <circle cx="32" cy="32" r="7" strokeDasharray="3 3" />
          <path d="M20 44l-4 8h32l-4-8" />
          <line x1="28" y1="12" x2="28" y2="20" />
          <line x1="36" y1="12" x2="36" y2="20" />
        </svg>
      );

    case 'bundle':
    case 'gift':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="24" width="36" height="28" rx="4" fill="currentColor" fillOpacity="0.08" />
          <path d="M14 34h36" />
          <line x1="32" y1="24" x2="32" y2="52" />
          <path d="M32 24c-4-8-12-6-8 0 4 6 8 0 8 0s4 6 8 0c4-6-4-8-8 0z" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'sparkles':
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 10l4 14 14 4-14 4-4 14-4-14-14-4 14-4z" fill="currentColor" fillOpacity="0.15" />
          <path d="M46 38l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );

    case 'wdt':
    default:
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="26" y="14" width="12" height="18" rx="3" fill="currentColor" fillOpacity="0.1" />
          <line x1="28" y1="32" x2="24" y2="52" />
          <line x1="32" y1="32" x2="32" y2="54" />
          <line x1="36" y1="32" x2="40" y2="52" />
          <circle cx="32" cy="20" r="2" fill="currentColor" />
        </svg>
      );
  }
};

export const CoffeeProductIcon = CoffeeIcon;
