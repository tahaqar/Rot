import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocFromServer,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Product, Category, WebsiteSettings, PaymentMethodsConfig, OrderDetails, OrderStatus, PaymentStatus } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';
import { CATEGORIES as INITIAL_CATEGORIES } from '../data/categories';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export const DEFAULT_SETTINGS: WebsiteSettings = {
  websiteName: 'نغمة فنجان',
  slogan: 'نكهات تترك أثراً',
  logoUrl: '/assets/aistudio/cropped_circle_image_9af6fab3.png',
  phone: '07702631412',
  whatsapp: '07702631412',
  instagram: 'nag.fng',
  facebook: 'https://www.facebook.com/share/1EgrT8MYdD/',
  tiktok: '',
  description: 'قهوة مختصة || أجهزة وطواحين | بيع جملة ومفرد | شحن وتوصيل لكافة مناطق ومحافظات العراق.',
  announcementText: 'نغمة فنجان || نكهات تترك أثراً - شحن وتوصيل لكافة محافظات العراق',
  isAnnouncementActive: true,
  deliveryFeeBaghdad: 5000,
  deliveryFeeProvinces: 6000,
  deliveryNotes: 'توصيل سريع خلال 24-48 ساعة لجميع مدن ومحافظات العراق مع ضمان فحص ومعاينة المنتج.',
  currency: 'د.ع',
  address: 'العراق - بغداد',
  workingHours: 'يومياً من 9:00 صباحاً حتى 11:00 مساءً',
};

export const DEFAULT_PAYMENT_CONFIG: PaymentMethodsConfig = {
  cod: {
    enabled: true,
    label: 'الدفع عند الاستلام (COD)',
    description: 'ادفع نقداً لمندوب التوصيل بعد استلام الطلب ومعاينته مباشرة.',
  },
  zaincash: {
    enabled: true,
    label: 'محفظة زين كاش (Zain Cash)',
    description: 'الدفع الفوري والمباشر عبر تطبيق محفظة زين كاش العراقية.',
    merchantId: '',
    msisdn: '07702631412',
    secret: '',
    isTestEnv: true,
    callbackUrl: '',
  },
  card: {
    enabled: true,
    label: 'ماستركارد / فيزا كارد / كي كارد',
    description: 'بوابة الدفع الإلكتروني المصرفية الآمنة لبطاقات الدفع الوطنية والعالمية.',
    provider: 'qi',
    publicKey: '',
    secretKey: '',
    isLive: false,
  },
};

// =======================
// INITIAL DATABASE SEEDING
// =======================
export async function seedDatabaseIfEmpty(
  customProducts?: Product[],
  customCategories?: Category[]
): Promise<boolean> {
  try {
    const productsRef = collection(db, 'products');
    const prodSnapshot = await getDocs(productsRef);

    if (prodSnapshot.empty) {
      return await seedDatabaseForce(customProducts, customCategories);
    }
    return false;
  } catch (err) {
    console.warn('Database seeding check note:', err);
    return false;
  }
}

export async function seedDatabaseForce(
  customProducts?: Product[],
  customCategories?: Category[]
): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    const catsToSeed = customCategories && customCategories.length > 0 ? customCategories : INITIAL_CATEGORIES;
    const prodsToSeed = customProducts && customProducts.length > 0 ? customProducts : INITIAL_PRODUCTS;

    // Seed categories
    for (const cat of catsToSeed) {
      const catDoc = doc(db, 'categories', cat.id);
      batch.set(catDoc, {
        ...cat,
        active: true,
        createdAt: Date.now(),
      });
    }

    // Seed products
    for (const prod of prodsToSeed) {
      const prodDoc = doc(db, 'products', prod.id);
      batch.set(prodDoc, {
        ...prod,
        isPublished: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Seed settings
    const settingsDoc = doc(db, 'settings', 'general');
    batch.set(settingsDoc, {
      ...DEFAULT_SETTINGS,
      updatedAt: Date.now(),
    });

    // Seed payments
    const paymentDoc = doc(db, 'paymentMethods', 'config');
    batch.set(paymentDoc, {
      ...DEFAULT_PAYMENT_CONFIG,
      updatedAt: Date.now(),
    });

    await batch.commit();
    console.log('Database seeded successfully in Cloud Firestore!');
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'products');
  }
}

// =======================
// PRODUCTS
// =======================
export function subscribeToProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const productsRef = collection(db, 'products');
  return onSnapshot(
    productsRef,
    (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        prods.push({
          ...(data as Product),
          id: doc.id,
        });
      });
      onSuccess(prods);
    },
    (err) => {
      console.warn('Firestore products snapshot warning:', err);
      if (onError) onError(err);
    }
  );
}

export async function fetchProductsOnce(): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    const prods: Product[] = [];
    snapshot.forEach((doc) => {
      prods.push({
        ...(doc.data() as Product),
        id: doc.id,
      });
    });
    return prods;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'products');
  }
}

export const fetchProductsFromDb = fetchProductsOnce;

export async function saveProduct(product: Partial<Product> & { id?: string }): Promise<string> {
  const productId = product.id && product.id.trim() !== ''
    ? product.id.trim()
    : 'prod-' + Date.now();

  const prodDocRef = doc(db, 'products', productId);
  const now = Date.now();

  const dataToSave = {
    ...product,
    id: productId,
    name: product.name || 'منتج جديد',
    nameEn: product.nameEn || '',
    brand: product.brand || 'نغمة فنجان',
    category: product.category || 'drippers',
    subcategoryId: product.subcategoryId || '',
    subcategory: product.subcategory || '',
    price: Number(product.price) || 0,
    originalPrice: product.originalPrice ? Number(product.originalPrice) : 0,
    rating: product.rating !== undefined ? Number(product.rating) : 5.0,
    reviewCount: product.reviewCount !== undefined ? Number(product.reviewCount) : 1,
    inStock: product.inStock !== undefined ? Boolean(product.inStock) : true,
    stockCount: product.stockCount !== undefined ? Number(product.stockCount) : 10,
    sku: product.sku || `NF-${Math.floor(1000 + Math.random() * 9000)}`,
    badge: product.badge || '',
    iconType: product.iconType || 'dripperset',
    description: product.description || '',
    features: Array.isArray(product.features) ? product.features : [],
    specs: product.specs || {},
    brewGuideTips: Array.isArray(product.brewGuideTips) ? product.brewGuideTips : [],
    gallery: Array.isArray(product.gallery) ? product.gallery : [],
    imageUrl: product.imageUrl || '',
    instagramUrl: product.instagramUrl || '',
    videoUrl: product.videoUrl || '',
    isPublished: product.isPublished !== undefined ? Boolean(product.isPublished) : true,
    updatedAt: now,
    createdAt: product.createdAt || now,
  };

  try {
    await setDoc(prodDocRef, dataToSave, { merge: true });
    return productId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `products/${productId}`);
  }
}

export async function deleteProductFromDb(productId: string): Promise<void> {
  try {
    const prodDocRef = doc(db, 'products', productId);
    await deleteDoc(prodDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
  }
}

export async function toggleProductPublishStatus(productId: string, currentStatus: boolean): Promise<void> {
  try {
    const prodDocRef = doc(db, 'products', productId);
    await updateDoc(prodDocRef, {
      isPublished: !currentStatus,
      updatedAt: Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
  }
}

// =======================
// CATEGORIES
// =======================
export function subscribeToCategories(
  onSuccess: (categories: Category[]) => void,
  onError?: (err: Error) => void
) {
  const catRef = collection(db, 'categories');
  return onSnapshot(
    catRef,
    (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => {
        cats.push({
          ...(doc.data() as Category),
          id: doc.id,
        });
      });
      onSuccess(cats);
    },
    (err) => {
      console.warn('Firestore categories snapshot warning:', err);
      if (onError) onError(err);
    }
  );
}

export async function fetchCategoriesOnce(): Promise<Category[]> {
  try {
    const catRef = collection(db, 'categories');
    const snapshot = await getDocs(catRef);
    const cats: Category[] = [];
    snapshot.forEach((doc) => {
      cats.push({
        ...(doc.data() as Category),
        id: doc.id,
      });
    });
    return cats;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'categories');
  }
}

export const fetchCategoriesFromDb = fetchCategoriesOnce;

export async function saveCategory(cat: Partial<Category> & { id?: string }): Promise<string> {
  const catId = cat.id && cat.id.trim() !== '' ? cat.id.trim() : 'cat-' + Date.now();
  const catDocRef = doc(db, 'categories', catId);
  const data = {
    ...cat,
    id: catId,
    name: cat.name || 'تصنيف جديد',
    iconType: cat.iconType || 'dripperset',
    subcategories: Array.isArray(cat.subcategories) ? cat.subcategories : [],
    itemCount: Number(cat.itemCount) || 0,
    featured: cat.featured !== undefined ? Boolean(cat.featured) : true,
    active: cat.active !== undefined ? Boolean(cat.active) : true,
    createdAt: cat.createdAt || Date.now(),
  };
  try {
    await setDoc(catDocRef, data, { merge: true });
    return catId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `categories/${catId}`);
  }
}

export async function deleteCategoryFromDb(catId: string): Promise<void> {
  try {
    const catDocRef = doc(db, 'categories', catId);
    await deleteDoc(catDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `categories/${catId}`);
  }
}

// =======================
// WEBSITE SETTINGS
// =======================
export function subscribeToSettings(
  onSuccess: (settings: WebsiteSettings) => void,
  onError?: (err: Error) => void
) {
  const settingsDocRef = doc(db, 'settings', 'general');
  return onSnapshot(
    settingsDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onSuccess({ ...DEFAULT_SETTINGS, ...snapshot.data() } as WebsiteSettings);
      } else {
        onSuccess(DEFAULT_SETTINGS);
      }
    },
    (err) => {
      console.warn('Firestore settings snapshot warning:', err);
      if (onError) onError(err);
    }
  );
}

export async function fetchSettingsOnce(): Promise<WebsiteSettings> {
  try {
    const settingsDocRef = doc(db, 'settings', 'general');
    const snapshot = await getDoc(settingsDocRef);
    if (snapshot.exists()) {
      return { ...DEFAULT_SETTINGS, ...snapshot.data() } as WebsiteSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (err) {
    console.warn('Error fetching settings once:', err);
    return DEFAULT_SETTINGS;
  }
}

export const fetchSettingsFromDb = fetchSettingsOnce;

export async function saveSettings(settings: Partial<WebsiteSettings>): Promise<void> {
  const settingsDocRef = doc(db, 'settings', 'general');
  try {
    await setDoc(
      settingsDocRef,
      {
        ...settings,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/general');
  }
}

// =======================
// PAYMENT METHODS CONFIG
// =======================
export function subscribeToPaymentConfig(
  onSuccess: (config: PaymentMethodsConfig) => void,
  onError?: (err: Error) => void
) {
  const configDocRef = doc(db, 'paymentMethods', 'config');
  return onSnapshot(
    configDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onSuccess({ ...DEFAULT_PAYMENT_CONFIG, ...snapshot.data() } as PaymentMethodsConfig);
      } else {
        onSuccess(DEFAULT_PAYMENT_CONFIG);
      }
    },
    (err) => {
      console.warn('Firestore paymentConfig snapshot warning:', err);
      if (onError) onError(err);
    }
  );
}

export async function fetchPaymentConfigOnce(): Promise<PaymentMethodsConfig> {
  try {
    const configDocRef = doc(db, 'paymentMethods', 'config');
    const snapshot = await getDoc(configDocRef);
    if (snapshot.exists()) {
      return { ...DEFAULT_PAYMENT_CONFIG, ...snapshot.data() } as PaymentMethodsConfig;
    }
    return DEFAULT_PAYMENT_CONFIG;
  } catch (err) {
    console.warn('Error fetching payment config once:', err);
    return DEFAULT_PAYMENT_CONFIG;
  }
}

export const fetchPaymentConfigFromDb = fetchPaymentConfigOnce;

export async function savePaymentConfig(config: PaymentMethodsConfig): Promise<void> {
  const configDocRef = doc(db, 'paymentMethods', 'config');
  try {
    await setDoc(
      configDocRef,
      {
        ...config,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'paymentMethods/config');
  }
}

// =======================
// ORDERS
// =======================
export function subscribeToOrders(
  onSuccess: (orders: OrderDetails[]) => void,
  onError?: (err: Error) => void
) {
  const ordersRef = collection(db, 'orders');
  return onSnapshot(
    ordersRef,
    (snapshot) => {
      const orders: OrderDetails[] = [];
      snapshot.forEach((doc) => {
        orders.push({
          ...(doc.data() as OrderDetails),
          id: doc.id,
        });
      });
      // Sort orders descending by date / timestamp
      orders.sort((a, b) => {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.date).getTime() || 0;
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.date).getTime() || 0;
        return timeB - timeA;
      });
      onSuccess(orders);
    },
    (err) => {
      console.warn('Firestore orders snapshot warning:', err);
      if (onError) onError(err);
    }
  );
}

export async function fetchOrdersOnce(): Promise<OrderDetails[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    const orders: OrderDetails[] = [];
    snapshot.forEach((doc) => {
      orders.push({
        ...(doc.data() as OrderDetails),
        id: doc.id,
      });
    });
    orders.sort((a, b) => {
      const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.date).getTime() || 0;
      const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.date).getTime() || 0;
      return timeB - timeA;
    });
    return orders;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'orders');
  }
}

export const fetchOrdersFromDb = fetchOrdersOnce;

export async function submitOrderToDb(order: OrderDetails): Promise<string> {
  const orderDocRef = doc(collection(db, 'orders'));
  const now = Date.now();
  const orderData = {
    ...order,
    id: orderDocRef.id,
    orderStatus: order.orderStatus || 'pending',
    paymentStatus: order.paymentStatus || (order.paymentMethod === 'cod' ? 'pending' : 'pending'),
    createdAt: now,
    updatedAt: now,
  };
  try {
    await setDoc(orderDocRef, orderData);
    return orderDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `orders/${orderDocRef.id}`);
  }
}

export const saveOrderToDb = submitOrderToDb;

export async function updateOrderStatusInDb(
  orderDocId: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<void> {
  const orderDocRef = doc(db, 'orders', orderDocId);
  const updateData: Record<string, any> = {
    orderStatus,
    updatedAt: Date.now(),
  };
  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus;
  }
  try {
    await updateDoc(orderDocRef, updateData);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `orders/${orderDocId}`);
  }
}

export async function deleteOrderFromDb(orderDocId: string): Promise<void> {
  try {
    const orderDocRef = doc(db, 'orders', orderDocId);
    await deleteDoc(orderDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `orders/${orderDocId}`);
  }
}
