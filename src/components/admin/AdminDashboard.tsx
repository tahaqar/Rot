import React, { useState, useEffect } from 'react';
import { AdminLayout, AdminTab } from './AdminLayout';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminPayments } from './AdminPayments';
import { AdminSettings } from './AdminSettings';
import { AdminLogin } from './AdminLogin';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToOrders,
  subscribeToSettings,
  subscribeToPaymentConfig,
  fetchProductsFromDb,
  fetchCategoriesFromDb,
  fetchOrdersFromDb,
  fetchSettingsFromDb,
  fetchPaymentConfigFromDb,
  seedDatabaseIfEmpty,
  seedDatabaseForce,
  DEFAULT_SETTINGS,
  DEFAULT_PAYMENT_CONFIG,
} from '../../services/dbService';
import { subscribeToAuth, logoutAdmin } from '../../services/authService';
import { Product, Category, OrderDetails, WebsiteSettings, PaymentMethodsConfig } from '../../types';
import { CATEGORIES as INITIAL_CATEGORIES } from '../../data/categories';
import { PRODUCTS as INITIAL_PRODUCTS } from '../../data/products';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Real-time Database State (with resilient defaults)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_SETTINGS);
  const [paymentConfig, setPaymentConfig] = useState<PaymentMethodsConfig>(DEFAULT_PAYMENT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      if (user && user.email) {
        setCurrentUserEmail(user.email);
      } else {
        setCurrentUserEmail(null);
      }
      setAuthChecking(false);
    });

    return () => unsubAuth();
  }, []);

  // Set up real-time listeners from Cloud Firestore
  useEffect(() => {
    if (!currentUserEmail) return;

    // Seed database if empty now that admin is authenticated
    seedDatabaseIfEmpty();

    setIsLoading(true);

    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
      setIsLoading(false);
    });

    const unsubCategories = subscribeToCategories((data) => {
      setCategories(data);
    });

    const unsubOrders = subscribeToOrders((data) => {
      setOrders(data);
    });

    const unsubSettings = subscribeToSettings((data) => {
      setSettings(data);
    });

    const unsubPayments = subscribeToPaymentConfig((data) => {
      setPaymentConfig(data);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubSettings();
      unsubPayments();
    };
  }, [currentUserEmail]);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      const [prods, cats, ords, stt, pym] = await Promise.all([
        fetchProductsFromDb(),
        fetchCategoriesFromDb(),
        fetchOrdersFromDb(),
        fetchSettingsFromDb(),
        fetchPaymentConfigFromDb(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
      setSettings(stt);
      setPaymentConfig(pym);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setCurrentUserEmail(null);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#12302a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#e4e8bf] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold">جاري التحقق من صلاحيات الدخول...</p>
        </div>
      </div>
    );
  }

  // If not logged in, render Admin Login screen
  if (!currentUserEmail) {
    return (
      <AdminLogin
        onLoginSuccess={(email) => setCurrentUserEmail(email)}
        onBackToStore={onExitAdmin}
      />
    );
  }

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'pending' || !o.orderStatus
  ).length;

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      adminEmail={currentUserEmail}
      settings={settings}
      onLogout={handleLogout}
      onBackToStore={onExitAdmin}
      pendingOrdersCount={pendingOrdersCount}
    >
      {activeTab === 'overview' && (
        <AdminOverview
          products={products}
          categories={categories}
          orders={orders}
          settings={settings}
          onNavigate={setActiveTab}
          onRefresh={handleManualRefresh}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'products' && (
        <AdminProducts
          products={products}
          categories={categories}
          currency={settings.currency || 'د.ع'}
          onRefresh={handleManualRefresh}
        />
      )}

      {activeTab === 'categories' && (
        <AdminCategories
          categories={categories}
          products={products}
          onRefresh={handleManualRefresh}
        />
      )}

      {activeTab === 'orders' && (
        <AdminOrders
          orders={orders}
          settings={settings}
          onRefresh={handleManualRefresh}
        />
      )}

      {activeTab === 'payments' && (
        <AdminPayments
          paymentConfig={paymentConfig}
          onRefresh={handleManualRefresh}
        />
      )}

      {activeTab === 'settings' && (
        <AdminSettings
          settings={settings}
          onRefresh={handleManualRefresh}
        />
      )}
    </AdminLayout>
  );
};
