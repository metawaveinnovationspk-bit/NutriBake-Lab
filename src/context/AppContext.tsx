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
import { 
  supabase, 
  mapProductFromDb, 
  mapProductToDb, 
  mapProfileFromDb, 
  mapProfileToDb, 
  mapDailyLogFromDb, 
  mapDailyLogToDb, 
  mapSampleOrderFromDb, 
  mapSampleOrderToDb, 
  mapSensoryTrialFromDb, 
  mapSensoryTrialToDb, 
  mapFamilyProfileFromDb, 
  mapFamilyProfileToDb, 
  mapAlertFromDb 
} from '../lib/supabase';
import { 
  warmBrowserCache, 
  saveOfflineSnapshot, 
  getOfflineSnapshot 
} from '../lib/cacheManager';

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
  updateProduct: (idOrProduct: string | Product, product?: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  resetAllData: () => void;
  // Quick navigation with smooth scroll to section if on home
  navigateTo: (mode: ViewMode, sectionId?: string) => void;

  // Auth Helpers
  loginAsRole?: (role: 'user' | 'admin') => Promise<void>;
  signOut?: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [products, setProducts] = useState<Product[]>(() => getOfflineSnapshot('products', INITIAL_PRODUCTS));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<UserProfile | null>(INITIAL_USER);
  const [savedProductIds, setSavedProductIds] = useState<string[]>(INITIAL_USER.savedProductIds);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [recommendationResults, setRecommendationResults] = useState<RecommendationMatch[] | null>(null);
  const [activeResearchPaper, setActiveResearchPaper] = useState<ResearchPaper | null>(null);

  // Portal States
  const [dailyIntakeLogs, setDailyIntakeLogs] = useState<DailyIntakeLogEntry[]>(INITIAL_DAILY_LOGS);
  const [sampleOrders, setSampleOrders] = useState<SampleTrialOrder[]>(() => getOfflineSnapshot('sample_orders', INITIAL_SAMPLE_ORDERS));
  const [sensoryTrials, setSensoryTrials] = useState<SensoryTrialEntry[]>(() => getOfflineSnapshot('sensory_trials', INITIAL_SENSORY_TRIALS));
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

  // Helper to load user data from Supabase
  const loadUserData = async (userId: string) => {
    try {
      // 1. Profile
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!profErr && prof) {
        const mappedUser = mapProfileFromDb(prof);
        setUser(mappedUser);
        if (mappedUser.savedProductIds && mappedUser.savedProductIds.length > 0) {
          setSavedProductIds(mappedUser.savedProductIds);
        }
      }

      // 2. Daily logs
      const { data: logs, error: logErr } = await supabase
        .from('daily_intake_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!logErr && logs && logs.length > 0) {
        setDailyIntakeLogs(logs.map(mapDailyLogFromDb));
      }

      // 3. Family profiles
      const { data: fam, error: famErr } = await supabase
        .from('family_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!famErr && fam && fam.length > 0) {
        setFamilyProfiles(fam.map(mapFamilyProfileFromDb));
      }

      // 4. Tasting notes
      const { data: notes, error: notesErr } = await supabase
        .from('product_tasting_notes')
        .select('*')
        .eq('user_id', userId);

      if (!notesErr && notes && notes.length > 0) {
        const notesMap: Record<string, ProductTastingNote> = {};
        notes.forEach((n: any) => {
          notesMap[n.product_id] = {
            productId: n.product_id,
            rating: n.rating,
            notes: n.notes,
            date: n.date
          };
        });
        setProductTastingNotes(notesMap);
      }

      // 5. Alerts
      const { data: alts, error: altErr } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!altErr && alts && alts.length > 0) {
        setAlerts(alts.map(mapAlertFromDb));
      }
    } catch (err) {
      console.warn('Could not load user data from Supabase, using existing state:', err);
    }
  };

  // Initial Data & Cache Initialization
  useEffect(() => {
    let isMounted = true;

    // Warm browser Cache Storage & in-memory decoders on first load
    warmBrowserCache();

    async function loadPublicData() {
      try {
        // Fetch products
        const { data: dbProducts, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: true });

        if (!prodErr && dbProducts && dbProducts.length > 0 && isMounted) {
          const mapped = dbProducts.map(mapProductFromDb);
          setProducts(mapped);
          saveOfflineSnapshot('products', mapped);
        }

        // Fetch sensory trials
        const { data: dbTrials, error: trialErr } = await supabase
          .from('sensory_trials')
          .select('*')
          .order('created_at', { ascending: false });

        if (!trialErr && dbTrials && dbTrials.length > 0 && isMounted) {
          const mapped = dbTrials.map(mapSensoryTrialFromDb);
          setSensoryTrials(mapped);
          saveOfflineSnapshot('sensory_trials', mapped);
        }

        // Fetch sample orders
        const { data: dbOrders, error: ordErr } = await supabase
          .from('sample_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!ordErr && dbOrders && dbOrders.length > 0 && isMounted) {
          const mapped = dbOrders.map(mapSampleOrderFromDb);
          setSampleOrders(mapped);
          saveOfflineSnapshot('sample_orders', mapped);
        }
      } catch (err) {
        console.warn('Initial Supabase fetch fallback to cached/local defaults:', err);
      }
    }

    loadPublicData();

    // Check active auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && isMounted) {
        loadUserData(session.user.id);
      }
    });

    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        loadUserData(session.user.id);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginAsRole = async (role: 'user' | 'admin') => {
    const email = role === 'admin' ? 'lab.lead@nutribake.edu' : 'sarah.lin@example.com';
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'password123'
      });
      if (error) throw error;
      if (data?.user) {
        await loadUserData(data.user.id);
      }
      addToast(
        role === 'admin' ? 'Admin Access' : 'Welcome Back',
        `Signed in as ${role === 'admin' ? 'Chief Formulator' : 'Dr. Sarah Lin'}`,
        'success'
      );
    } catch (err: any) {
      console.warn('Demo login fallback:', err);
      // Seamless fallback to ensure uninterrupted user experience
      if (role === 'admin') {
        setUser({
          id: '0d9ebe39-d39c-4ef2-8e55-8c36ea0c1434',
          name: 'Chief Formulator',
          email: 'lab.lead@nutribake.edu',
          role: 'admin',
          savedProductIds: [],
          savedProducts: [],
          dailyFiberGoalGrams: 30,
          currentFiberIntakeGrams: 20,
          recommendationHistoryCount: 12,
          memberSince: 'January 2025',
          preferences: {
            dailyFiberTargetGrams: 30,
            dietaryGoal: 'Research Formulation & Quality Assurance',
            allergens: []
          }
        });
      } else {
        setUser({
          id: '4e5a974f-3cb1-4e48-b5ef-7f7edf538c75',
          name: 'Dr. Sarah Lin',
          email: 'sarah.lin@example.com',
          role: 'user',
          savedProductIds: ['prod-cupcakes', 'prod-cookies'],
          savedProducts: ['prod-cupcakes', 'prod-cookies'],
          dailyFiberGoalGrams: 28,
          currentFiberIntakeGrams: 22,
          recommendationHistoryCount: 4,
          memberSince: 'March 2026',
          preferences: {
            dailyFiberTargetGrams: 28,
            dietaryGoal: 'High Fiber & Gut Vitality',
            allergens: []
          }
        });
      }
      addToast('Session Initialized', `Logged in as ${role === 'admin' ? 'Chief Formulator' : 'Dr. Sarah Lin'}`, 'info');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
    setUser(null);
    addToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  const handleSetUser: React.Dispatch<React.SetStateAction<UserProfile | null>> = (action) => {
    setUser(prev => {
      const nextVal = typeof action === 'function' ? (action as (prev: UserProfile | null) => UserProfile | null)(prev) : action;
      if (nextVal === null) {
        supabase.auth.signOut().catch(console.warn);
      }
      return nextVal;
    });
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });

    if (user?.id) {
      try {
        await supabase.from('profiles').update(mapProfileToDb(updates)).eq('id', user.id);
      } catch (e) {
        console.warn('Supabase profile update failed:', e);
      }
    }
    addToast('Profile Updated', 'Your dietary target and preferences have been synchronized.', 'success');
  };

  const openProductDetail = (productId: string) => {
    const found = products.find(p => p.id === productId);
    if (found) {
      setSelectedProduct(found);
    }
  };

  const toggleSaveProduct = async (productId: string) => {
    const prod = products.find(p => p.id === productId);
    const prodName = prod ? prod.name : 'Product';
    
    let newSavedIds: string[] = [];
    if (savedProductIds.includes(productId)) {
      newSavedIds = savedProductIds.filter(id => id !== productId);
      setSavedProductIds(newSavedIds);
      addToast('Removed from Saved Items', `${prodName} was removed from your dashboard.`, 'info');
    } else {
      newSavedIds = [...savedProductIds, productId];
      setSavedProductIds(newSavedIds);
      addToast('Saved to Favorites', `${prodName} is now in your saved nutrition list.`, 'success');
    }

    if (user?.id) {
      try {
        await supabase.from('profiles').update({ saved_product_ids: newSavedIds }).eq('id', user.id);
      } catch (e) {
        console.warn('Supabase saved_product_ids update failed:', e);
      }
    }
  };

  const isProductSaved = (productId: string) => savedProductIds.includes(productId);

  const markAlertAsRead = async (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
    try {
      await supabase.from('alerts').update({ read: true }).eq('id', alertId);
    } catch (e) {
      console.warn('Supabase alert read update failed:', e);
    }
  };

  // Daily Intake Tracker Methods
  const addIntakeLog = async (entry: Omit<DailyIntakeLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeString = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newEntry: DailyIntakeLogEntry = {
      ...entry,
      id: 'log-' + Date.now(),
      timestamp: timeString
    };
    setDailyIntakeLogs(prev => [newEntry, ...prev]);
    
    const newTotal = user ? Number((user.currentFiberIntakeGrams + entry.fiberGrams).toFixed(1)) : entry.fiberGrams;
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, currentFiberIntakeGrams: newTotal };
    });

    if (user?.id) {
      try {
        await supabase.from('daily_intake_logs').insert(mapDailyLogToDb(newEntry, user.id));
        await supabase.from('profiles').update({ current_fiber_intake_grams: newTotal }).eq('id', user.id);
      } catch (e) {
        console.warn('Supabase daily_intake_logs insert failed:', e);
      }
    }

    addToast('Intake Logged', `Added ${entry.servings}x ${entry.productName} (+${entry.fiberGrams}g fiber).`, 'success');
  };

  const removeIntakeLog = async (id: string) => {
    const item = dailyIntakeLogs.find(l => l.id === id);
    setDailyIntakeLogs(prev => prev.filter(l => l.id !== id));
    if (item && user) {
      const newTotal = Math.max(0, Number((user.currentFiberIntakeGrams - item.fiberGrams).toFixed(1)));
      setUser(prev => {
        if (!prev) return null;
        return { ...prev, currentFiberIntakeGrams: newTotal };
      });
      if (user.id) {
        try {
          await supabase.from('daily_intake_logs').delete().eq('id', id);
          await supabase.from('profiles').update({ current_fiber_intake_grams: newTotal }).eq('id', user.id);
        } catch (e) {
          console.warn('Supabase daily_intake_logs delete failed:', e);
        }
      }
    }
    addToast('Serving Removed', 'Daily intake log updated.', 'info');
  };

  const clearDailyLogs = async () => {
    setDailyIntakeLogs([]);
    setUser(prev => prev ? { ...prev, currentFiberIntakeGrams: 0 } : null);
    if (user?.id) {
      try {
        await supabase.from('daily_intake_logs').delete().eq('user_id', user.id);
        await supabase.from('profiles').update({ current_fiber_intake_grams: 0 }).eq('id', user.id);
      } catch (e) {
        console.warn('Supabase clear daily logs failed:', e);
      }
    }
    addToast('Daily Log Reset', 'Intake counter reset for a new recording cycle.', 'info');
  };

  // Sample Orders Methods
  const createSampleOrder = async (orderData: Omit<SampleTrialOrder, 'id' | 'orderNumber' | 'date'>) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: SampleTrialOrder = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber: `NB-2026-TR-${randomNum}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    setSampleOrders(prev => [newOrder, ...prev]);

    try {
      await supabase.from('sample_orders').insert(mapSampleOrderToDb(newOrder, user?.id));
    } catch (e) {
      console.warn('Supabase sample_orders insert failed:', e);
    }

    addToast('Trial Order Placed', `Order ${newOrder.orderNumber} is submitted for lab dispatch.`, 'success');
  };

  const updateOrderStatus = async (id: string, status: SampleOrderStatus, notes?: string) => {
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

    try {
      await supabase.from('sample_orders').update({
        status,
        ...(notes !== undefined ? { tracking_notes: notes } : {})
      }).eq('id', id);
    } catch (e) {
      console.warn('Supabase update order status failed:', e);
    }

    addToast('Status Updated', `Order status updated to ${status}.`, 'info');
  };

  // Sensory Trials Methods
  const addSensoryTrial = async (trialData: Omit<SensoryTrialEntry, 'id' | 'date'>) => {
    const newTrial: SensoryTrialEntry = {
      ...trialData,
      id: 'sen-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    setSensoryTrials(prev => [newTrial, ...prev]);

    try {
      await supabase.from('sensory_trials').insert(mapSensoryTrialToDb(newTrial));
    } catch (e) {
      console.warn('Supabase sensory_trials insert failed:', e);
    }

    addToast('Trial Evaluation Logged', `Recorded panelist score: ${newTrial.overallAcceptability}% for ${newTrial.productName}.`, 'success');
  };

  const deleteSensoryTrial = async (id: string) => {
    setSensoryTrials(prev => prev.filter(t => t.id !== id));
    try {
      await supabase.from('sensory_trials').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase sensory_trials delete failed:', e);
    }
    addToast('Trial Removed', 'Sensory record removed from panel dataset.', 'info');
  };

  // Product Tasting Notes Methods
  const saveProductTastingNote = async (productId: string, rating: number, notes: string) => {
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    setProductTastingNotes(prev => ({
      ...prev,
      [productId]: { productId, rating, notes, date: dateStr }
    }));

    if (user?.id) {
      try {
        await supabase.from('product_tasting_notes').upsert({
          id: 'note-' + productId + '-' + user.id,
          user_id: user.id,
          product_id: productId,
          rating,
          notes,
          date: dateStr
        });
      } catch (e) {
        console.warn('Supabase tasting note upsert failed:', e);
      }
    }

    addToast('Notes Saved', 'Your personal sensory evaluation is saved to your profile.', 'success');
  };

  // Family Profiles Methods
  const addFamilyProfile = async (profileData: Omit<ChildFamilyProfile, 'id'>) => {
    const newProfile: ChildFamilyProfile = {
      ...profileData,
      id: 'fam-' + Date.now()
    };
    setFamilyProfiles(prev => [...prev, newProfile]);

    if (user?.id) {
      try {
        await supabase.from('family_profiles').insert(mapFamilyProfileToDb(newProfile, user.id));
      } catch (e) {
        console.warn('Supabase family profile insert failed:', e);
      }
    }

    addToast('Family Member Added', `${newProfile.name}'s dietary profile is now active.`, 'success');
  };

  const updateFamilyProfile = async (id: string, updates: Partial<ChildFamilyProfile>) => {
    setFamilyProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

    try {
      await supabase.from('family_profiles').update(mapFamilyProfileToDb(updates as any)).eq('id', id);
    } catch (e) {
      console.warn('Supabase family profile update failed:', e);
    }

    addToast('Profile Updated', 'Family nutrition settings updated.', 'info');
  };

  const deleteFamilyProfile = async (id: string) => {
    setFamilyProfiles(prev => prev.filter(p => p.id !== id));

    try {
      await supabase.from('family_profiles').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase family profile delete failed:', e);
    }

    addToast('Profile Removed', 'Family record removed.', 'info');
  };

  // Product CRUD
  const addProduct = async (newProdData: Omit<Product, 'id'>) => {
    const newId = 'prod-' + Date.now();
    const newProduct: Product = {
      ...newProdData,
      id: newId
    };
    setProducts(prev => [newProduct, ...prev]);

    try {
      await supabase.from('products').insert(mapProductToDb(newProduct));
    } catch (e) {
      console.warn('Supabase product insert failed:', e);
    }

    addToast('Product Formulated & Added', `${newProduct.name} is now live in laboratory catalog.`, 'success');
  };

  const updateProduct = async (idOrProduct: string | Product, updatedFields?: Partial<Product>) => {
    const id = typeof idOrProduct === 'string' ? idOrProduct : idOrProduct.id;
    const fields = typeof idOrProduct === 'string' ? (updatedFields || {}) : idOrProduct;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(prev => prev ? { ...prev, ...fields } : null);
    }

    try {
      await supabase.from('products').update(mapProductToDb(fields)).eq('id', id);
    } catch (e) {
      console.warn('Supabase product update failed:', e);
    }

    addToast('Product Updated', 'Nutritional formulation parameters saved successfully.', 'info');
  };

  const duplicateProduct = async (id: string) => {
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

    try {
      await supabase.from('products').insert(mapProductToDb(cloned));
    } catch (e) {
      console.warn('Supabase clone product insert failed:', e);
    }

    addToast('Formulation Cloned', `Created iteration prototype for ${p.name}.`, 'success');
  };

  const deleteProduct = async (id: string) => {
    const p = products.find(prod => prod.id === id);
    setProducts(prev => prev.filter(prod => prod.id !== id));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }

    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase product delete failed:', e);
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
        setUser: handleSetUser,
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
        loginAsRole,
        signOut
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
