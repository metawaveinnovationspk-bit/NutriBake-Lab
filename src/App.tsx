import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { AuthModal } from './components/auth/AuthModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { MobileAppTabBar } from './components/common/MobileAppTabBar';

// Pages
import { HomePage } from './components/home/HomePage';
import { ProductCatalog } from './components/products/ProductCatalog';
import { NutritionExplorer } from './components/nutrition/NutritionExplorer';
import { RecommendationWizard } from './components/recommendations/RecommendationWizard';
import { ChildFamilySection } from './components/family/ChildFamilySection';
import { AboutPage } from './components/about/AboutPage';
import { ContactPage } from './components/contact/ContactPage';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { viewMode, navigateTo } = useApp();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // If viewMode was set to 'login', trigger auth modal
  const showLoginModal = viewMode === 'login' || authModalOpen;

  const handleCloseAuth = () => {
    setAuthModalOpen(false);
    if (viewMode === 'login') {
      navigateTo('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED] text-[#29211E] selection:bg-[#A96345] selection:text-[#FAF5ED] font-sans antialiased pb-20 lg:pb-0">
      {/* Sticky Top Navigation */}
      <Navbar />

      {/* Main Content Area Routed by State */}
      <main className="flex-1">
        {viewMode === 'home' && <HomePage />}
        {viewMode === 'products' && <ProductCatalog />}
        {viewMode === 'nutrition' && <NutritionExplorer />}
        {viewMode === 'recommendations' && <RecommendationWizard />}
        {viewMode === 'family' && <ChildFamilySection />}
        {viewMode === 'about' && <AboutPage />}
        {viewMode === 'contact' && <ContactPage />}
        {viewMode === 'dashboard' && <UserDashboard />}
        {viewMode === 'admin' && <AdminDashboard />}
        {viewMode === 'login' && <HomePage />}
      </main>

      {/* Site Footer */}
      <Footer />

      {/* Mobile & Tablet App Navigation Tab Bar */}
      <MobileAppTabBar />

      {/* Global Modals & Overlays */}
      <ProductDetailModal />
      <GlobalSearchModal />
      <AuthModal isOpen={showLoginModal} onClose={handleCloseAuth} />
      <ToastContainer />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
