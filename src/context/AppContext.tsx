import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ViewMode, 
  Product, 
  UserProfile, 
  AlertNotification, 
  RecommendationMatch, 
  ResearchPaper,
  DailyIntakeLogEntry,
  SampleTrialOrder,
  SampleOrderStatus,
  SensoryTrialEntry,
  ProductTastingNote,
  ChildFamilyProfile
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_USER, INITIAL_ALERTS, RESEARCH_PAPERS } from '../data/mockData';
import { 
  INITIAL_DAILY_LOGS, 
  INITIAL_SAMPLE_ORDERS, 
  INITIAL_SENSORY_TRIALS, 
  INITIAL_TASTING_NOTES, 
  INITIAL_FAMILY_PROFILES 
} from '../data/portalMockData';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (prod: Product | null) => void;
  openProductDetail: (productId: string) => void;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  savedProductIds: string[];
  toggleSaveProduct: (productId: string) => void;
  isProductSaved: (productId: string) => boolean;
  alerts: AlertNotification[];
  markAlertAsRead: (alertId: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  recommendationResults: RecommendationMatch[] | null;
  setRecommendationResults: (results: RecommendationMatch[] | null) => void;
  activeResearchPaper: ResearchPaper | null;
  setActiveResearchPaper: (paper: ResearchPaper | null) => void;
  
  // User Portal: Daily intake tracker
  dailyIntakeLogs: DailyIntakeLogEntry[];
  addIntakeLog: (entry: Omit<DailyIntakeLogEntry, 'id' | 'timestamp'>) => void;
  removeIntakeLog: (id: string) => void;
  clearDailyLogs: () => void;

  // User & Admin Portal: Sample Trial Orders
  sampleOrders: SampleTrialOrder[];
  createSampleOrder: (order: Omit<SampleTrialOrder, 'id' | 'orderNumber' | 'date'>) => void;
  updateOrderStatus: (id: string, status: SampleOrderStatus, notes?: string) => void;

  // Admin Portal: Sensory Trials Log
  sensoryTrials: SensoryTrialEntry[];
  addSensoryTrial: (trial: Omit<SensoryTrialEntry, 'id' | 'date'>) => void;
  deleteSensoryTrial: (id: string) => void;

  // User Portal: Personal Product Tasting Notes & Ratings
  productTastingNotes: Record<string, ProductTastingNote>;
  saveProductTastingNote: (productId: string, rating: number, notes: string) => void;

  // User Portal: Family / Pediatric Profiles
  familyProfiles: ChildFamilyProfile[];
  addFamilyProfile: (profile: Omit<ChildFamilyProfile, 'id'>) => void;
  updateFamilyProfile: (id: string, profile: Partial<ChildFamilyProfile>) => void;
  deleteFamilyProfile: (id: string) => void;

  // Admin helpers
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  resetAllData: () => void;
  // Quick navigation with smooth scroll to section if on home
  navigateTo: (mode: ViewMode, sectionId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<UserProfile | null>(INITIAL_USER);
  const [savedProductIds, setSavedProductIds] = useState<string[]>(INITIAL_USER.savedProductIds);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [recommendationResults, setRecommendationResults] = useState<RecommendationMatch[] | null>(null);
  const [activeResearchPaper, setActiveResearchPaper] = useState<ResearchPaper | null>(null);

  // New Portal States
  const [dailyIntakeLogs, setDailyIntakeLogs] = useState<DailyIntakeLogEntry[]>(INITIAL_DAILY_LOGS);
  const [sampleOrders, setSampleOrders] = useState<SampleTrialOrder[]>(INITIAL_SAMPLE_ORDERS);
  const [sensoryTrials, setSensoryTrials] = useState<SensoryTrialEntry[]>(INITIAL_SENSORY_TRIALS);
  const [productTastingNotes, setProductTastingNotes] = useState<Record<string, ProductTastingNote>>(INITIAL_TASTING_NOTES);
  const [familyProfiles, setFamilyProfiles] = useState<ChildFamilyProfile[]>(INITIAL_FAMILY_PROFILES);

  const addToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
    addToast('Profile Updated', 'Your dietary target and preferences have been synchronized.', 'success');
  };

  const openProductDetail = (productId: string) => {
    const found = products.find(p => p.id === productId);
    if (found) {
      setSelectedProduct(found);
    }
  };

  const toggleSaveProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    const prodName = prod ? prod.name : 'Product';
    
    if (savedProductIds.includes(productId)) {
      setSavedProductIds(prev => prev.filter(id => id !== productId));
      addToast('Removed from Saved Items', `${prodName} was removed from your dashboard.`, 'info');
    } else {
      setSavedProductIds(prev => [...prev, productId]);
      addToast('Saved to Favorites', `${prodName} is now in your saved nutrition list.`, 'success');
    }
  };

  const isProductSaved = (productId: string) => savedProductIds.includes(productId);

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  // Daily Intake Tracker Methods
  const addIntakeLog = (entry: Omit<DailyIntakeLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeString = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newEntry: DailyIntakeLogEntry = {
      ...entry,
      id: 'log-' + Date.now(),
      timestamp: timeString
    };
    setDailyIntakeLogs(prev => [newEntry, ...prev]);
    
    // Update user's currentFiberIntakeGrams automatically
    setUser(prev => {
      if (!prev) return null;
      const newTotal = Number((prev.currentFiberIntakeGrams + entry.fiberGrams).toFixed(1));
      return { ...prev, currentFiberIntakeGrams: newTotal };
    });

    addToast('Intake Logged', `Added ${entry.servings}x ${entry.productName} (+${entry.fiberGrams}g fiber).`, 'success');
  };

  const removeIntakeLog = (id: string) => {
    const item = dailyIntakeLogs.find(l => l.id === id);
    setDailyIntakeLogs(prev => prev.filter(l => l.id !== id));
    if (item && user) {
      setUser(prev => {
        if (!prev) return null;
        const newTotal = Math.max(0, Number((prev.currentFiberIntakeGrams - item.fiberGrams).toFixed(1)));
        return { ...prev, currentFiberIntakeGrams: newTotal };
      });
    }
    addToast('Serving Removed', 'Daily intake log updated.', 'info');
  };

  const clearDailyLogs = () => {
    setDailyIntakeLogs([]);
    setUser(prev => prev ? { ...prev, currentFiberIntakeGrams: 0 } : null);
    addToast('Daily Log Reset', 'Intake counter reset for a new recording cycle.', 'info');
  };

  // Sample Orders Methods
  const createSampleOrder = (orderData: Omit<SampleTrialOrder, 'id' | 'orderNumber' | 'date'>) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: SampleTrialOrder = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber: `NB-2026-TR-${randomNum}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    setSampleOrders(prev => [newOrder, ...prev]);
    addToast('Trial Order Placed', `Order ${newOrder.orderNumber} is submitted for lab dispatch.`, 'success');
  };

  const updateOrderStatus = (id: string, status: SampleOrderStatus, notes?: string) => {
    setSampleOrders(prev => prev.map(ord => {
      if (ord.id === id) {
        return {
          ...ord,
          status,
          trackingNotes: notes !== undefined ? notes : ord.trackingNotes
        };
      }
      return ord;
    }));
    addToast('Status Updated', `Order status updated to ${status}.`, 'info');
  };

  // Sensory Trials Methods
  const addSensoryTrial = (trialData: Omit<SensoryTrialEntry, 'id' | 'date'>) => {
    const newTrial: SensoryTrialEntry = {
      ...trialData,
      id: 'sen-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    setSensoryTrials(prev => [newTrial, ...prev]);
    addToast('Trial Evaluation Logged', `Recorded panelist score: ${newTrial.overallAcceptability}% for ${newTrial.productName}.`, 'success');
  };

  const deleteSensoryTrial = (id: string) => {
    setSensoryTrials(prev => prev.filter(t => t.id !== id));
    addToast('Trial Removed', 'Sensory record removed from panel dataset.', 'info');
  };

  // Product Tasting Notes Methods
  const saveProductTastingNote = (productId: string, rating: number, notes: string) => {
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    setProductTastingNotes(prev => ({
      ...prev,
      [productId]: { productId, rating, notes, date: dateStr }
    }));
    addToast('Notes Saved', 'Your personal sensory evaluation is saved to your profile.', 'success');
  };

  // Family Profiles Methods
  const addFamilyProfile = (profileData: Omit<ChildFamilyProfile, 'id'>) => {
    const newProfile: ChildFamilyProfile = {
      ...profileData,
      id: 'fam-' + Date.now()
    };
    setFamilyProfiles(prev => [...prev, newProfile]);
    addToast('Family Member Added', `${newProfile.name}'s dietary profile is now active.`, 'success');
  };

  const updateFamilyProfile = (id: string, updates: Partial<ChildFamilyProfile>) => {
    setFamilyProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    addToast('Profile Updated', 'Family nutrition settings updated.', 'info');
  };

  const deleteFamilyProfile = (id: string) => {
    setFamilyProfiles(prev => prev.filter(p => p.id !== id));
    addToast('Profile Removed', 'Family record removed.', 'info');
  };

  // Product CRUD
  const addProduct = (newProdData: Omit<Product, 'id'>) => {
    const newId = 'prod-' + Date.now();
    const newProduct: Product = {
      ...newProdData,
      id: newId
    };
    setProducts(prev => [newProduct, ...prev]);
    addToast('Product Formulated & Added', `${newProduct.name} is now live in laboratory catalog.`, 'success');
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(prev => prev ? { ...prev, ...updatedFields } : null);
    }
    addToast('Product Updated', 'Nutritional formulation parameters saved successfully.', 'info');
  };

  const duplicateProduct = (id: string) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    const cloned: Product = {
      ...p,
      id: 'prod-' + Date.now(),
      name: `${p.name} (Prototype v2)`,
      batchCode: `NB-LAB-${Math.floor(100 + Math.random() * 900)}`,
      labStatus: 'Formulation Testing'
    };
    setProducts(prev => [cloned, ...prev]);
    addToast('Formulation Cloned', `Created iteration prototype for ${p.name}.`, 'success');
  };

  const deleteProduct = (id: string) => {
    const p = products.find(prod => prod.id === id);
    setProducts(prev => prev.filter(prod => prod.id !== id));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }
    addToast('Product Archived', `${p?.name || 'Item'} was removed from catalog.`, 'warning');
  };

  const resetAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    setAlerts(INITIAL_ALERTS);
    setSavedProductIds(INITIAL_USER.savedProductIds);
    setDailyIntakeLogs(INITIAL_DAILY_LOGS);
    setSampleOrders(INITIAL_SAMPLE_ORDERS);
    setSensoryTrials(INITIAL_SENSORY_TRIALS);
    setProductTastingNotes(INITIAL_TASTING_NOTES);
    setFamilyProfiles(INITIAL_FAMILY_PROFILES);
    setUser(INITIAL_USER);
    addToast('Reset Complete', 'Laboratory demo dataset restored to baseline.', 'info');
  };

  const navigateTo = (mode: ViewMode, sectionId?: string) => {
    setViewMode(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        products,
        selectedProduct,
        setSelectedProduct,
        openProductDetail,
        user,
        setUser,
        updateUserProfile,
        savedProductIds,
        toggleSaveProduct,
        isProductSaved,
        alerts,
        markAlertAsRead,
        searchOpen,
        setSearchOpen,
        toasts,
        addToast,
        removeToast,
        recommendationResults,
        setRecommendationResults,
        activeResearchPaper,
        setActiveResearchPaper,
        dailyIntakeLogs,
        addIntakeLog,
        removeIntakeLog,
        clearDailyLogs,
        sampleOrders,
        createSampleOrder,
        updateOrderStatus,
        sensoryTrials,
        addSensoryTrial,
        deleteSensoryTrial,
        productTastingNotes,
        saveProductTastingNote,
        familyProfiles,
        addFamilyProfile,
        updateFamilyProfile,
        deleteFamilyProfile,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        resetAllData,
        navigateTo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
