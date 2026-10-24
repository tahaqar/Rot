import React, { useState } from 'react';
import { Sparkles, Image, Smile, Search, Check, Upload, Coffee } from 'lucide-react';
import { AVAILABLE_COFFEE_ICONS, CoffeeProductIcon } from '../CoffeeIcons';
import { uploadProductImage } from '../../services/storageService';

interface IconSelectorProps {
  value: string;
  onChange: (iconKey: string) => void;
  label?: string;
}

const POPULAR_EMOJIS = [
  '☕', '🫖', '⚖️', '📦', '🎁', '✨', '🫘', '🧊', '🔥', 
  '🏺', '⏳', '🔌', '🏆', '🏷️', '🛒', '🤍', '🌟', '💧', 
  '⚡', '🍂', '🥛', '🥤', '🤎', '⭐', '🥇', '💫'
];

export const IconSelector: React.FC<IconSelectorProps> = ({
  value,
  onChange,
  label = 'أيقونة الأداة / القسم',
}) => {
  const [activeTab, setActiveTab] = useState<'coffee' | 'emoji' | 'custom' | 'upload'>('coffee');
  const [search, setSearch] = useState('');
  const [customInput, setCustomInput] = useState(
    value.startsWith('http') || value.startsWith('data:') ? '' : value
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const filteredCoffeeIcons = AVAILABLE_COFFEE_ICONS.filter(
    (item) =>
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      const url = await uploadProductImage(file);
      onChange(url);
    } catch (err: any) {
      setUploadError(err.message || 'فشل رفع الأيقونة');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#12302a]">{label}</label>
        <span className="text-[11px] text-[#6b7680] font-mono">
          الحالية: {value.length > 20 ? 'صورة مخصصة' : value}
        </span>
      </div>

      {/* Selected Icon Preview Box */}
      <div className="p-3 bg-[#fafaf8] border border-[#e6e8e4] rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#e6e8e4] flex items-center justify-center text-[#12302a] shadow-2xs">
            <CoffeeProductIcon type={value} className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#12302a]">
              {AVAILABLE_COFFEE_ICONS.find((i) => i.id === value)?.name ||
                (POPULAR_EMOJIS.includes(value) ? `إيموجي (${value})` : 'أيقونة مخصصة')}
            </div>
            <div className="text-[10px] text-[#6b7680] font-mono mt-0.5">
              الكود: {value.startsWith('http') ? 'رابط صورة خارجي' : value}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#e6e8e4]">
          <button
            type="button"
            onClick={() => setActiveTab('coffee')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'coffee'
                ? 'bg-[#12302a] text-[#e4e8bf]'
                : 'text-[#6b7680] hover:text-[#12302a]'
            }`}
          >
            أدوات القهوة ({AVAILABLE_COFFEE_ICONS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emoji')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'emoji'
                ? 'bg-[#12302a] text-[#e4e8bf]'
                : 'text-[#6b7680] hover:text-[#12302a]'
            }`}
          >
            رموز تعبيرية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-[#12302a] text-[#e4e8bf]'
                : 'text-[#6b7680] hover:text-[#12302a]'
            }`}
          >
            رابط / نص
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#12302a] text-[#e4e8bf]'
                : 'text-[#6b7680] hover:text-[#12302a]'
            }`}
          >
            رفع صورة
          </button>
        </div>
      </div>

      {/* Tab 1: Coffee & Gear SVG Icons */}
      {activeTab === 'coffee' && (
        <div className="space-y-2 bg-white p-3 rounded-2xl border border-[#e6e8e4]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#6b7680]" />
            <input
              type="text"
              placeholder="ابحث في أيقونات أدوات القهوة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-8 pl-3 py-1.5 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a]"
            />
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
            {filteredCoffeeIcons.map((icon) => {
              const isSelected = value === icon.id;
              return (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => onChange(icon.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'border-[#12302a] bg-[#12302a] text-[#e4e8bf] shadow-sm'
                      : 'border-[#e6e8e4] bg-[#fafaf8] text-[#12302a] hover:bg-[#eef5f1] hover:border-[#12302a]'
                  }`}
                  title={icon.name}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <CoffeeProductIcon type={icon.id} className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold truncate w-full leading-tight">
                    {icon.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Emoji Icons */}
      {activeTab === 'emoji' && (
        <div className="bg-white p-3 rounded-2xl border border-[#e6e8e4] space-y-2">
          <p className="text-[11px] text-[#6b7680]">اختر رمزاً تعبيرياً سريعاً للقسم أو الأداة:</p>
          <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5">
            {POPULAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onChange(emoji)}
                className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  value === emoji
                    ? 'bg-[#12302a] text-white ring-2 ring-[#12302a] scale-110'
                    : 'bg-[#fafaf8] border border-[#e6e8e4] hover:bg-[#eef5f1]'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Custom Text / URL */}
      {activeTab === 'custom' && (
        <div className="bg-white p-3 rounded-2xl border border-[#e6e8e4] space-y-3">
          <p className="text-[11px] text-[#6b7680]">
            يمكنك كتابة أي إيموجي خاص، أو لصق رابط صورة PNG/SVG مباشرة:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="مثال: ☕ أو https://example.com/icon.svg"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 p-2 text-xs border border-[#e6e8e4] rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-hidden focus:border-[#12302a]"
            />
            <button
              type="button"
              onClick={() => {
                if (customInput.trim()) {
                  onChange(customInput.trim());
                }
              }}
              className="px-4 py-2 bg-[#12302a] text-[#e4e8bf] text-xs font-bold rounded-xl hover:bg-[#173d35] cursor-pointer"
            >
              تطبيق
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Image Upload */}
      {activeTab === 'upload' && (
        <div className="bg-white p-4 rounded-2xl border border-[#e6e8e4] space-y-3 text-center">
          <p className="text-[11px] text-[#6b7680]">
            قم برفع صورة أو أيقونة من جهازك (PNG شفاف أو SVG أو JPG):
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#eef5f1] border border-[#d8dea6] text-[#12302a] text-xs font-bold rounded-xl cursor-pointer hover:bg-[#e4e8bf]/50 transition-colors">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'جاري الرفع والمعالجة...' : 'اختر ملف الأيقونة'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
          {uploadError && (
            <p className="text-[11px] text-red-600 font-bold">{uploadError}</p>
          )}
        </div>
      )}
    </div>
  );
};
