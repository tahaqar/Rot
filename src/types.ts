export interface Product {
  id: string;
  name: string;
  nameEn: string;
  brand: string;
  category: string;
  price: number; // in Iraqi Dinars (IQD)
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  sku: string;
  badge?: 'الأكثر مبيعاً' | 'جديد' | 'عرض خاص' | 'مميز' | 'الأعلى تقييماً' | string;
  iconType: 'dripperset' | 'server' | 'grinderManual' | 'grinderElectric' | 'kettle' | 'scale' | 'filter' | 'tamper' | 'cup' | 'wdt' | 'aeropress' | 'portafilter' | 'bundle' | string;
  description: string;
  features: string[];
  specs: { [key: string]: string };
  brewGuideTips?: string[];
  gallery?: string[];
  imageUrl?: string;
  instagramUrl?: string;
  videoUrl?: string;
  subcategoryId?: string;
  subcategory?: string;
  isPublished?: boolean;
  featured?: boolean;
  createdAt?: string | number;
  updatedAt?: string | number;
}

export interface Subcategory {
  id: string;
  name: string;
  nameEn?: string;
  categoryId: string; // parent category
  iconType?: string;
}

export interface Category {
  id: string;
  name: string;
  iconType: string;
  itemCount: number;
  subcategories?: Subcategory[];
  imageUrl?: string;
  featured?: boolean;
  active?: boolean;
  createdAt?: string | number;
}

export interface Brand {
  id: string;
  name: string;
  origin: string;
  itemCount: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderDetails {
  id?: string;
  orderId: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  paymentMethod: 'cod' | 'zaincash' | 'card' | 'asiapay';
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  date: string;
  createdAt?: string | number;
  updatedAt?: string | number;
}

export interface WebsiteSettings {
  websiteName: string;
  slogan: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok?: string;
  description: string;
  announcementText?: string;
  isAnnouncementActive?: boolean;
  deliveryFeeBaghdad: number;
  deliveryFeeProvinces: number;
  deliveryNotes?: string;
  currency: string;
  address: string;
  workingHours?: string;
}

export interface PaymentMethodsConfig {
  cod: {
    enabled: boolean;
    label: string;
    description: string;
  };
  zaincash: {
    enabled: boolean;
    label: string;
    description: string;
    merchantId: string;
    msisdn: string;
    secret: string;
    isTestEnv: boolean;
    callbackUrl?: string;
  };
  card: {
    enabled: boolean;
    label: string;
    description: string;
    provider: 'qi' | 'areeba' | 'paymob' | 'stripe' | 'custom';
    publicKey: string;
    secretKey?: string;
    isLive: boolean;
  };
}

export interface BrewGuide {
  id: string;
  title: string;
  method: string;
  icon: string;
  defaultCoffeeGrams: number;
  defaultRatio: number; // e.g. 15 for 1:15
  grindSize: string;
  waterTemp: string;
  brewTime: string;
  description: string;
  steps: {
    timeSec: number;
    title: string;
    description: string;
    targetWaterGrams: number; // multiplier of total water
  }[];
}

