import React from 'react';
import { Check, X, ArrowLeft } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  onActionClick?: () => void;
  actionText?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  onActionClick,
  actionText = 'عرض السلة وإتمام الطلب',
}) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#12302a] text-white p-4 rounded-2xl shadow-2xl border border-[#173d35] flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-full bg-[#e4e8bf] text-[#12302a] flex items-center justify-center font-bold shrink-0">
          <Check className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold text-white leading-tight">
            {message}
          </p>
          {onActionClick && (
            <button
              onClick={onActionClick}
              className="text-xs text-[#e4e8bf] hover:text-white font-black underline mt-1 inline-flex items-center gap-1 transition-colors"
            >
              <span>{actionText}</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/70 hover:text-white transition-colors"
          aria-label="إغلاق الإشعار"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
