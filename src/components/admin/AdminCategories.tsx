import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Tag,
  GitBranch,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Category, Product, Subcategory } from '../../types';
import { saveCategory, deleteCategoryFromDb } from '../../services/dbService';
import { CoffeeProductIcon } from '../CoffeeIcons';
import { IconSelector } from './IconSelector';
import { CATEGORIES as INITIAL_CATEGORIES } from '../../data/categories';

interface AdminCategoriesProps {
  categories: Category[];
  products: Product[];
  onRefresh: () => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  products,
  onRefresh,
}) => {
  // Merge initial default categories with any Firestore categories
  const allCategories = useMemo(() => {
    const map = new Map<string, Category>();
    INITIAL_CATEGORIES.forEach((c) => {
      if (c.id !== 'all') {
        map.set(c.id, c);
      }
    });
    if (categories && categories.length > 0) {
      categories.forEach((c) => {
        if (c.id !== 'all') {
          const existing = map.get(c.id);
          const mergedSubs =
            c.subcategories && c.subcategories.length > 0
              ? c.subcategories
              : existing?.subcategories || [];
          map.set(c.id, {
            ...existing,
            ...c,
            subcategories: mergedSubs,
          });
        }
      });
    }
    return Array.from(map.values());
  }, [categories]);

  // Modal and deletion state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [iconType, setIconType] = useState('dripperset');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [newBranchInput, setNewBranchInput] = useState('');

  // Editing a branch inside the modal
  const [editingModalBranchId, setEditingModalBranchId] = useState<string | null>(null);
  const [editingModalBranchName, setEditingModalBranchName] = useState('');

  // Quick inline branch add on category cards
  const [inlineAddingCatId, setInlineAddingCatId] = useState<string | null>(null);
  const [inlineBranchName, setInlineBranchName] = useState('');
  const [isQuickSaving, setIsQuickSaving] = useState(false);

  // Quick inline branch EDIT on category cards
  const [editingCardBranch, setEditingCardBranch] = useState<{
    catId: string;
    branchId: string;
    name: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Helper: Count products in a specific subcategory/branch
  const getBranchProductCount = (catId: string, catName: string, sub: Subcategory) => {
    return products.filter((p) => {
      const matchCat =
        p.category === catId ||
        p.category?.toLowerCase() === catId.toLowerCase() ||
        p.category === catName ||
        p.category?.toLowerCase() === catName.toLowerCase();
      if (!matchCat) return false;

      const subId = (p.subcategoryId || '').trim().toLowerCase();
      const subName = (p.subcategory || '').trim().toLowerCase();
      return (
        subId === sub.id.trim().toLowerCase() ||
        subName === sub.name.trim().toLowerCase()
      );
    }).length;
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setIconType('dripperset');
    setIsFeatured(true);
    setIsActive(true);
    setSubcategories([]);
    setNewBranchInput('');
    setEditingModalBranchId(null);
    setEditingModalBranchName('');
    setError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIconType(cat.iconType || 'dripperset');
    setIsFeatured(cat.featured !== false);
    setIsActive(cat.active !== false);
    setSubcategories(cat.subcategories || []);
    setNewBranchInput('');
    setEditingModalBranchId(null);
    setEditingModalBranchName('');
    setError(null);
    setIsFormOpen(true);
  };

  // Branch operations inside Modal
  const handleAddBranchInModal = () => {
    if (!newBranchInput.trim()) return;
    const branchName = newBranchInput.trim();
    const branchId =
      branchName.toLowerCase().replace(/[^\w\u0600-\u06FF]+/g, '-') +
      '-' +
      Date.now().toString().slice(-4);

    setSubcategories([
      ...subcategories,
      {
        id: branchId,
        name: branchName,
        categoryId: editingCategory?.id || '',
      },
    ]);
    setNewBranchInput('');
  };

  const handleStartEditBranchInModal = (subcat: Subcategory) => {
    setEditingModalBranchId(subcat.id);
    setEditingModalBranchName(subcat.name);
  };

  const handleSaveEditBranchInModal = (branchId: string) => {
    if (!editingModalBranchName.trim()) return;
    setSubcategories((prev) =>
      prev.map((s) =>
        s.id === branchId ? { ...s, name: editingModalBranchName.trim() } : s
      )
    );
    setEditingModalBranchId(null);
    setEditingModalBranchName('');
  };

  const handleRemoveBranchInModal = (branchId: string) => {
    setSubcategories(subcategories.filter((s) => s.id !== branchId));
  };

  // Quick inline add branch directly from card
  const handleQuickAddBranch = async (cat: Category) => {
    if (!inlineBranchName.trim()) return;
    setIsQuickSaving(true);
    try {
      const branchName = inlineBranchName.trim();
      const branchId =
        branchName.toLowerCase().replace(/[^\w\u0600-\u06FF]+/g, '-') +
        '-' +
        Date.now().toString().slice(-4);

      const existingBranches = cat.subcategories || [];
      const updatedBranches: Subcategory[] = [
        ...existingBranches,
        {
          id: branchId,
          name: branchName,
          categoryId: cat.id,
        },
      ];

      await saveCategory({
        ...cat,
        subcategories: updatedBranches,
      });

      setInlineBranchName('');
      setInlineAddingCatId(null);
      showNotification(`تمت إضافة فرع "${branchName}" إلى قسم "${cat.name}"`);
      onRefresh();
    } catch (err: any) {
      alert('فشل إضافة الفرع: ' + (err.message || 'حاول مجدداً'));
    } finally {
      setIsQuickSaving(false);
    }
  };

  // Quick inline edit branch name directly on card
  const handleSaveCardBranchEdit = async (cat: Category) => {
    if (!editingCardBranch || !editingCardBranch.name.trim()) return;
    setIsQuickSaving(true);
    try {
      const updatedBranches = (cat.subcategories || []).map((b) =>
        b.id === editingCardBranch.branchId
          ? { ...b, name: editingCardBranch.name.trim() }
          : b
      );

      await saveCategory({
        ...cat,
        subcategories: updatedBranches,
      });

      const updatedName = editingCardBranch.name.trim();
      setEditingCardBranch(null);
      showNotification(`تم تعديل اسم الفرع إلى "${updatedName}" بنجاح`);
      onRefresh();
    } catch (err: any) {
      alert('فشل تعديل الفرع: ' + (err.message || 'حاول مجدداً'));
    } finally {
      setIsQuickSaving(false);
    }
  };

  // Quick remove branch directly from card
  const handleQuickDeleteBranch = async (cat: Category, branchId: string, branchName: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف فرع "${branchName}" من قسم "${cat.name}"؟`)) return;
    try {
      const updatedBranches = (cat.subcategories || []).filter((b) => b.id !== branchId);
      await saveCategory({
        ...cat,
        subcategories: updatedBranches,
      });
      showNotification(`تم حذف فرع "${branchName}"`);
      onRefresh();
    } catch (err: any) {
      alert('فشل حذف الفرع: ' + (err.message || 'حاول مجدداً'));
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم القسم / التصنيف.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const catId =
        editingCategory?.id ||
        name
          .trim()
          .toLowerCase()
          .replace(/[^\w\u0600-\u06FF]+/g, '-');
      const count = products.filter(
        (p) =>
          p.category === catId ||
          p.category?.toLowerCase() === catId.toLowerCase() ||
          p.category === name.trim()
      ).length;

      const formattedSubcategories = subcategories.map((s) => ({
        ...s,
        categoryId: catId,
      }));

      await saveCategory({
        id: catId,
        name: name.trim(),
        iconType,
        subcategories: formattedSubcategories,
        featured: isFeatured,
        active: isActive,
        itemCount: count,
      });

      setIsFormOpen(false);
      showNotification(`تم حفظ القسم "${name.trim()}" والفروع بنجاح`);
      onRefresh();
    } catch (err: any) {
      setError('فشل حفظ التصنيف: ' + (err.message || 'حاول مجدداً'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (catId: string) => {
    try {
      await deleteCategoryFromDb(catId);
      setIsDeleting(null);
      showNotification('تم حذف القسم بنجاح');
      onRefresh();
    } catch (err: any) {
      alert('فشل حذف التصنيف: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-['Tajawal',sans-serif]">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#12302B] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border border-[#e4e8bf]/30 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#e4e8bf]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e6e8e4]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f4f7f5] text-[#12302B] flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-[#12302B]">
              إدارة الأقسام وفروعها (Subcategories)
            </h2>
          </div>
          <p className="text-xs text-[#4b5563] mt-1 leading-relaxed">
            يمكنك إضافة وتعديل وحذف فروع كل قسم (مثل: أقماع، فلاتر، سيرفرات...)، وستظهر فوراً للمستخدمين في المتجر عند اختيار القسم.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#12302B] hover:bg-[#1a4039] text-[#e4e8bf] px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer shrink-0 active:scale-95 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allCategories.map((cat) => {
          const prodsInCat = products.filter(
            (p) =>
              p.category === cat.id ||
              p.category?.toLowerCase() === cat.id.toLowerCase() ||
              p.category === cat.name ||
              p.category?.toLowerCase() === cat.name.toLowerCase()
          ).length;
          const branches = cat.subcategories || [];
          const isInlineOpen = inlineAddingCatId === cat.id;

          return (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-[#e6e8e4] shadow-2xs hover:border-[#12302B] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header of category card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#f4f7f5] border border-[#e6e8e4] flex items-center justify-center text-[#12302B]">
                      <CoffeeProductIcon type={cat.iconType} className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#12302B]">{cat.name}</h3>
                      <span className="text-[10px] text-[#4b5563] font-mono">ID: {cat.id}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-[#12302B] bg-[#fafaf8] px-2.5 py-1 rounded-full border border-[#e6e8e4]">
                    {prodsInCat} منتج
                  </span>
                </div>

                {/* Branches / Subcategories Section */}
                <div className="mt-4 pt-3 border-t border-[#f0f2ef]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-[#12302B] flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-[#12302B]" />
                      <span>فروع القسم ({branches.length}):</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (isInlineOpen) {
                          setInlineAddingCatId(null);
                        } else {
                          setInlineAddingCatId(cat.id);
                          setInlineBranchName('');
                        }
                      }}
                      className="text-[11px] text-[#12302B] font-bold hover:underline cursor-pointer flex items-center gap-1 bg-[#f4f7f5] px-2.5 py-1 rounded-lg border border-[#e6e8e4] min-h-[32px]"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isInlineOpen ? 'إلغاء' : '+ إضافة فرع'}</span>
                    </button>
                  </div>

                  {/* Inline Branch Input Form (Add new branch) */}
                  {isInlineOpen && (
                    <div className="mb-3 p-3 bg-[#f4f7f5] rounded-xl border border-[#dce8e0] animate-fadeIn space-y-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="اكتب اسم الفرع (مثال: أقماع، فلاتر، سيرفرات...)"
                          value={inlineBranchName}
                          onChange={(e) => setInlineBranchName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleQuickAddBranch(cat);
                            }
                          }}
                          className="flex-1 p-2 text-xs border border-[#c4d4c8] rounded-lg bg-white focus:outline-hidden focus:border-[#12302B] font-bold min-h-[38px]"
                          autoFocus
                        />
                        <button
                          type="button"
                          disabled={isQuickSaving || !inlineBranchName.trim()}
                          onClick={() => handleQuickAddBranch(cat)}
                          className="px-3 py-2 bg-[#12302B] text-[#e4e8bf] rounded-lg text-xs font-bold hover:bg-[#1a4039] transition-colors cursor-pointer shrink-0 disabled:opacity-50 min-h-[38px]"
                        >
                          {isQuickSaving ? '...' : '+ حفظ'}
                        </button>
                      </div>
                      <p className="text-[10px] text-[#4b5563]">
                        اضغط Enter أو حفظ لإضافة الفرع وتخزينه فوراً في قاعدة البيانات.
                      </p>
                    </div>
                  )}

                  {/* Branches List with In-Place Edit and Delete */}
                  {branches.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto no-scrollbar pt-1">
                      {branches.map((b) => {
                        const countInBranch = getBranchProductCount(cat.id, cat.name, b);
                        const isEditingThis =
                          editingCardBranch?.catId === cat.id &&
                          editingCardBranch?.branchId === b.id;

                        if (isEditingThis) {
                          return (
                            <div
                              key={b.id}
                              className="w-full flex items-center gap-1.5 p-1.5 bg-[#fefce8] border border-[#fef08a] rounded-lg animate-fadeIn"
                            >
                              <input
                                type="text"
                                value={editingCardBranch.name}
                                onChange={(e) =>
                                  setEditingCardBranch({
                                    ...editingCardBranch,
                                    name: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveCardBranchEdit(cat);
                                  } else if (e.key === 'Escape') {
                                    setEditingCardBranch(null);
                                  }
                                }}
                                className="flex-1 px-2 py-1 text-xs border border-[#eab308] rounded-md bg-white font-bold text-[#12302B] focus:outline-hidden"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveCardBranchEdit(cat)}
                                className="p-1.5 bg-[#12302B] text-white rounded-md text-xs font-bold hover:bg-[#1a4039] cursor-pointer"
                                title="حفظ الاسم الجديد"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCardBranch(null)}
                                className="p-1.5 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300 cursor-pointer"
                                title="إلغاء التعديل"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={b.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#fafaf8] text-[#12302B] text-xs font-bold border border-[#e6e8e4] group hover:border-[#12302B] transition-all shadow-2xs"
                          >
                            <span>{b.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#f4f7f5] text-[#12302B] font-mono border border-[#e6e8e4]">
                              {countInBranch}
                            </span>
                            
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setEditingCardBranch({
                                  catId: cat.id,
                                  branchId: b.id,
                                  name: b.name,
                                })
                              }
                              className="text-[#4b5563] hover:text-[#12302B] transition-colors cursor-pointer p-0.5 rounded-md hover:bg-gray-100"
                              title={`تعديل اسم فرع (${b.name})`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleQuickDeleteBranch(cat, b.id, b.name)}
                              className="text-[#9ca3af] hover:text-red-600 transition-colors cursor-pointer p-0.5 rounded-md hover:bg-red-50"
                              title={`حذف فرع (${b.name})`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-[#fafaf8] p-3 rounded-xl border border-dashed border-[#e6e8e4] text-center">
                      <p className="text-[11px] text-[#4b5563]">
                        لا توجد فروع مضافة لهذا القسم بعد. انقر على "+ إضافة فرع" لإنشاء فروع منظمة.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#f0f2ef] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      cat.active !== false ? 'bg-[#27ae60]' : 'bg-[#95a5a6]'
                    }`}
                  ></span>
                  <span className="text-[11px] font-bold text-[#4b5563]">
                    {cat.active !== false ? 'نشط في المتجر' : 'معطل مؤقتاً'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="px-3 py-1.5 rounded-xl text-[#12302B] hover:bg-[#f4f7f5] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold border border-[#e6e8e4] min-h-[36px]"
                    title="تعديل القسم والأيقونة والفروع"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => setIsDeleting(cat.id)}
                    className="p-2 rounded-xl text-[#c62828] hover:bg-[#ffebee] transition-colors cursor-pointer border border-transparent hover:border-[#ffcdd2] min-h-[36px]"
                    title="حذف القسم"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-center shadow-xl animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-[#ffebee] text-[#c62828] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#12302B]">تأكيد حذف القسم</h3>
            <p className="text-xs text-[#4b5563] leading-relaxed">
              هل أنت متأكد من حذف هذا القسم من المتجر؟ المنتجات المرتبطة به ستبقى آمنة في قاعدة البيانات.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsDeleting(null)}
                className="py-2.5 px-4 rounded-xl border border-[#e6e8e4] text-xs font-bold text-[#4b5563] hover:bg-[#fafaf8]"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(isDeleting)}
                className="py-2.5 px-4 rounded-xl bg-[#c62828] hover:bg-[#b71c1c] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal with Full Branches Management */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e8e4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#f4f7f5] text-[#12302B] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-[#12302B]">
                  {editingCategory ? 'تعديل بيانات وفروع وأيقونة القسم' : 'إضافة قسم جديد مع الفروع'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-[#4b5563] hover:text-[#12302B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-[#ffebee] text-[#c62828] text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#12302B]">
                  اسم القسم الرئيسي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أدوات التقطير أو مكائن الإسبريسو"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-white focus:outline-hidden focus:border-[#12302B] font-bold min-h-[44px]"
                />
              </div>

              {/* Icon Selector */}
              <IconSelector
                value={iconType}
                onChange={(newIcon) => setIconType(newIcon)}
                label="أيقونة القسم (اختر أداة، إيموجي، أو ارفع صورة)"
              />

              {/* Branches / Subcategories Section */}
              <div className="space-y-3 p-4 bg-[#fafaf8] border border-[#e6e8e4] rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#12302B] flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4 text-[#12302B]" />
                    <span>فروع وتصنيفات هذا القسم (Subcategories):</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#12302B] bg-[#f4f7f5] px-2 py-0.5 rounded-full border border-[#e6e8e4]">
                    {subcategories.length} فرع
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBranchInput}
                    onChange={(e) => setNewBranchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBranchInModal();
                      }
                    }}
                    placeholder="اكتب اسم الفرع (مثال: أقماع V60، فلاتر، سيرفرات...)"
                    className="flex-1 p-2.5 text-xs border border-[#e6e8e4] rounded-xl bg-white focus:outline-hidden focus:border-[#12302B] font-bold min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddBranchInModal}
                    className="px-4 py-2.5 bg-[#12302B] text-[#e4e8bf] rounded-xl text-xs font-bold hover:bg-[#1a4039] transition-colors cursor-pointer shrink-0 min-h-[44px]"
                  >
                    + إضافة الفرع
                  </button>
                </div>

                {/* List of current subcategories with edit & remove */}
                {subcategories.length > 0 ? (
                  <div className="space-y-2 pt-1 max-h-52 overflow-y-auto no-scrollbar">
                    {subcategories.map((subcat, idx) => {
                      const isEditingThis = editingModalBranchId === subcat.id;

                      if (isEditingThis) {
                        return (
                          <div
                            key={subcat.id}
                            className="flex items-center gap-2 p-2 rounded-xl bg-[#fefce8] border border-[#fef08a]"
                          >
                            <input
                              type="text"
                              value={editingModalBranchName}
                              onChange={(e) => setEditingModalBranchName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEditBranchInModal(subcat.id);
                                } else if (e.key === 'Escape') {
                                  setEditingModalBranchId(null);
                                }
                              }}
                              className="flex-1 px-3 py-1.5 text-xs border border-[#eab308] rounded-lg bg-white font-bold text-[#12302B] focus:outline-hidden"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditBranchInModal(subcat.id)}
                              className="px-3 py-1.5 bg-[#12302B] text-white rounded-lg text-xs font-bold hover:bg-[#1a4039] cursor-pointer"
                            >
                              حفظ
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingModalBranchId(null)}
                              className="px-2 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300 cursor-pointer"
                            >
                              إلغاء
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={subcat.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#e6e8e4] shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#f4f7f5] text-[#12302B] text-[11px] font-mono flex items-center justify-center font-bold border border-[#e6e8e4]">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-[#12302B]">
                              {subcat.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditBranchInModal(subcat)}
                              className="p-1.5 rounded-lg hover:bg-[#f4f7f5] text-[#4b5563] hover:text-[#12302B] cursor-pointer"
                              title="تعديل اسم هذا الفرع"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveBranchInModal(subcat.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-[#9ca3af] hover:text-red-600 cursor-pointer"
                              title="حذف هذا الفرع"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#4b5563] pt-1 leading-relaxed">
                    لا توجد فروع مضافة لهذا القسم بعد. يمكنك إضافة فروع تنظيمية مثل: أقماع، فلاتر ورقية، أواني تقديم، مكابس، إلخ.
                  </p>
                )}
              </div>

              {/* Status toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12302B]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#12302B] rounded"
                  />
                  <span>قسم نشط ومتاح في المتجر</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#12302B]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#12302B] rounded"
                  />
                  <span>إظهار في بطاقات الصفحة الرئيسية</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#e6e8e4]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-[#e6e8e4] text-xs font-bold text-[#4b5563] hover:bg-[#fafaf8] min-h-[44px]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-[#12302B] hover:bg-[#1a4039] text-[#e4e8bf] text-xs font-extrabold shadow-sm cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ القسم والفروع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
