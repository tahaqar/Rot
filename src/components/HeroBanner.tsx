import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  imageUrl: string;
  watermarkText?: string;
  categoryId?: string;
  brandName?: string;
}

interface HeroBannerProps {
  onSelectAction: (target?: { categoryId?: string; brandName?: string }) => void;
}

const SLIDES: BannerSlide[] = [
  {
    id: 'specialty-coffee',
    title: 'تشكيلة قهوة جديدة وصلت!',
    subtitle: 'استكشف الآن مجموعة واسعة من القهوة المختصة.',
    ctaText: 'استكشف الآن',
    // Warm, golden sunlight through specialty coffee beans / morning field matching Screenshot 3
    imageUrl: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?q=80&w=600&auto=format&fit=crop',
    watermarkText: 'COFFEE',
    categoryId: 'drippers',
  },
  {
    id: 'v60-kit',
    title: 'مجموعات التقطير V60 الاحترافية',
    subtitle: 'كل ما تحتاجه لكوب قهوة نقي ومثالي بأعلى معايير الاستخلاص.',
    ctaText: 'عرض المجموعات',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    watermarkText: 'BREW',
    categoryId: 'drippers',
  },
  {
    id: 'precision-grinders',
    title: 'طواحين احترافية بتروس فولاذية',
    subtitle: 'دقة طحن ميكرومترية متجانسة لاستخلاص نظيف ونكهات غنية.',
    ctaText: 'تصفح الطواحين',
    imageUrl: 'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?q=80&w=600&auto=format&fit=crop',
    watermarkText: 'GRIND',
    categoryId: 'grinders',
  },
  {
    id: 'smart-scales',
    title: 'موازين استخلاص ذكية بدقة 0.1 غرام',
    subtitle: 'مؤقت تلقائي لقياس معدل التدفق بالثانية وشحن Type-C سريع.',
    ctaText: 'عرض الموازين',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
    watermarkText: 'SCALE',
    categoryId: 'scales',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectAction }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Auto rotate banner every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    // RTL swipe: positive diff (swiping left) -> next; negative diff -> prev
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  const currentSlide = SLIDES[currentIndex];

  const handleTriggerAction = () => {
    onSelectAction({
      categoryId: currentSlide.categoryId,
      brandName: currentSlide.brandName,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-4 sm:my-6">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleTriggerAction}
        className="relative overflow-hidden rounded-[24px] bg-[#f5f6f8] border border-[#e5e7eb] p-5 sm:p-7 md:p-8 transition-all duration-300 shadow-xs hover:shadow-sm cursor-pointer select-none group"
      >
        {/* Subtle Watermark in background behind the circle image (like Screenshot 3) */}
        <div 
          aria-hidden="true" 
          className="absolute left-6 sm:left-14 top-1/2 -translate-y-1/2 pointer-events-none select-none text-[52px] sm:text-[76px] font-black text-slate-300/40 tracking-wider uppercase font-sans z-0"
        >
          {currentSlide.watermarkText || 'COFFEE'}
        </div>

        {/* Banner Horizontal Layout (RTL): Text on right, circular image with arrow on left */}
        <div className="relative z-10 flex flex-row items-center justify-between gap-4 sm:gap-6">
          
          {/* Right side (in RTL): Headline & Description */}
          <div className="flex-1 text-right pl-2">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black font-['Cairo'] text-[#111827] leading-snug tracking-tight">
              {currentSlide.title}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#4b5563] font-medium leading-relaxed mt-1 sm:mt-1.5 max-w-md">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Left side (in RTL): Circular image frame with overlapping arrow button */}
          <div className="relative shrink-0 flex items-center">
            
            {/* Circular Image Container (clean, modern coffee visual) */}
            <div className="w-[100px] h-[100px] sm:w-[124px] sm:h-[124px] md:w-[136px] md:h-[136px] rounded-full border-3 border-white shadow-md overflow-hidden bg-amber-50 shrink-0 relative transition-transform duration-300 group-hover:scale-102">
              {currentSlide.imageUrl ? (
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#eef5f1] flex items-center justify-center text-[#12302a]">
                  <Sparkles className="w-8 h-8" />
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Subtle slide pagination dots at the bottom */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 pt-3 sm:pt-4">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`انتقل إلى الشريحة ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-[#12302a]'
                  : 'w-1.5 bg-[#12302a]/20 hover:bg-[#12302a]/40'
              }`}
            />
          ))}
        </div>

        {/* Desktop Previous / Next Subtle Controls */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="العرض السابق"
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-xs items-center justify-center border border-slate-200 transition-all cursor-pointer active:scale-90 z-20"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="العرض التالي"
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-xs items-center justify-center border border-slate-200 transition-all cursor-pointer active:scale-90 z-20"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
