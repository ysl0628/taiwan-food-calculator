
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
  { key: 'water', label: '水分', unit: 'g', group: 'macro' },
  { key: 'p', label: '蛋白質', unit: 'g', group: 'macro' },
  { key: 'f', label: '脂肪', unit: 'g', group: 'macro' },
  { key: 'c', label: '碳水', unit: 'g', group: 'macro' },
  { key: 'ash', label: '灰分', unit: 'g', group: 'macro' },

  // Details
  { key: 'fiber', label: '膳食纖維', unit: 'g', group: 'detail' },
  { key: 'sugar', label: '糖質', unit: 'g', group: 'detail' },
  { key: 'glucose', label: '葡萄糖', unit: 'g', group: 'detail' },
  { key: 'fructose', label: '果糖', unit: 'g', group: 'detail' },
  { key: 'sucrose', label: '蔗糖', unit: 'g', group: 'detail' },
  { key: 'lactose', label: '乳糖', unit: 'g', group: 'detail' },
  { key: 'sat_fat', label: '飽和脂肪', unit: 'g', group: 'detail' },
  { key: 'trans_fat', label: '反式脂肪', unit: 'g', group: 'detail' },
  { key: 'cholesterol', label: '膽固醇', unit: 'mg', group: 'detail' },
  { key: 'alcohol', label: '酒精', unit: 'g', group: 'detail' },

  // Minerals
  { key: 'sodium', label: '鈉', unit: 'mg', group: 'mineral' },
  { key: 'k', label: '鉀', unit: 'mg', group: 'mineral' },
  { key: 'ca', label: '鈣', unit: 'mg', group: 'mineral' },
  { key: 'mg', label: '鎂', unit: 'mg', group: 'mineral' },
  { key: 'fe', label: '鐵', unit: 'mg', group: 'mineral' },
  { key: 'zn', label: '鋅', unit: 'mg', group: 'mineral' },
  { key: 'p_min', label: '磷', unit: 'mg', group: 'mineral' },
  { key: 'cu', label: '銅', unit: 'mg', group: 'mineral' },
  { key: 'mn', label: '錳', unit: 'mg', group: 'mineral' },
  
  // Vitamins
  { key: 'vit_a', label: '維 A (RE)', unit: 'ug', group: 'vitamin' },
  { key: 'vit_a_iu', label: '維 A (IU)', unit: 'IU', group: 'vitamin' },
  { key: 'beta_carotene', label: 'β-胡蘿蔔素', unit: 'ug', group: 'vitamin' },
  { key: 'vit_d_ug', label: '維 D', unit: 'ug', group: 'vitamin' },
  { key: 'vit_d_iu', label: '維 D (IU)', unit: 'IU', group: 'vitamin' },
  { key: 'vit_e', label: '維 E (α-TE)', unit: 'mg', group: 'vitamin' },
  { key: 'vit_e_total', label: '維 E 總量', unit: 'mg', group: 'vitamin' },
  { key: 'vit_k1', label: '維 K1', unit: 'ug', group: 'vitamin' },
  { key: 'vit_c', label: '維 C', unit: 'mg', group: 'vitamin' },
  { key: 'vit_b1', label: '維 B1', unit: 'mg', group: 'vitamin' },
  { key: 'vit_b2', label: '維 B2', unit: 'mg', group: 'vitamin' },
  { key: 'niacin', label: '菸鹼素', unit: 'mg', group: 'vitamin' },
  { key: 'vit_b6', label: '維 B6', unit: 'mg', group: 'vitamin' },
  { key: 'vit_b12', label: '維 B12', unit: 'ug', group: 'vitamin' },
  { key: 'folic_acid', label: '葉酸', unit: 'ug', group: 'vitamin' },
  
  // Fatty Acids (Important ones)
  { key: 'sfa_total', label: '飽和脂肪酸總量', unit: 'mg', group: 'detail' },
  { key: 'mufa_total', label: '單元不飽和脂肪酸', unit: 'mg', group: 'detail' },
  { key: 'pufa_total', label: '多元不飽和脂肪酸', unit: 'mg', group: 'detail' },
  { key: 'linoleic_acid', label: '亞麻油酸 (18:2)', unit: 'mg', group: 'detail' },
  { key: 'linolenic_acid', label: '次亞麻油酸 (18:3)', unit: 'mg', group: 'detail' },
  { key: 'epa', label: 'EPA (20:5)', unit: 'mg', group: 'detail' },
  { key: 'dha', label: 'DHA (22:6)', unit: 'mg', group: 'detail' },
  { key: 'arachidonic_acid', label: '花生油酸 (20:4)', unit: 'mg', group: 'detail' },
  
  // Essential Amino Acids
  { key: 'total_amino_acids', label: '胺基酸總量', unit: 'mg', group: 'detail' },
  { key: 'tryptophan', label: '色胺酸', unit: 'mg', group: 'detail' },
  { key: 'lysine', label: '離胺酸', unit: 'mg', group: 'detail' },
  { key: 'methionine', label: '甲硫胺酸', unit: 'mg', group: 'detail' },
  { key: 'phenylalanine', label: '苯丙胺酸', unit: 'mg', group: 'detail' },
  { key: 'threonine', label: '酥胺酸', unit: 'mg', group: 'detail' },
  { key: 'valine', label: '纈胺酸', unit: 'mg', group: 'detail' },
  { key: 'leucine', label: '白胺酸', unit: 'mg', group: 'detail' },
  { key: 'isoleucine', label: '異白胺酸', unit: 'mg', group: 'detail' },
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
