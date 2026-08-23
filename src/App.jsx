import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/components/site/cart";
import { CartSidebar } from "@/components/site/cart-sidebar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ScrollToTop } from "@/components/common/scroll-to-top";
import { HomePage } from "@/pages/home";
import { ShopPage } from "@/pages/shop";
import { ProductDetailPage } from "@/pages/product-detail";
import { CheckoutPage } from "@/pages/checkout";
import { WishlistPage } from "@/pages/wishlist";
import { AccountPage } from "@/pages/account";
import { OrderTrackingPage } from "@/pages/order-tracking";
import { AboutPage } from "@/pages/about";
import { ContactPage } from "@/pages/contact";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { ForgotPasswordPage } from "@/pages/forgot-password";
import { AdminLayout } from "@/layouts/admin-layout";
import { AdminDashboardPage } from "@/pages/admin/dashboard";
import { AdminCategoriesPage } from "@/pages/admin/categories";
import { AdminProductsPage } from "@/pages/admin/products";
import { AdminProductCreatePage } from "@/pages/admin/product-create";
import { AdminInventoryPage } from "@/pages/admin/inventory";
import { AdminOrdersPage } from "@/pages/admin/orders";
import { AdminReportsPage } from "@/pages/admin/reports";
import { AdminSettingsPage } from "@/pages/admin/settings";

function AdminFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="size-8 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/new" element={<AdminProductCreatePage />} />
          <Route path="/admin/products/edit/:id" element={<AdminProductCreatePage />} />
          <Route path="/admin/inventory" element={<AdminInventoryPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
        </Routes>
      </AdminLayout>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-ink selection:text-ink-foreground">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/profile" element={<AccountPage />} />
          <Route path="/track-order" element={<OrderTrackingPage />} />
          <Route path="/order-tracking" element={<OrderTrackingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
      <CartSidebar />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <AppContent />
        <Toaster position="bottom-right" richColors closeButton />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
