import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Coffee,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { adminSignIn, initDefaultAdminAccount } from '../../services/authService';

interface AdminLoginProps {
  onLoginSuccess?: (email: string) => void;
  onSuccess?: (email: string) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onSuccess,
  onBackToStore,
}) => {
  const [email, setEmail] = useState('admin@naghmatfinjan.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initSuccessMessage, setInitSuccessMessage] = useState<string | null>(null);

  const handleCallback = (loggedInEmail: string) => {
    if (onLoginSuccess) onLoginSuccess(loggedInEmail);
    if (onSuccess) onSuccess(loggedInEmail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى ملء البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await adminSignIn(email.trim(), password);
      handleCallback(user.email || email);
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message?.includes('invalid-credential')) {
        setError('بيانات الدخول غير صحيحة. إذا كنت تسجل الدخول للمرة الأولى، يمكنك الضغط على "إنشاء/تهيئة حساب المدير الافتراضي" أدناه.');
      } else {
        setError('فشل تسجيل الدخول: ' + (err.message || 'يرجى التأكد من البيانات'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDefaultAccount = async () => {
    setIsInitializing(true);
    setError(null);
    setInitSuccessMessage(null);

    try {
      const creds = await initDefaultAdminAccount();
      setEmail(creds.email);
      setPassword(creds.password);
      setInitSuccessMessage(`تم تجهيز حساب المدير بنجاح (${creds.email})! جارٍ تسجيل الدخول تلقائياً...`);
      
      setTimeout(async () => {
        try {
          const user = await adminSignIn(creds.email, creds.password);
          handleCallback(user.email || creds.email);
        } catch (e) {
          // User will be able to click sign in directly with the filled form
        }
      }, 1000);
    } catch (err: any) {
      setError('فشل إنشاء الحساب الافتراضي: ' + (err.message || 'حاول مجدداً'));
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Tajawal']" dir="rtl">
      
      {/* Top Header info */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#12302a] text-[#e4e8bf] shadow-lg mb-4">
          <Coffee className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#12302a] font-['Cairo']">
          لوحة تحكم نغمة فنجان
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#6b7680]">
          تسجيل الدخول المخصص لإدارة المنتجات، الطلبات، الإعدادات، وطرق الدفع
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-[#e6e8e4] rounded-3xl">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {initSuccessMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="leading-relaxed font-bold">{initSuccessMessage}</div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#12302a] mb-1.5 font-['Cairo']">
                البريد الإلكتروني للإدارة
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="w-full px-4 py-3 pl-10 bg-[#fafaf8] border border-[#e6e8e4] rounded-xl text-xs font-medium text-[#12302a] placeholder-gray-400 focus:outline-hidden focus:border-[#12302a] focus:bg-white transition-all font-mono"
                  placeholder="admin@naghmatfinjan.com"
                  required
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#12302a] mb-1.5 font-['Cairo']">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  className="w-full px-4 py-3 pl-10 pr-10 bg-[#fafaf8] border border-[#e6e8e4] rounded-xl text-xs font-medium text-[#12302a] placeholder-gray-400 focus:outline-hidden focus:border-[#12302a] focus:bg-white transition-all font-mono"
                  placeholder="••••••••"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3 text-gray-400 hover:text-[#12302a] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#12302a] text-[#e4e8bf] rounded-xl text-xs font-bold font-['Cairo'] hover:bg-[#173d35] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#e4e8bf] border-t-transparent rounded-full animate-spin"></div>
                  <span>جارٍ التحقق والدخول...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>دخول لوحة التحكم</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Setup for First Run */}
          <div className="mt-6 pt-5 border-t border-[#e6e8e4] text-center space-y-3">
            <p className="text-[11px] text-[#6b7680]">
              بيانات الدخول الافتراضية للمدير: <span className="font-mono text-[#12302a] font-bold">admin@naghmatfinjan.com</span> / <span className="font-mono text-[#12302a] font-bold">Admin@123456</span>
            </p>
            
            <button
              type="button"
              onClick={handleCreateDefaultAccount}
              disabled={isInitializing}
              className="inline-flex items-center gap-1.5 text-xs text-[#1e4c42] hover:text-[#12302a] font-bold underline cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isInitializing ? 'جارٍ التهيئة...' : 'إنشاء / إعادة تعيين حساب المدير الافتراضي بنقرة واحدة'}</span>
            </button>
          </div>

          {/* Back to store */}
          <div className="mt-5 text-center">
            <button
              onClick={onBackToStore}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#6b7680] hover:text-[#12302a] transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة إلى واجهة المتجر</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
