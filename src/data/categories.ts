import { Category } from '../types';

export const CATEGORIES: Category[] = [
  { 
    id: 'all', 
    name: 'الكل', 
    iconType: 'dripperset', 
    itemCount: 16, 
    featured: true,
  },
  { 
    id: 'drippers', 
    name: 'أدوات التقطير', 
    iconType: 'dripperset', 
    itemCount: 6, 
    featured: true,
    subcategories: [
      { id: 'v60', name: 'أقماع V60', categoryId: 'drippers' },
      { id: 'chemex', name: 'كيمكس Chemex', categoryId: 'drippers' },
      { id: 'servers', name: 'سيرفرات تقديم', categoryId: 'drippers' },
      { id: 'dripper-filters', name: 'فلاتر تقطير', categoryId: 'drippers' },
    ],
  },
  { 
    id: 'espresso', 
    name: 'أدوات الإسبريسو', 
    iconType: 'tamper', 
    itemCount: 4, 
    featured: true,
    subcategories: [
      { id: 'portafilter', name: 'بورتافلتر مكشوف', categoryId: 'espresso' },
      { id: 'tamper', name: 'مكابس تامبر', categoryId: 'espresso' },
      { id: 'wdt', name: 'موزعات WDT وLeveler', categoryId: 'espresso' },
      { id: 'baskets', name: 'باسكتات دقيقة', categoryId: 'espresso' },
      { id: 'pitchers', name: 'بيتشرات تبخير', categoryId: 'espresso' },
    ],
  },
  { 
    id: 'grinders', 
    name: 'طواحين القهوة', 
    iconType: 'grinderManual', 
    itemCount: 4, 
    featured: true,
    subcategories: [
      { id: 'manual-grinders', name: 'طواحين يدوية', categoryId: 'grinders' },
      { id: 'electric-grinders', name: 'طواحين كهربائية', categoryId: 'grinders' },
      { id: 'burrs', name: 'تروس وقطع غيار', categoryId: 'grinders' },
    ],
  },
  { 
    id: 'kettles', 
    name: 'أباريق الترشيح', 
    iconType: 'kettle', 
    itemCount: 3, 
    featured: true,
    subcategories: [
      { id: 'smart-kettles', name: 'أباريق تحكم رقمي', categoryId: 'kettles' },
      { id: 'gooseneck', name: 'أباريق عنق الإوزة', categoryId: 'kettles' },
    ],
  },
  { 
    id: 'scales', 
    name: 'موازين ذكية', 
    iconType: 'scale', 
    itemCount: 3, 
    featured: true,
    subcategories: [
      { id: 'smart-scales', name: 'موازين استخلاص ذكية', categoryId: 'scales' },
      { id: 'compact-scales', name: 'موازين تدفق صغيرة', categoryId: 'scales' },
    ],
  },
  { 
    id: 'bundles', 
    name: 'بكجات التقطير', 
    iconType: 'bundle', 
    itemCount: 5, 
    featured: true,
    subcategories: [
      { id: 'starter-kits', name: 'بكجات متكاملة', categoryId: 'bundles' },
      { id: 'travel-kits', name: 'أطقم وحقائب سفر', categoryId: 'bundles' },
    ],
  },
  { 
    id: 'servers', 
    name: 'سيرفرات وأكواب', 
    iconType: 'server', 
    itemCount: 4, 
    featured: true,
    subcategories: [
      { id: 'glass-servers', name: 'سيرفرات زجاجية', categoryId: 'servers' },
      { id: 'ceramic-cups', name: 'أكواب سيراميك دبل وول', categoryId: 'servers' },
    ],
  },
  { 
    id: 'filters', 
    name: 'فلاتر ورقية', 
    iconType: 'filter', 
    itemCount: 3, 
    featured: false,
    subcategories: [
      { id: 'v60-filters', name: 'فلاتر V60 مقاس 01 و 02', categoryId: 'filters' },
      { id: 'special-filters', name: 'فلاتر كيمكس وأيروبريس', categoryId: 'filters' },
    ],
  },
];

