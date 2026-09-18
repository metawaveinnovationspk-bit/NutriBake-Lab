import { createClient } from '@supabase/supabase-js';
import cupcakesImg from '../assets/images/nutribake_cupcakes_1789159074122.jpg';
import cookiesImg from '../assets/images/nutribake_cookies_1789159094420.jpg';
import nutriballsImg from '../assets/images/nutribake_nutriballs_1789159111855.jpg';
import { 
  Product, 
  UserProfile, 
  DailyIntakeLogEntry, 
  SampleTrialOrder, 
  SensoryTrialEntry, 
  ProductTastingNote, 
  ChildFamilyProfile,
  AlertNotification 
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yagudoefqpndwwxihweq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_d2EWTd5ZlcsCB4vv_x5vSw_gPhivY5w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to guarantee proper original bakery image resolution
const resolveProductImage = (row: any): string => {
  if (row.image_url && typeof row.image_url === 'string' && row.image_url.trim().length > 0) {
    if (row.image_url.startsWith('http') || row.image_url.startsWith('data:') || row.image_url.startsWith('/assets/')) {
      return row.image_url;
    }
    if (row.image_url.includes('cupcake')) return cupcakesImg;
    if (row.image_url.includes('cookie')) return cookiesImg;
    if (row.image_url.includes('nutriball') || row.image_url.includes('ball')) return nutriballsImg;
    return row.image_url;
  }
  const cat = (row.category || '').toLowerCase();
  const name = (row.name || '').toLowerCase();
  if (cat.includes('cookie') || name.includes('cookie') || name.includes('cocolina')) return cookiesImg;
  if (cat.includes('nutriball') || name.includes('nutri') || name.includes('ball')) return nutriballsImg;
  return cupcakesImg;
};

// ==================== MAPPERS ====================

export const mapProductFromDb = (row: any): Product => ({
  id: row.id,
  name: row.name,
  category: row.category,
  tagline: row.tagline || '',
  description: row.description || '',
  whyThisProduct: row.why_this_product || '',
  nutritionScore: row.nutrition_score ?? 90,
  nutrition: row.nutrition || {
    calories: 180,
    proteinGrams: 5,
    carbsGrams: 24,
    dietaryFiberGrams: 6,
    sugarsGrams: 4,
    totalFatGrams: 5,
    saturatedFatGrams: 1,
    sodiumMg: 90,
    resistantStarchGrams: 4,
    glycemicIndexEst: 40
  },
  mainFunctionalIngredient: row.main_functional_ingredient || '',
  allIngredients: Array.isArray(row.all_ingredients) ? row.all_ingredients : [],
  functionalIngredients: Array.isArray(row.functional_ingredients) ? row.functional_ingredients : [],
  allergens: Array.isArray(row.allergens) ? row.allergens : [],
  dietaryTags: Array.isArray(row.dietary_tags) ? row.dietary_tags : [],
  sensoryScores: row.sensory_scores || {
    taste: 95,
    texture: 95,
    aroma: 95,
    appearance: 95,
    overallAcceptability: 95,
    panelNotes: ''
  },
  servingSize: row.serving_size || '1 portion',
  portionSize: row.portion_size,
  netWeight: row.net_weight,
  pricePkr: row.price_pkr,
  shelfLife: row.shelf_life || '14 days',
  storageInstructions: row.storage_instructions || 'Store in cool dry place.',
  allergenInformation: row.allergen_information,
  crossContamination: row.cross_contamination,
  imageUrl: resolveProductImage(row),
  isFeatured: !!row.is_featured,
  childFriendly: !!row.child_friendly,
  batchCode: row.batch_code,
  labStatus: row.lab_status || 'Approved'
});

export const mapProductToDb = (p: Partial<Product>): Record<string, any> => {
  const data: Record<string, any> = {};
  if (p.id !== undefined) data.id = p.id;
  if (p.name !== undefined) data.name = p.name;
  if (p.category !== undefined) data.category = p.category;
  if (p.tagline !== undefined) data.tagline = p.tagline;
  if (p.description !== undefined) data.description = p.description;
  if (p.whyThisProduct !== undefined) data.why_this_product = p.whyThisProduct;
  if (p.nutritionScore !== undefined) data.nutrition_score = p.nutritionScore;
  if (p.nutrition !== undefined) data.nutrition = p.nutrition;
  if (p.mainFunctionalIngredient !== undefined) data.main_functional_ingredient = p.mainFunctionalIngredient;
  if (p.allIngredients !== undefined) data.all_ingredients = p.allIngredients;
  if (p.functionalIngredients !== undefined) data.functional_ingredients = p.functionalIngredients;
  if (p.allergens !== undefined) data.allergens = p.allergens;
  if (p.dietaryTags !== undefined) data.dietary_tags = p.dietaryTags;
  if (p.sensoryScores !== undefined) data.sensory_scores = p.sensoryScores;
  if (p.servingSize !== undefined) data.serving_size = p.servingSize;
  if (p.portionSize !== undefined) data.portion_size = p.portionSize;
  if (p.netWeight !== undefined) data.net_weight = p.netWeight;
  if (p.pricePkr !== undefined) data.price_pkr = p.pricePkr;
  if (p.shelfLife !== undefined) data.shelf_life = p.shelfLife;
  if (p.storageInstructions !== undefined) data.storage_instructions = p.storageInstructions;
  if (p.allergenInformation !== undefined) data.allergen_information = p.allergenInformation;
  if (p.crossContamination !== undefined) data.cross_contamination = p.crossContamination;
  if (p.imageUrl !== undefined) data.image_url = p.imageUrl;
  if (p.isFeatured !== undefined) data.is_featured = p.isFeatured;
  if (p.childFriendly !== undefined) data.child_friendly = p.childFriendly;
  if (p.batchCode !== undefined) data.batch_code = p.batchCode;
  if (p.labStatus !== undefined) data.lab_status = p.labStatus;
  return data;
};

export const mapProfileFromDb = (row: any): UserProfile => ({
  id: row.id,
  name: row.name || 'Member',
  email: row.email || '',
  role: row.role === 'admin' ? 'admin' : 'user',
  avatar: row.avatar,
  ageGroup: row.age_group,
  dietaryPreference: row.dietary_preference,
  savedProductIds: Array.isArray(row.saved_product_ids) ? row.saved_product_ids : [],
  savedProducts: Array.isArray(row.saved_product_ids) ? row.saved_product_ids : [],
  preferences: row.preferences || {
    dailyFiberTargetGrams: row.daily_fiber_goal_grams || 28,
    dietaryGoal: 'High Fiber & Gut Vitality',
    allergens: []
  },
  dailyFiberGoalGrams: row.daily_fiber_goal_grams ?? 28,
  currentFiberIntakeGrams: row.current_fiber_intake_grams ?? 0,
  recommendationHistoryCount: row.recommendation_history_count ?? 0,
  memberSince: row.member_since || 'March 2026'
});

export const mapProfileToDb = (p: Partial<UserProfile>): Record<string, any> => {
  const data: Record<string, any> = {};
  if (p.name !== undefined) data.name = p.name;
  if (p.email !== undefined) data.email = p.email;
  if (p.role !== undefined) data.role = p.role;
  if (p.avatar !== undefined) data.avatar = p.avatar;
  if (p.ageGroup !== undefined) data.age_group = p.ageGroup;
  if (p.dietaryPreference !== undefined) data.dietary_preference = p.dietaryPreference;
  if (p.savedProductIds !== undefined) data.saved_product_ids = p.savedProductIds;
  if (p.preferences !== undefined) data.preferences = p.preferences;
  if (p.dailyFiberGoalGrams !== undefined) data.daily_fiber_goal_grams = p.dailyFiberGoalGrams;
  if (p.currentFiberIntakeGrams !== undefined) data.current_fiber_intake_grams = p.currentFiberIntakeGrams;
  if (p.recommendationHistoryCount !== undefined) data.recommendation_history_count = p.recommendationHistoryCount;
  if (p.memberSince !== undefined) data.member_since = p.memberSince;
  return data;
};

export const mapDailyLogFromDb = (row: any): DailyIntakeLogEntry => ({
  id: row.id,
  productId: row.product_id,
  productName: row.product_name,
  portionDescription: row.portion_description || '',
  mealTime: row.meal_time || 'morning-snack',
  servings: row.servings || 1,
  fiberGrams: Number(row.fiber_grams) || 0,
  resistantStarchGrams: Number(row.resistant_starch_grams) || 0,
  calories: Number(row.calories) || 0,
  proteinGrams: Number(row.protein_grams) || 0,
  timestamp: row.timestamp || 'Today'
});

export const mapDailyLogToDb = (entry: DailyIntakeLogEntry, userId?: string): Record<string, any> => ({
  id: entry.id,
  ...(userId ? { user_id: userId } : {}),
  product_id: entry.productId,
  product_name: entry.productName,
  portion_description: entry.portionDescription,
  meal_time: entry.mealTime,
  servings: entry.servings,
  fiber_grams: entry.fiberGrams,
  resistant_starch_grams: entry.resistantStarchGrams,
  calories: entry.calories,
  protein_grams: entry.proteinGrams,
  timestamp: entry.timestamp
});

export const mapSampleOrderFromDb = (row: any): SampleTrialOrder => ({
  id: row.id,
  orderNumber: row.order_number,
  date: row.date || 'Today',
  items: Array.isArray(row.items) ? row.items : [],
  recipientName: row.recipient_name,
  email: row.email,
  address: row.address,
  status: row.status || 'Pending Formulation',
  trialType: row.trial_type || 'Consumer Tasting',
  trackingNotes: row.tracking_notes || ''
});

export const mapSampleOrderToDb = (ord: SampleTrialOrder, userId?: string): Record<string, any> => ({
  id: ord.id,
  ...(userId ? { user_id: userId } : {}),
  order_number: ord.orderNumber,
  date: ord.date,
  items: ord.items,
  recipient_name: ord.recipientName,
  email: ord.email,
  address: ord.address,
  status: ord.status,
  trial_type: ord.trialType,
  tracking_notes: ord.trackingNotes || ''
});

export const mapSensoryTrialFromDb = (row: any): SensoryTrialEntry => ({
  id: row.id,
  productId: row.product_id,
  productName: row.product_name,
  batchCode: row.batch_code,
  panelistName: row.panelist_name,
  panelistType: row.panelist_type || 'Consumer Hedonic',
  date: row.date || 'Today',
  taste: Number(row.taste) || 0,
  texture: Number(row.texture) || 0,
  aroma: Number(row.aroma) || 0,
  appearance: Number(row.appearance) || 0,
  overallAcceptability: Number(row.overall_acceptability) || 0,
  hedonicScale9: Number(row.hedonic_scale9) || 8.0,
  panelNotes: row.panel_notes || ''
});

export const mapSensoryTrialToDb = (t: SensoryTrialEntry): Record<string, any> => ({
  id: t.id,
  product_id: t.productId,
  product_name: t.productName,
  batch_code: t.batchCode,
  panelist_name: t.panelistName,
  panelist_type: t.panelistType,
  date: t.date,
  taste: t.taste,
  texture: t.texture,
  aroma: t.aroma,
  appearance: t.appearance,
  overall_acceptability: t.overallAcceptability,
  hedonic_scale9: t.hedonicScale9,
  panel_notes: t.panelNotes
});

export const mapFamilyProfileFromDb = (row: any): ChildFamilyProfile => ({
  id: row.id,
  name: row.name,
  age: Number(row.age) || 0,
  allergies: Array.isArray(row.allergies) ? row.allergies : [],
  favoriteProducts: Array.isArray(row.favorite_products) ? row.favorite_products : [],
  fiberTarget: Number(row.fiber_target) || 20,
  notes: row.notes || ''
});

export const mapFamilyProfileToDb = (f: ChildFamilyProfile, userId?: string): Record<string, any> => ({
  id: f.id,
  ...(userId ? { user_id: userId } : {}),
  name: f.name,
  age: f.age,
  allergies: f.allergies,
  favorite_products: f.favoriteProducts,
  fiber_target: f.fiberTarget,
  notes: f.notes
});

export const mapAlertFromDb = (row: any): AlertNotification => ({
  id: row.id,
  title: row.title,
  message: row.message,
  type: row.type || 'info',
  date: row.date || 'Today',
  read: !!row.read
});
