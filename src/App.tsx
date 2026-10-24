import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Coffee, ArrowUpDown, 
  SlidersHorizontal, X
} from 'lucide-react';
import { Product, CartItem, OrderDetails, Category, WebsiteSettings, PaymentMethodsConfig } from './types';
import { PRODUCTS as INITIAL_PRODUCTS } from './data/products';
import { CATEGORIES as INITIAL_CATEGORIES } from './data/categories';
import { BRANDS } from './data/brands';
import { Header } from './components/Header';
import { DrawerNav } from './components/DrawerNav';
import { SearchFilterBar } from './components/SearchFilterBar';
import { HeroBanner } from './components/HeroBanner';
import { CategoriesCarousel } from './components/CategoriesCarousel';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { FilterBottomSheet } from './components/FilterBottomSheet';
import { SubcategoriesStrip } from './components/SubcategoriesStrip';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { SearchModal } from './components/SearchModal';
import { WishlistModal } from './components/WishlistModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { 
  subscribeToProducts, 
  subscribeToCategories, 
  subscribeToSettings, 
  subscribeToPaymentConfig,
  testConnection,
  DEFAULT_SETTINGS,
  DEFAULT_PAYMENT_CONFIG,
} from './services/dbService';

export default function App() {
  // Application View: 'store' | 'admin'
  const [view, setView] = useState<'store' | 'admin'>(() => {
    return window.location.hash === '#admin' ? 'admin' : 'store';
  });

  // Real-time Cloud Firestore Data
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_SETTINGS);
  const [paymentConfig, setPaymentConfig] = useState<PaymentMethodsConfig>(DEFAULT_PAYMENT_CONFIG);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Connection check on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setView('admin');
      } else if (view === 'admin' && window.location.hash !== '#admin') {
        setView('store');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [view]);

  // Subscribe to real-time Cloud Firestore updates
  useEffect(() => {
    const unsubProducts = subscribeToProducts((liveProducts) => {
      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
      }
      setIsDbLoaded(true);
    });

    const unsubCategories = subscribeToCategories((liveCategories) => {
      if (liveCategories && liveCategories.length > 0) {
        setCategories(liveCategories);
      }
    });

    const unsubSettings = subscribeToSettings((liveSettings) => {
      if (liveSettings) {
        setSettings(liveSettings);
      }
    });

    const unsubPayment = subscribeToPaymentConfig((livePayment) => {
      if (livePayment) {
        setPaymentConfig(livePayment);
      }
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSettings();
      unsubPayment();
    };
  }, []);

  // Search & Navigation States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // Modals & Bottom Sheets States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Selected Item / Active Modals
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);

  // Cart & Wishlist State (with localStorage persistence)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('naghma_cart') || localStorage.getItem('finjan_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('naghma_wishlist') || localStorage.getItem('finjan_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Coupons
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save Cart & Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('naghma_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('naghma_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // Recalculate discount if coupon applied
  useEffect(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    if (appliedCoupon === 'NAGHMA10' || appliedCoupon === 'FINJAN10') {
      setDiscountAmount(Math.round(subtotal * 0.1));
    } else if (appliedCoupon === 'BAGHDAD') {
      setDiscountAmount(Math.min(subtotal, 5000));
    } else if (appliedCoupon === 'BARISTA') {
      setDiscountAmount(Math.round(subtotal * 0.15));
    } else {
      setDiscountAmount(0);
    }
  }, [cart, appliedCoupon]);

  // Cart handlers
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    setToastMessage(`تمت إضافة "${product.name}" إلى السلة (${quantity} قطع)`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  // Wishlist handler
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        return prev.filter((id) => id !== productId);
      } else {
        const prod = products.find((p) => p.id === productId);
        if (prod) {
          setToastMessage(`تمت إضافة "${prod.name}" إلى المفضلة`);
        }
        return [...prev, productId];
      }
    });
  };

  // Coupon handling
  const handleApplyCoupon = (code: string) => {
    const upper = code.toUpperCase().trim();
    if (upper === 'NAGHMA10' || upper === 'FINJAN10') {
      setAppliedCoupon('NAGHMA10');
      return { success: true, message: 'تم تطبيق خصم 10% بنجاح!' };
    } else if (upper === 'BAGHDAD') {
      setAppliedCoupon('BAGHDAD');
      return { success: true, message: 'تم خصم 5,000 د.ع كهدية لأهل بغداد!' };
    } else if (upper === 'BARISTA') {
      setAppliedCoupon('BARISTA');
      return { success: true, message: 'تم تطبيق خصم الباريستا 15%!' };
    }
    return { success: false, message: 'عذراً، كود الخصم غير صالح أو منتهي الصلاحية.' };
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  // Order placed
  const handleOrderPlaced = (order: OrderDetails) => {
    setConfirmedOrder(order);
    setIsCheckoutOpen(false);
    handleClearCart();
  };

  // Helper to match a product against a category (by ID, Name, or subcategory)
  const checkProductMatchesCategory = (
    product: Product,
    targetCategory: string,
    categoriesList: Category[]
  ): boolean => {
    if (!targetCategory || targetCategory === 'all') return true;

    const targetClean = targetCategory.trim().toLowerCase();
    const prodCatClean = (product.category || '').trim().toLowerCase();

    // 1. Direct match with targetCategory string
    if (prodCatClean === targetClean) return true;

    // 2. Find target category object in categoriesList
    const targetCatObj = categoriesList.find(
      (c) =>
        c.id.toLowerCase() === targetClean ||
        c.name.trim().toLowerCase() === targetClean
    );

    if (targetCatObj) {
      if (prodCatClean === targetCatObj.id.toLowerCase()) return true;
      if (prodCatClean === targetCatObj.name.trim().toLowerCase()) return true;

      // Check if product's category or subcategory matches any branch of this category
      if (targetCatObj.subcategories && targetCatObj.subcategories.length > 0) {
        const matchesSub = targetCatObj.subcategories.some(
          (sub) =>
            sub.id.toLowerCase() === prodCatClean ||
            sub.name.trim().toLowerCase() === prodCatClean ||
            (product.subcategoryId && product.subcategoryId.trim().toLowerCase() === sub.id.toLowerCase()) ||
            (product.subcategory && product.subcategory.trim().toLowerCase() === sub.name.trim().toLowerCase())
        );
        if (matchesSub) return true;
      }
    }

    // 3. Find if product's category corresponds to a category whose ID or Name equals targetCategory
    const prodCatObj = categoriesList.find(
      (c) =>
        c.id.toLowerCase() === prodCatClean ||
        c.name.trim().toLowerCase() === prodCatClean
    );

    if (prodCatObj) {
      if (prodCatObj.id.toLowerCase() === targetClean) return true;
      if (prodCatObj.name.trim().toLowerCase() === targetClean) return true;
      if (targetCatObj && prodCatObj.id === targetCatObj.id) return true;
    }

    return false;
  };

  // Helper to match a product against a subcategory / branch
  const checkProductMatchesSubcategory = (
    product: Product,
    targetSubcat: string,
    parentCategory?: Category
  ): boolean => {
    if (!targetSubcat || targetSubcat === 'all') return true;

    const targetClean = targetSubcat.trim().toLowerCase();
    const prodSubId = (product.subcategoryId || '').trim().toLowerCase();
    const prodSubName = (product.subcategory || '').trim().toLowerCase();

    if (prodSubId === targetClean || prodSubName === targetClean) return true;

    if (parentCategory?.subcategories) {
      const subObj = parentCategory.subcategories.find(
        (s) =>
          s.id.toLowerCase() === targetClean ||
          s.name.trim().toLowerCase() === targetClean
      );
      if (subObj) {
        if (prodSubId === subObj.id.toLowerCase()) return true;
        if (prodSubName === subObj.name.trim().toLowerCase()) return true;
      }
    }

    return false;
  };

  // Dynamic merged categories (all default + Firestore admin-added) with live product counts & subcategories
  const displayCategories = useMemo(() => {
    const map = new Map<string, Category>();

    // 1. Initial base categories
    INITIAL_CATEGORIES.forEach((c) => {
      map.set(c.id, { ...c });
    });

    // 2. Merge all categories saved in Firestore (admin additions/edits)
    if (categories && categories.length > 0) {
      categories.forEach((c) => {
        const existing = map.get(c.id);
        const mergedSubs =
          c.subcategories && c.subcategories.length > 0
            ? c.subcategories
            : existing?.subcategories || [];

        map.set(c.id, {
          ...existing,
          ...c,
          subcategories: mergedSubs,
          active: c.active !== undefined ? c.active : (existing?.active !== undefined ? existing.active : true),
        });
      });
    }

    // Ensure 'all' exists
    if (!map.has('all')) {
      map.set('all', {
        id: 'all',
        name: 'الكل',
        iconType: 'dripperset',
        itemCount: products.filter((p) => p.isPublished !== false).length,
        featured: true,
        active: true,
      });
    }

    const allCats = Array.from(map.values()).filter((c) => c.active !== false);

    // Compute live product counts using the robust matching function
    return allCats.map((cat) => {
      if (cat.id === 'all') {
        return {
          ...cat,
          itemCount: products.filter((p) => p.isPublished !== false).length,
        };
      }
      const count = products.filter(
        (p) => p.isPublished !== false && checkProductMatchesCategory(p, cat.id, allCats)
      ).length;
      return { ...cat, itemCount: count };
    });
  }, [categories, products]);

  // Active Category Object for subcategories strip
  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === 'all') return undefined;
    const clean = selectedCategory.trim().toLowerCase();
    return displayCategories.find(
      (c) => c.id.toLowerCase() === clean || c.name.trim().toLowerCase() === clean
    );
  }, [displayCategories, selectedCategory]);

  // Filtered & Sorted Products (Live from Cloud Firestore + Search)
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (p.isPublished === false) return false;

        // Robust category matching: handles admin IDs, custom names, Arabic slugs, and subcategories
        const matchCat = checkProductMatchesCategory(p, selectedCategory, displayCategories);

        // Robust subcategory / branch matching
        const matchSubcat = checkProductMatchesSubcategory(p, selectedSubcategory, activeCategoryObj);

        // Brand match
        const matchBrand =
          selectedBrand === 'all' ||
          (p.brand && p.brand.trim().toLowerCase() === selectedBrand.trim().toLowerCase());

        // Stock match
        const matchStock =
          !onlyInStock ||
          (p.inStock && (p.stockCount === undefined || p.stockCount > 0));

        // Search match
        const term = searchTerm.trim().toLowerCase();
        const matchSearch =
          !term ||
          p.name.toLowerCase().includes(term) ||
          (p.nameEn && p.nameEn.toLowerCase().includes(term)) ||
          (p.brand && p.brand.toLowerCase().includes(term)) ||
          (p.description && p.description.toLowerCase().includes(term)) ||
          (p.sku && p.sku.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term)) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(term));

        return matchCat && matchSubcat && matchBrand && matchStock && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.reviewCount || 0) - (a.reviewCount || 0); // Popularity default
      });
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    onlyInStock,
    sortBy,
    searchTerm,
    displayCategories,
    activeCategoryObj,
  ]);

  // Dynamic merged brands (all default + newly added product brands) with live product counts
  const allBrands = useMemo(() => {
    const brandMap = new Map<string, { id: string; name: string; origin: string; itemCount: number; description: string }>();

    // 1. Initial predefined brands
    BRANDS.forEach((b) => {
      brandMap.set(b.name.toLowerCase(), { ...b });
    });

    // 2. Curated popular specialty brands
    const POPULAR_LIST = [
      { name: 'Hario', origin: 'اليابان' },
      { name: 'Timemore', origin: 'سنغافورة' },
      { name: 'Fellow', origin: 'أمريكا' },
      { name: 'Comandante', origin: 'ألمانيا' },
      { name: '1Zpresso', origin: 'تايوان' },
      { name: 'Kalita', origin: 'اليابان' },
      { name: 'Baratza', origin: 'أمريكا' },
      { name: 'Chemex', origin: 'أمريكا' },
      { name: 'Acaia', origin: 'أمريكا' },
      { name: 'Normcore', origin: 'أستراليا' },
      { name: 'Origami', origin: 'اليابان' },
      { name: 'MHW-3BOMBER', origin: 'الصين' },
      { name: 'Bialetti', origin: 'إيطاليا' },
      { name: 'Cafelat', origin: 'المملكة المتحدة' },
      { name: 'Flair Espresso', origin: 'أمريكا' },
      { name: 'Kinto', origin: 'اليابان' },
      { name: 'Mahlkönig', origin: 'ألمانيا' },
      { name: 'نغمة فنجان', origin: 'العراق' },
    ];

    POPULAR_LIST.forEach((item) => {
      const key = item.name.toLowerCase();
      if (!brandMap.has(key)) {
        brandMap.set(key, {
          id: key.replace(/\s+/g, '-'),
          name: item.name,
          origin: item.origin,
          itemCount: 0,
          description: `أدوات ومعدات فاخرة من ماركة ${item.name}`,
        });
      }
    });

    // 3. Scan all products for any brand added by user
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        const trimmed = p.brand.trim();
        const key = trimmed.toLowerCase();
        if (!brandMap.has(key)) {
          brandMap.set(key, {
            id: key.replace(/[^\w\u0600-\u06FF]+/g, '-'),
            name: trimmed,
            origin: 'مختارة',
            itemCount: 0,
            description: `أدوات ومعدات فاخرة من ماركة ${trimmed}`,
          });
        }
      }
    });

    // Compute live item counts
    return Array.from(brandMap.values()).map((b) => {
      const count = products.filter(
        (p) => p.brand && p.brand.toLowerCase() === b.name.toLowerCase() && p.isPublished !== false
      ).length;
      return { ...b, itemCount: count };
    });
  }, [products]);

  // Wishlisted product objects
  const wishlistedProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Related products for detail modal
  const relatedProducts = useMemo(() => {
    if (!activeProduct) return [];
    return products
      .filter(
        (p) =>
          p.id !== activeProduct.id &&
          p.isPublished !== false &&
          (p.category === activeProduct.category || p.brand === activeProduct.brand)
      )
      .slice(0, 4);
  }, [products, activeProduct]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedSubcategory !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (onlyInStock) count++;
    if (sortBy !== 'popular') count++;
    if (searchTerm.trim()) count++;
    return count;
  }, [selectedCategory, selectedSubcategory, selectedBrand, onlyInStock, sortBy, searchTerm]);

  // Open Admin View
  const handleOpenAdmin = () => {
    window.location.hash = 'admin';
    setView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Exit Admin View
  const handleExitAdmin = () => {
    window.location.hash = '';
    setView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin view, render full Admin Panel
  if (view === 'admin') {
    return (
      <div className="font-['Tajawal',sans-serif]" dir="rtl">
        <AdminDashboard onExitAdmin={handleExitAdmin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#17191c] flex flex-col font-['Tajawal',sans-serif]" dir="rtl">
      
      {/* 2. Sticky Header: 56x56 circular logo frame, bold store name, cart with red badge & menu */}
      <Header
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        wishlistCount={wishlist.length}
        settings={settings}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenBrewGuide={() => {}}
        onLogoClick={() => {
          setSelectedCategory('all');
          setSelectedSubcategory('all');
          setSelectedBrand('all');
          setSearchTerm('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 3. Search Bar: Clean, full-width pill matching Screenshot 3 */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="flex-1">
        
        {/* 4. Hero Promotional Banner: Horizontal card layout with clean circular visual (no arrow covering image) */}
        <HeroBanner
          onSelectAction={(target) => {
            if (target?.categoryId) {
              setSelectedCategory(target.categoryId);
              setSelectedSubcategory('all');
              setSelectedBrand('all');
            } else if (target?.brandName) {
              setSelectedBrand(target.brandName);
            }
            const el = document.getElementById('products-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 5. Categories Horizontal Carousel with full untruncated names */}
        <CategoriesCarousel
          categories={displayCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setSelectedSubcategory('all');
          }}
        />

        {/* 5.1 Subcategories / Branches Row (Appears when a category is selected) */}
        {selectedCategory !== 'all' && activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
          <SubcategoriesStrip
            category={activeCategoryObj}
            selectedSubcategory={selectedSubcategory}
            onSelectSubcategory={(subId) => setSelectedSubcategory(subId)}
            products={products}
          />
        )}

        {/* 6. Sticky Sort and Filter Toolbar directly above Products (50/50 Width Row, Touch Targets >= 44px) */}
        <div className="sticky top-[52px] sm:top-[56px] z-30 bg-[#fafaf8]/95 backdrop-blur-md border-y border-[#e6e8e4] px-3 sm:px-6 py-2 shadow-2xs font-['Tajawal',sans-serif]">
          <div className="max-w-6xl mx-auto space-y-2">
            
            {/* Row 1: Sort Button (50%) & Filter Button (50%) in one row */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {/* Sort Dropdown Button (50% width, min-h-[44px]) */}
              <div className="relative min-h-[44px] flex items-center justify-center gap-2 bg-white border border-[#e6e8e4] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#12302B] shadow-2xs hover:border-[#12302B]/40 transition-colors">
                <ArrowUpDown className="w-4 h-4 text-[#12302B] shrink-0 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-[#12302B] focus:outline-hidden cursor-pointer font-bold text-xs sm:text-sm w-full text-center appearance-none"
                  aria-label="ترتيب المنتجات"
                >
                  <option value="popular">الأكثر طلباً</option>
                  <option value="rating">الأعلى تقييماً</option>
                  <option value="price-asc">السعر: من الأقل</option>
                  <option value="price-desc">السعر: من الأعلى</option>
                </select>
              </div>

              {/* Filter Button (50% width, min-h-[44px]) */}
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className="min-h-[44px] flex items-center justify-center gap-2 bg-white border border-[#e6e8e4] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#12302B] hover:bg-[#f4f7f5] hover:border-[#12302B]/40 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#12302B] shrink-0" />
                <span>تصفية</span>
                {((selectedBrand !== 'all' ? 1 : 0) + (onlyInStock ? 1 : 0) + (selectedSubcategory !== 'all' ? 1 : 0)) > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#12302B] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                    {(selectedBrand !== 'all' ? 1 : 0) + (onlyInStock ? 1 : 0) + (selectedSubcategory !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Row 2: Active Applied Filter Chips (Brand, Stock, Search) + "مسح الكل" Button (Only appears if a filter is active) */}
            {(selectedBrand !== 'all' || onlyInStock || Boolean(searchTerm.trim())) && (
              <div className="flex items-center gap-2 flex-wrap pt-1.5 border-t border-[#e6e8e4]/60">
                {selectedBrand !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedBrand('all')}
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#e6e8e4] text-[#12302B] text-xs font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer shadow-2xs"
                    title="إلغاء فلتر الماركة"
                  >
                    <span>الماركة: {selectedBrand}</span>
                    <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  </button>
                )}

                {onlyInStock && (
                  <button
                    type="button"
                    onClick={() => setOnlyInStock(false)}
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#e6e8e4] text-[#12302B] text-xs font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer shadow-2xs"
                    title="إلغاء فلتر المتوفر فقط"
                  >
                    <span>المتوفر بالمخزون</span>
                    <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  </button>
                )}

                {Boolean(searchTerm.trim()) && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#e6e8e4] text-[#12302B] text-xs font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer shadow-2xs"
                    title="إلغاء البحث"
                  >
                    <span>بحث: {searchTerm}</span>
                    <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  </button>
                )}

                {/* "مسح الكل" button appears only when a filter is active */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrand('all');
                    setSelectedSubcategory('all');
                    setOnlyInStock(false);
                    setSearchTerm('');
                  }}
                  className="ms-auto text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1.5 underline cursor-pointer active:scale-95 transition-all min-h-[38px] inline-flex items-center"
                >
                  مسح الكل
                </button>
              </div>
            )}

          </div>
        </div>

        {/* 7. Product Grid Section (2 Columns directly below Categories) */}
        <section id="products-section" className="w-full max-w-6xl mx-auto px-3 sm:px-6 my-4 sm:my-6">
          
          {filteredProducts.length === 0 ? (
            /* Friendly Empty State as specified: Icon + "ما لقينا منتجات بهذا الفلتر" + Green "عرض كل المنتجات" Button */
            <div className="py-14 sm:py-20 text-center bg-white border border-[#e6e8e4] rounded-2xl p-6 sm:p-10 space-y-4 shadow-2xs max-w-lg mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#f4f7f5] border border-[#e6e8e4] flex items-center justify-center mx-auto text-[#12302B] shadow-2xs">
                <Coffee className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.8]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-black font-['Tajawal',sans-serif] text-[#12302B]">
                  ما لقينا منتجات بهذا الفلتر
                </h3>
                <p className="text-xs sm:text-sm text-[#4b5563] max-w-xs mx-auto leading-relaxed">
                  جرب تغيير التصنيف أو الماركة المختارة لتصفح تشكيلة أدوات القهوة المميزة.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                    setSelectedBrand('all');
                    setSearchTerm('');
                    setOnlyInStock(false);
                    setSortBy('popular');
                  }}
                  className="min-h-[46px] px-7 py-3 rounded-xl bg-[#12302B] text-white hover:bg-[#1a403a] text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#e4e8bf]" />
                  <span>عرض كل المنتجات</span>
                </button>
              </div>
            </div>
          ) : (
            /* 2 Columns on Mobile, 3-4 on Tablet/Desktop */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onViewProduct={(p) => setActiveProduct(p)}
                />
              ))}
            </div>
          )}

        </section>

      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setSelectedSubcategory('all');
          setSelectedBrand('all');
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Filter Bottom Sheet (Houses Branches & Brands, Hiding 0 Count Branches) */}
      <FilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        categories={displayCategories}
        brands={allBrands}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        selectedSubcategory={selectedSubcategory}
        onSelectSubcategory={(subId) => setSelectedSubcategory(subId)}
        selectedBrand={selectedBrand}
        onSelectBrand={(brandName) => setSelectedBrand(brandName)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onlyInStock={onlyInStock}
        onToggleInStock={setOnlyInStock}
        onResetFilters={() => {
          setSelectedCategory('all');
          setSelectedSubcategory('all');
          setSelectedBrand('all');
          setSearchTerm('');
          setOnlyInStock(false);
          setSortBy('popular');
        }}
        totalFilteredCount={filteredProducts.length}
        products={products}
      />

      {/* 7. Mobile Bottom Sheet: Product Detail Sheet */}
      <ProductDetailModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        isWishlisted={activeProduct ? wishlist.includes(activeProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={(prod, qty) => {
          handleAddToCart(prod, qty);
          setActiveProduct(null);
          setIsCheckoutOpen(true);
        }}
        relatedProducts={relatedProducts}
        onSelectProduct={(prod) => setActiveProduct(prod)}
      />

      {/* 7. Mobile Bottom Sheet: Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onContinueShopping={() => setIsCartOpen(false)}
        appliedCoupon={appliedCoupon}
        discountAmount={discountAmount}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />

      {/* Slide Drawer Navigation */}
      <DrawerNav
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={displayCategories}
        brands={allBrands}
        settings={settings}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setSelectedSubcategory('all');
          setSelectedBrand('all');
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectSubcategory={(subId) => {
          setSelectedSubcategory(subId);
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectBrand={(brandName) => {
          setSelectedBrand(brandName);
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenBrewGuide={() => {}}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discountAmount={discountAmount}
        settings={settings}
        paymentConfig={paymentConfig}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Order Confirmation Receipt Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(prod) => setActiveProduct(prod)}
        onAddToCart={handleAddToCart}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistedProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onSelectProduct={(prod) => setActiveProduct(prod)}
      />

      {/* Toast Notification Banner */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        onActionClick={() => {
          setToastMessage(null);
          setIsCartOpen(true);
        }}
      />

    </div>
  );
}
