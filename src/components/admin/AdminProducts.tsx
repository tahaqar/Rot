import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  Sparkles,
  ArrowUpDown,
  Filter,
  Instagram,
  Video,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { saveProduct, deleteProductFromDb, toggleProductPublishStatus } from '../../services/dbService';
import { uploadProductImage } from '../../services/storageService';
import { CoffeeProductIcon } from '../CoffeeIcons';
import { IconSelector } from './IconSelector';
import { CATEGORIES as INITIAL_CATEGORIES } from '../../data/categories';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  currency: string;
  onRefresh: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  categories,
  currency,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outofstock'>('all');

  // Curated list of popular specialty coffee brands
  const POPULAR_BRANDS = useMemo(
    () => [
      'Hario',
      'Timemore',
      'Fellow',
      'Comandante',
      '1Zpresso',
      'Kalita',
      'Baratza',
      'Chemex',
      'Acaia',
      'Normcore',
      'Origami',
      'MHW-3BOMBER',
      'Bialetti',
      'Cafelat',
      'Flair Espresso',
      'Kinto',
      'Mahlkönig',
      'نغمة فنجان',
    ],
    []
  );

  // Dynamically extract all available brands from existing products & popular list
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>(POPULAR_BRANDS);
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        brandSet.add(p.brand.trim());
      }
    });
    return Array.from(brandSet);
  }, [products, POPULAR_BRANDS]);

  // Ensure all categories (default initial + Firestore added) are always available
  const availableCategories = useMemo(() => {
    const map = new Map<string, Category>();
    INITIAL_CATEGORIES.forEach((c) => {
      if (c.id !== 'all') map.set(c.id, c);
    });
    if (categories && categories.length > 0) {
      categories.forEach((c) => {
        if (c.id !== 'all') map.set(c.id, c);
      });
    }
    return Array.from(map.values());
  }, [categories]);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form Processing States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formBrand, setFormBrand] = useState('Hario');
  const [formCategory, setFormCategory] = useState('drippers');
  const [formSubcategoryId, setFormSubcategoryId] = useState('');
  const [formSubcategoryName, setFormSubcategoryName] = useState('');
  const [formPrice, setFormPrice] = useState<number | string>('');
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | string>('');
  const [formStockCount, setFormStockCount] = useState<number | string>(10);
  const [formInStock, setFormInStock] = useState(true);
  const [formBadge, setFormBadge] = useState<string>('');
  const [formIconType, setFormIconType] = useState<string>('dripperset');
  const [formDescription, setFormDescription] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formInstagramUrl, setFormInstagramUrl] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>(['']);
  const [formBrewTips, setFormBrewTips] = useState<string[]>(['']);
  const [formIsPublished, setFormIsPublished] = useState(true);

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      p.category === selectedCategory ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      availableCategories.some(
        (c) =>
          c.id === selectedCategory &&
          (p.category === c.name || p.category?.toLowerCase() === c.name.toLowerCase())
      );

    const matchesBrand =
      selectedBrand === 'all' || (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'instock' && p.inStock && (p.stockCount === undefined || p.stockCount > 0)) ||
      (stockFilter === 'outofstock' && (!p.inStock || p.stockCount === 0));

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  // Dynamic subcategories based on currently selected category in form
  const currentCategorySubcategories = useMemo(() => {
    const foundCat = availableCategories.find(
      (c) =>
        c.id === formCategory ||
        c.id.toLowerCase() === formCategory.toLowerCase() ||
        c.name.toLowerCase() === formCategory.toLowerCase()
    );
    return foundCat?.subcategories || [];
  }, [availableCategories, formCategory]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormNameEn('');
    setFormBrand('Hario');
    const firstCat = availableCategories[0]?.id || 'drippers';
    setFormCategory(firstCat);
    setFormSubcategoryId('');
    setFormSubcategoryName('');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormStockCount(10);
    setFormInStock(true);
    setFormBadge('');
    setFormIconType('dripperset');
    setFormDescription('');
    setFormSku(`NF-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormImageUrl('');
    setFormInstagramUrl('');
    setFormFeatures(['']);
    setFormBrewTips(['']);
    setFormIsPublished(true);
    setSubmitError(null);
    setUploadProgress(null);
    setIsFormOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormNameEn(p.nameEn || '');
    setFormBrand(p.brand || 'نغمة فنجان');
    
    // Resolve matched category
    const matchedCat = availableCategories.find(
      (c) =>
        c.id === p.category ||
        c.id.toLowerCase() === (p.category || '').toLowerCase() ||
        c.name.toLowerCase() === (p.category || '').toLowerCase()
    );
    const catId = matchedCat?.id || p.category || availableCategories[0]?.id || 'drippers';
    setFormCategory(catId);

    // Resolve matched subcategory / branch
    const subId = p.subcategoryId || '';
    const matchedSub = matchedCat?.subcategories?.find(
      (s) =>
        s.id === subId ||
        s.id.toLowerCase() === subId.toLowerCase() ||
        s.name.toLowerCase() === (p.subcategory || '').toLowerCase()
    );
    setFormSubcategoryId(matchedSub?.id || subId);
    setFormSubcategoryName(matchedSub?.name || p.subcategory || '');
    setFormPrice(p.price || 0);
    setFormOriginalPrice(p.originalPrice || '');
    setFormStockCount(p.stockCount !== undefined ? p.stockCount : 10);
    setFormInStock(p.inStock);
    setFormBadge(p.badge || '');
    setFormIconType(p.iconType || 'dripperset');
    setFormDescription(p.description || '');
    setFormSku(p.sku || '');
    setFormImageUrl(p.imageUrl || '');
    setFormInstagramUrl(p.instagramUrl || p.videoUrl || '');
    setFormFeatures(p.features && p.features.length > 0 ? p.features : ['']);
    setFormBrewTips(p.brewGuideTips && p.brewGuideTips.length > 0 ? p.brewGuideTips : ['']);
    setFormIsPublished(p.isPublished !== false);
    setSubmitError(null);
    setUploadProgress(null);
    setIsFormOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(20);
      const url = await uploadProductImage(file, (progress) => {
        setUploadProgress(progress);
      });
      setFormImageUrl(url);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 800);
    } catch (err: any) {
      setSubmitError('خطأ أثناء رفع ومعالجة الصورة: ' + (err.message || 'يرجى المحاولة مجدداً'));
      setUploadProgress(null);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setSubmitError('يرجى إدخال اسم المنتج.');
      return;
    }
    if (!formPrice || Number(formPrice) <= 0) {
      setSubmitError('يرجى إدخال سعر صالح للمنتج.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const cleanFeatures = formFeatures.map((f) => f.trim()).filter(Boolean);
      const cleanBrewTips = formBrewTips.map((b) => b.trim()).filter(Boolean);

      const productData: Partial<Product> = {
        id: editingProduct?.id,
        name: formName.trim(),
        nameEn: formNameEn.trim(),
        brand: formBrand.trim(),
        category: formCategory,
        subcategoryId: formSubcategoryId.trim() || undefined,
        subcategory: formSubcategoryName.trim() || undefined,
        price: Number(formPrice),
        originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
        stockCount: Number(formStockCount) || 0,
        inStock: Number(formStockCount) > 0 && formInStock,
        badge: formBadge ? formBadge : undefined,
        iconType: formIconType,
        description: formDescription.trim(),
        sku: formSku.trim(),
        imageUrl: formImageUrl.trim(),
        instagramUrl: formInstagramUrl.trim(),
        videoUrl: formInstagramUrl.trim(),
        gallery: formImageUrl.trim() ? [formImageUrl.trim()] : [],
        features: cleanFeatures,
        brewGuideTips: cleanBrewTips,
        isPublished: formIsPublished,
      };

      await saveProduct(productData);
      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      setSubmitError('فشل حفظ المنتج في قاعدة البيانات: ' + (err.message || 'حاول مرة أخرى'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductFromDb(productId);
      setIsDeleting(null);
      onRefresh();
    } catch (err: any) {
      alert('حدث خطأ أثناء حذف المنتج: ' + err.message);
    }
  };

  const handleTogglePublish = async (p: Product) => {
    try {
      await toggleProductPublishStatus(p.id, p.isPublished !== false);
      onRefresh();
    } catch (err: any) {
      alert('فشل تحديث حالة النشر: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#12302a] font-['Cairo']">
            إدارة المنتجات والمخزون
          </h2>
          <p className="text-xs text-[#6b7680]">
            إجمالي {products.length} منتج مسجل في قاعدة بيانات المتجر السحابية
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#12302a] hover:bg-[#1e4c42] text-[#e4e8bf] px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e6e8e4] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-[#6b7680]" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الماركة، أو الرمز (SKU)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] font-bold text-[#12302a]"
            >
              <option value="all" className="text-[#12302a] bg-white font-bold">جميع الأقسام والتصنيفات ({products.length})</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id} className="text-[#12302a] bg-white font-bold">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full p-2 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] font-bold text-[#12302a]"
            >
              <option value="all" className="text-[#12302a] bg-white font-bold">جميع الماركات والشركات</option>
              {availableBrands.map((b) => (
                <option key={b} value={b} className="text-[#12302a] bg-white font-bold">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full p-2 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] font-bold text-[#12302a]"
            >
              <option value="all">كل حالات المخزون</option>
              <option value="instock">المتوفر في المخزن فقط</option>
              <option value="outofstock">المنتجات المنتهية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#e6e8e4] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#fafaf8] border-b border-[#e6e8e4] text-[#6b7680]">
              <tr>
                <th className="py-3.5 px-4 font-bold">المنتج</th>
                <th className="py-3.5 px-4 font-bold">التصنيف والماركة</th>
                <th className="py-3.5 px-4 font-bold">السعر</th>
                <th className="py-3.5 px-4 font-bold">المخزون</th>
                <th className="py-3.5 px-4 font-bold">حالة النشر</th>
                <th className="py-3.5 px-4 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2ef]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#6b7680]">
                    <Package className="w-10 h-10 mx-auto text-[#d8dea6] mb-2" />
                    <p className="font-bold">لم يتم العثور على منتجات مطابقة للبحث.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isPublished = p.isPublished !== false;
                  return (
                    <tr key={p.id} className="hover:bg-[#fafaf8]/80 transition-colors">
                      {/* Product details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#eef5f1] border border-[#e6e8e4] flex items-center justify-center shrink-0 overflow-hidden">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-8 h-8 text-[#12302a]">
                                <CoffeeProductIcon type={p.iconType} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="font-bold text-[#12302a] block truncate max-w-xs sm:max-w-md">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#6b7680] flex-wrap">
                              <span className="font-mono">SKU: {p.sku}</span>
                              {p.badge && (
                                <span className="px-1.5 py-0.2 bg-[#eef5f1] text-[#12302a] font-bold rounded-sm">
                                  {p.badge}
                                </span>
                              )}
                              {(p.instagramUrl || p.videoUrl) && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 font-bold rounded-sm border border-pink-200" title="يحتوي على فيديو إنستغرام">
                                  <Instagram className="w-2.5 h-2.5 text-pink-600" />
                                  <span>فيديو إنستغرام</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#12302a]">
                          {categories.find((c) => c.id === p.category)?.name || p.category}
                        </div>
                        {p.subcategory && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold bg-[#eef5f1] text-[#1e4c42] px-2 py-0.5 rounded-md border border-[#e6e8e4]">
                            {p.subcategory}
                          </span>
                        )}
                        <div className="text-[11px] text-[#6b7680] mt-0.5">{p.brand}</div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-extrabold text-[#12302a]">
                          {new Intl.NumberFormat('ar-IQ').format(p.price)} {currency}
                        </div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[10px] text-[#95a5a6] line-through">
                            {new Intl.NumberFormat('ar-IQ').format(p.originalPrice)} {currency}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        {p.inStock && (p.stockCount === undefined || p.stockCount > 0) ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#27ae60] bg-[#e8f5e9] px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60]"></span>
                            <span>متوفر ({p.stockCount ?? 'مفتوح'})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e74c3c] bg-[#ffebee] px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e74c3c]"></span>
                            <span>نفد من المخزن</span>
                          </span>
                        )}
                      </td>

                      {/* Publish Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            isPublished
                              ? 'bg-[#12302a] text-[#e4e8bf]'
                              : 'bg-[#f0f2ef] text-[#8a9188]'
                          }`}
                          title={isPublished ? 'معروض للزبائن' : 'مخفي عن المتجر'}
                        >
                          {isPublished ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>منشور</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>مسودة</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 rounded-lg bg-[#fafaf8] hover:bg-[#eef5f1] text-[#12302a] border border-[#e6e8e4] transition-colors cursor-pointer"
                            title="تعديل المنتج"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setIsDeleting(p.id)}
                            className="p-2 rounded-lg bg-[#ffebee] hover:bg-[#ffcdd2] text-[#c62828] transition-colors cursor-pointer"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-center shadow-xl animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-[#ffebee] text-[#c62828] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#12302a]">تأكيد حذف المنتج</h3>
            <p className="text-xs text-[#6b7680] leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من قاعدة البيانات السحابية؟ لن يظهر مجدداً في المتجر.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsDeleting(null)}
                className="py-2.5 px-4 rounded-xl border border-[#e6e8e4] text-xs font-bold text-[#6b7680] hover:bg-[#fafaf8]"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDeleteProduct(isDeleting)}
                className="py-2.5 px-4 rounded-xl bg-[#c62828] hover:bg-[#b71c1c] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e6e8e4] flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1e4c42]" />
                <h3 className="text-base font-black text-[#12302a] font-['Cairo']">
                  {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#fafaf8] text-[#6b7680] hover:text-[#12302a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-6">
              
              {submitError && (
                <div className="p-3.5 rounded-xl bg-[#ffebee] border border-[#ffcdd2] text-[#c62828] text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12302a]">
                    اسم المنتج (بالعربية) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: قمع هاريو V60 سيراميك 02"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12302a]">
                    الاسم بالإنجليزية (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: Hario V60 Ceramic Dripper"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] dir-ltr text-right"
                  />
                </div>
              </div>

              {/* Category & Subcategory & Brand & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12302a]">القسم الرئيسي <span className="text-red-500">*</span></label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      setFormCategory(newCatId);
                      setFormSubcategoryId('');
                      setFormSubcategoryName('');
                    }}
                    className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-white focus:outline-hidden focus:border-[#12302a] font-bold text-[#12302a]"
                  >
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.id} className="text-[#12302a] bg-white font-bold py-1">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12302a]">الفرع / القسم الفرعي</label>
                  <select
                    value={formSubcategoryId}
                    onChange={(e) => {
                      const subId = e.target.value;
                      setFormSubcategoryId(subId);
                      const sub = currentCategorySubcategories.find((s) => s.id === subId);
                      setFormSubcategoryName(sub ? sub.name : '');
                    }}
                    className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-white focus:outline-hidden focus:border-[#12302a] font-bold text-[#12302a]"
                  >
                    <option value="">بدون فرع (عام في القسم)</option>
                    {currentCategorySubcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#12302a]">الماركة / الشركة</label>
                    <span className="text-[10px] text-[#6b7680]">اختر أو اكتب جديد</span>
                  </div>
                  <input
                    type="text"
                    list="coffee-brands-datalist"
                    placeholder="اختر أو اكتب اسم الماركة..."
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-white focus:outline-hidden focus:border-[#12302a] font-bold"
                  />
                  <datalist id="coffee-brands-datalist">
                    {availableBrands.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>

                  {/* Quick Brand selection chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {['Hario', 'Timemore', 'Fellow', 'Comandante', '1Zpresso', 'Kalita', 'نغمة فنجان'].map((quickBrand) => (
                      <button
                        key={quickBrand}
                        type="button"
                        onClick={() => setFormBrand(quickBrand)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-medium shrink-0 transition-all cursor-pointer ${
                          formBrand.toLowerCase() === quickBrand.toLowerCase()
                            ? 'bg-[#12302a] text-[#e4e8bf] border-[#12302a]'
                            : 'bg-white text-[#6b7680] border-[#e6e8e4] hover:border-[#12302a] hover:text-[#12302a]'
                        }`}
                      >
                        {quickBrand}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12302a]">رمز المنتج (SKU)</label>
                  <input
                    type="text"
                    placeholder="NF-102"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] font-mono"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12302a]">
                    سعر البيع ({currency}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="35000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12302a]">
                    السعر قبل الخصم ({currency}) (اختياري)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="42000"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12302a]">الكمية المتوفرة بالمخزن</label>
                  <input
                    type="number"
                    min="0"
                    value={formStockCount}
                    onChange={(e) => setFormStockCount(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Product Badge & Vector Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12302a]">شارة تمييز المنتج (Badge)</label>
                  <select
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] font-bold"
                  >
                    <option value="">بدون شارة</option>
                    <option value="الأكثر مبيعاً">الأكثر مبيعاً</option>
                    <option value="مميز">مميز</option>
                    <option value="جديد">جديد</option>
                    <option value="عرض خاص">عرض خاص</option>
                    <option value="الأعلى تقييماً">الأعلى تقييماً</option>
                  </select>
                </div>
              </div>

              {/* Advanced Visual Icon Selector */}
              <div className="pt-1">
                <IconSelector
                  value={formIconType}
                  onChange={(newIcon) => setFormIconType(newIcon)}
                  label="أيقونة الأداة الافتراضية (تظهر كرمز بديل ومعاينة للأداة)"
                />
              </div>

              {/* Image Upload / URL */}
              <div className="space-y-2 p-4 rounded-xl bg-[#fafaf8] border border-[#e6e8e4]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#12302a] block">صورة المنتج الأساسية</label>
                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('')}
                      className="text-[11px] text-red-600 hover:underline font-bold"
                    >
                      إزالة الصورة
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="w-20 h-20 rounded-xl bg-white border border-[#e6e8e4] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {formImageUrl ? (
                      <img src={formImageUrl} alt="معاينة" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#6b7680]" />
                    )}
                  </div>

                  {/* File Upload Trigger */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-[#12302a] hover:bg-[#1e4c42] text-[#e4e8bf] text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع صورة من جهازك</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>

                      {uploadProgress !== null && (
                        <div className="text-xs font-bold text-[#1e4c42] flex items-center gap-1.5 bg-[#eef5f1] px-2.5 py-1.5 rounded-lg border border-[#c2dcd3]">
                          {uploadProgress < 100 ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1e4c42]" />
                              <span>جاري المعالجة والرفع {uploadProgress}%...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">تم رفع ومعالجة الصورة بنجاح!</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <input
                      type="url"
                      placeholder="أو أدخل رابط صورة مباشر (URL)"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full p-2 text-xs border border-[#e6e8e4] rounded-lg bg-white focus:outline-hidden dir-ltr text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Instagram Video / Reel Link */}
              <div className="space-y-2 p-4 rounded-xl bg-[#fafaf8] border border-[#e6e8e4]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#12302a] block">
                      رابط فيديو المنتج من إنستغرام (Instagram Reel / Video)
                    </label>
                    <p className="text-[11px] text-[#6b7680]">
                      يمكنك وضع رابط مقطع ريلز أو فيديو من حساب إنستغرام ليظهر زر ومقطع الفيديو للزبائن في تفاصيل المنتج
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Video className="w-4 h-4 absolute right-3 top-3 text-[#6b7680]" />
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/reel/... أو https://www.instagram.com/p/..."
                    value={formInstagramUrl}
                    onChange={(e) => setFormInstagramUrl(e.target.value)}
                    className="w-full pl-3 pr-9 py-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-white focus:outline-hidden focus:border-[#12302a] dir-ltr text-right font-mono"
                  />
                </div>
                {formInstagramUrl && (
                  <div className="flex items-center gap-2 text-[11px] text-[#1e4c42] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم ربط فيديو الإنستغرام بنجاح</span>
                    <a
                      href={formInstagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6b7680] hover:text-[#12302a] inline-flex items-center gap-0.5 mr-auto"
                    >
                      <span>معاينة الرابط</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#12302a]">وصف تفصيلي للأداة والمنتج</label>
                <textarea
                  rows={3}
                  placeholder="اكتب وصفاً جذاباً يشرح مزايا واستخدامات الأداة..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a] leading-relaxed"
                />
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#12302a]">المميزات والنقاط البارزة</label>
                  <button
                    type="button"
                    onClick={() => setFormFeatures([...formFeatures, ''])}
                    className="text-[11px] text-[#1e4c42] font-bold hover:underline"
                  >
                    + إضافة ميزة
                  </button>
                </div>
                {formFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`ميزة ${idx + 1}...`}
                      value={feat}
                      onChange={(e) => {
                        const next = [...formFeatures];
                        next[idx] = e.target.value;
                        setFormFeatures(next);
                      }}
                      className="flex-1 p-2 text-xs border border-[#e6e8e4] rounded-lg bg-[#fafaf8] focus:bg-white focus:outline-hidden"
                    />
                    {formFeatures.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormFeatures(formFeatures.filter((_, i) => i !== idx))}
                        className="p-2 text-[#c62828] hover:bg-[#ffebee] rounded-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Status Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[#e6e8e4]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12302a]">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="w-4 h-4 accent-[#12302a] rounded"
                  />
                  <span>نشر المنتج فوراً في المتجر للزبائن</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12302a]">
                  <input
                    type="checkbox"
                    checked={formInStock}
                    onChange={(e) => setFormInStock(e.target.checked)}
                    className="w-4 h-4 accent-[#12302a] rounded"
                  />
                  <span>تفعيل حالة التوفر بالمخزن</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e6e8e4]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-[#e6e8e4] text-xs font-bold text-[#6b7680] hover:bg-[#fafaf8]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-[#12302a] hover:bg-[#1e4c42] text-[#e4e8bf] text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>جاري الحفظ في السحابة...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
