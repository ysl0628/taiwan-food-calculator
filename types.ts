
export interface FoodItem {
  id: string;
  name: string; // 樣品名稱 (Sample Name)
  alias?: string; // 俗名 (Common Name)
  category: string;
  cal: number; // kcal
  p: number;   // protein (g)
  f: number;   // fat (g)
  c: number;   // carbs (g)
  
  // Dynamic access for mapping
  [key: string]: any; 

  // Advanced nutrients (Optional, from Supabase foods_pro)
  sugar?: number;      // g
  fiber?: number;      // g
  sodium?: number;     // mg (na)
  cholesterol?: number;// mg
  sat_fat?: number;    // g
  trans_fat?: number;  // g

  // Minerals
  k?: number;          // 鉀 (mg)
  ca?: number;         // 鈣 (mg)
  mg?: number;         // 鎂 (mg)
  fe?: number;         // 鐵 (mg)
  zn?: number;         // 鋅 (mg)
  p_min?: number;      // 磷 (mg)
  cu?: number;         // 銅 (mg)
  mn?: number;         // 錳 (mg)

  // Vitamins
  vit_a?: number;      // RE (ug)
  vit_b1?: number;     // mg
  vit_b2?: number;     // mg
  vit_b6?: number;     // mg
  vit_b12?: number;    // ug
  vit_c?: number;      // mg
  vit_e?: number;      // alpha-TE (mg)
  folic_acid?: number; // ug
  niacin?: number;     // mg
}

export interface CartItem extends FoodItem {
  quantity: number; // units of 100g or 1 serving
}

export const CATEGORIES = [
  "All",
  "全穀雜糧",
  "豆魚蛋肉",
  "海鮮",
  "蔬菜",
  "水果",
  "乳品",
  "油脂/其他"
] as const;

export type Category = typeof CATEGORIES[number];

// --- Nutrient Configuration ---

export type NutrientKey = keyof Omit<FoodItem, 'id' | 'name' | 'category' | 'alias'>;

interface NutrientMeta {
  key: NutrientKey;
  label: string;
  unit: string;
  group: 'macro' | 'detail' | 'mineral' | 'vitamin';
}

export const NUTRIENT_METADATA: NutrientMeta[] = [
  // Macros (Always vital)
  { key: 'cal', label: '熱量', unit: 'kcal', group: 'macro' },
  { key: 'p', label: '蛋白質', unit: 'g', group: 'macro' },
  { key: 'f', label: '脂肪', unit: 'g', group: 'macro' },
  { key: 'c', label: '碳水', unit: 'g', group: 'macro' },

  // Details
  { key: 'fiber', label: '膳食纖維', unit: 'g', group: 'detail' },
  { key: 'sugar', label: '糖質', unit: 'g', group: 'detail' },
  { key: 'sat_fat', label: '飽和脂肪', unit: 'g', group: 'detail' },
  { key: 'trans_fat', label: '反式脂肪', unit: 'g', group: 'detail' },
  { key: 'cholesterol', label: '膽固醇', unit: 'mg', group: 'detail' },

  // Minerals
  { key: 'sodium', label: '鈉', unit: 'mg', group: 'mineral' }, // mapped from 'na'
  { key: 'k', label: '鉀', unit: 'mg', group: 'mineral' },
  { key: 'ca', label: '鈣', unit: 'mg', group: 'mineral' },
  { key: 'mg', label: '鎂', unit: 'mg', group: 'mineral' },
  { key: 'fe', label: '鐵', unit: 'mg', group: 'mineral' },
  { key: 'zn', label: '鋅', unit: 'mg', group: 'mineral' },
  { key: 'p_min', label: '磷', unit: 'mg', group: 'mineral' },
  
  // Vitamins
  { key: 'vit_a', label: '維 A', unit: 'ug', group: 'vitamin' },
  { key: 'vit_c', label: '維 C', unit: 'mg', group: 'vitamin' },
  { key: 'vit_b1', label: '維 B1', unit: 'mg', group: 'vitamin' },
  { key: 'vit_b2', label: '維 B2', unit: 'mg', group: 'vitamin' },
  { key: 'vit_b6', label: '維 B6', unit: 'mg', group: 'vitamin' },
  { key: 'vit_b12', label: '維 B12', unit: 'ug', group: 'vitamin' },
  { key: 'vit_e', label: '維 E', unit: 'mg', group: 'vitamin' },
  { key: 'folic_acid', label: '葉酸', unit: 'ug', group: 'vitamin' },
];

// Default visible nutrients for a clean start
export const DEFAULT_VISIBLE_NUTRIENTS: NutrientKey[] = ['cal', 'p', 'f', 'c', 'fiber', 'sodium'];

// --- Dietitian Workflow Types ---

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface UserProfile {
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  name?: string;
  notes?: string;
}

// --- Exchange System Types ---

export type FoodGroupId = 
  | 'starch' 
  | 'meat_low' 
  | 'meat_med' 
  | 'dairy_low' 
  | 'dairy_med' 
  | 'veg' 
  | 'fruit' 
  | 'fat' 
  | 'nut';

export type MealTimeId = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';

export const MEAL_TIMES: { id: MealTimeId; label: string }[] = [
  { id: 'breakfast', label: '早餐' },
  { id: 'morning_snack', label: '早點' },
  { id: 'lunch', label: '午餐' },
  { id: 'afternoon_snack', label: '午點' },
  { id: 'dinner', label: '晚餐' },
  { id: 'evening_snack', label: '晚點' },
];

export const FOOD_GROUPS: { id: FoodGroupId; label: string; color: string }[] = [
  { id: 'starch', label: '全榖雜糧類', color: 'bg-amber-50 text-amber-800' },
  { id: 'meat_low', label: '豆魚蛋肉(低脂)', color: 'bg-red-50 text-red-800' },
  { id: 'meat_med', label: '豆魚蛋肉(中脂)', color: 'bg-red-100 text-red-900' },
  { id: 'dairy_low', label: '乳品類(低脂)', color: 'bg-blue-50 text-blue-800' },
  { id: 'dairy_med', label: '乳品類(中脂)', color: 'bg-blue-100 text-blue-900' },
  { id: 'veg', label: '蔬菜類', color: 'bg-emerald-50 text-emerald-800' },
  { id: 'fruit', label: '水果類', color: 'bg-rose-50 text-rose-800' },
  { id: 'fat', label: '油脂類', color: 'bg-yellow-50 text-yellow-800' },
  { id: 'nut', label: '堅果種子類', color: 'bg-yellow-100 text-yellow-900' },
];

export interface ExchangeStandard {
  p: number;
  f: number;
  c: number;
  cal: number;
}

export const EXCHANGE_STANDARDS: Record<FoodGroupId, ExchangeStandard> = {
  starch:     { p: 2, f: 0, c: 15, cal: 70 },
  meat_low:   { p: 7, f: 3, c: 0,  cal: 55 },
  meat_med:   { p: 7, f: 5, c: 0,  cal: 75 },
  dairy_low:  { p: 8, f: 4, c: 12, cal: 120 },
  dairy_med:  { p: 8, f: 8, c: 12, cal: 150 },
  veg:        { p: 1, f: 0, c: 5,  cal: 25 },
  fruit:      { p: 0, f: 0, c: 15, cal: 60 },
  fat:        { p: 0, f: 5, c: 0,  cal: 45 },
  nut:        { p: 0, f: 5, c: 0,  cal: 45 },
};

export interface DietPlan {
  targetCalories: number;
  targetP: number;
  targetF: number;
  targetC: number;
  portions: Record<FoodGroupId, Record<MealTimeId, number>>;
}

// --- Meal Log Types ---

// Stores the actual food items recorded for each meal
export type DailyRecord = Record<MealTimeId, CartItem[]>;

export type ViewType = 'profile' | 'planning' | 'calculator' | 'analysis' | 'history';

export interface CaseRecord {
  id: string;
  timestamp: number;
  profile: UserProfile;
  plan: DietPlan;
  record: DailyRecord;
  summary: {
    calories: { target: number; actual: number };
    protein: { target: number; actual: number };
    fat: { target: number; actual: number };
    carb: { target: number; actual: number };
  }
}
