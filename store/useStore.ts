import { create } from 'zustand';
import { UserProfile, DietPlan, DailyRecord, NutrientKey, FoodItem, CaseRecord, MealTimeId, CartItem, DEFAULT_VISIBLE_NUTRIENTS, ActivityLevel, MEAL_TIMES, FOOD_GROUPS } from '@/types';

interface AppState {
  // Food Data
  foodDB: FoodItem[];
  isLoadingFoods: boolean;
  extraFoods: FoodItem[];
  setFoodDB: (foods: FoodItem[]) => void;
  setIsLoadingFoods: (loading: boolean) => void;
  addExtraFoods: (foods: FoodItem[]) => void;

  // User Profile
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  tdee: number;
  calculateTDEE: () => void;

  // Diet Plan
  dietPlan: DietPlan;
  setDietPlan: (plan: DietPlan) => void;

  // Daily Record
  dailyRecord: DailyRecord;
  addToLog: (mealId: MealTimeId, items: CartItem[]) => void;
  removeFromLog: (mealId: MealTimeId, index: number) => void;

  // Visible Nutrients
  visibleNutrients: NutrientKey[];
  setVisibleNutrients: (nutrients: NutrientKey[]) => void;

  // Saved Cases
  savedCases: CaseRecord[];
  saveCase: () => void;
  deleteCase: (id: string) => void;
  loadCase: (caseRecord: CaseRecord) => void;
  initializeDemoCase: (demoCase: CaseRecord) => void;
}

const initialPortions: any = {};
FOOD_GROUPS.forEach(g => {
  initialPortions[g.id] = {};
  MEAL_TIMES.forEach(m => {
    initialPortions[g.id][m.id] = 0;
  });
});

const initialRecord: DailyRecord = {} as DailyRecord;
MEAL_TIMES.forEach(m => {
  initialRecord[m.id] = [];
});

export const useStore = create<AppState>((set, get) => ({
  // Food Data
  foodDB: [],
  isLoadingFoods: true,
  extraFoods: [],
  setFoodDB: (foods) => set({ foodDB: foods }),
  setIsLoadingFoods: (loading) => set({ isLoadingFoods: loading }),
  addExtraFoods: (foods) => set((state) => ({ extraFoods: [...foods, ...state.extraFoods] })),

  // User Profile
  userProfile: {
    height: 0,
    weight: 0,
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    notes: '',
    name: ''
  },
  setUserProfile: (profile) => {
    set({ userProfile: profile });
    get().calculateTDEE();
  },
  tdee: 2000,
  calculateTDEE: () => {
    const { userProfile } = get();
    if (userProfile.height && userProfile.weight && userProfile.age) {
      const s = userProfile.gender === 'male' ? 5 : -161;
      const bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + s;
      const multipliers: Record<ActivityLevel, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      const newTdee = Math.round(bmr * multipliers[userProfile.activityLevel]);
      set({ tdee: newTdee });
    }
  },

  // Diet Plan
  dietPlan: {
    targetCalories: 0,
    targetP: 0,
    targetF: 0,
    targetC: 0,
    portions: initialPortions
  },
  setDietPlan: (plan) => set({ dietPlan: plan }),

  // Daily Record
  dailyRecord: initialRecord,
  addToLog: (mealId, items) => {
    set((state) => ({
      dailyRecord: {
        ...state.dailyRecord,
        [mealId]: [...(state.dailyRecord[mealId] || []), ...items]
      }
    }));
  },
  removeFromLog: (mealId, index) => {
    set((state) => {
      const updatedList = [...state.dailyRecord[mealId]];
      updatedList.splice(index, 1);
      return {
        dailyRecord: {
          ...state.dailyRecord,
          [mealId]: updatedList
        }
      };
    });
  },

  // Visible Nutrients
  visibleNutrients: DEFAULT_VISIBLE_NUTRIENTS,
  setVisibleNutrients: (nutrients) => set({ visibleNutrients: nutrients }),

  // Saved Cases
  savedCases: [],
  saveCase: () => {
    const { dailyRecord, dietPlan, userProfile } = get();
    const allItems: CartItem[] = Object.values(dailyRecord).flat() as CartItem[];
    const actual = allItems.reduce<{ cal: number; p: number; f: number; c: number }>((acc, item) => ({
      cal: acc.cal + item.cal * item.quantity,
      p: acc.p + item.p * item.quantity,
      f: acc.f + item.f * item.quantity,
      c: acc.c + item.c * item.quantity,
    }), { cal: 0, p: 0, f: 0, c: 0 });

    const newCase: CaseRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      profile: { ...userProfile },
      plan: { ...dietPlan },
      record: { ...dailyRecord },
      summary: {
        calories: { target: dietPlan.targetCalories, actual: actual.cal },
        protein: { target: dietPlan.targetP, actual: actual.p },
        fat: { target: dietPlan.targetF, actual: actual.f },
        carb: { target: dietPlan.targetC, actual: actual.c },
      }
    };

    set((state) => ({ savedCases: [newCase, ...state.savedCases] }));
  },
  deleteCase: (id) => {
    set((state) => ({ savedCases: state.savedCases.filter(c => c.id !== id) }));
  },
  loadCase: (caseRecord) => {
    set({
      userProfile: { ...caseRecord.profile },
      dietPlan: { ...caseRecord.plan },
      dailyRecord: { ...caseRecord.record }
    });
    get().calculateTDEE();
  },
  initializeDemoCase: (demoCase) => {
    set((state) => {
      // Only initialize if no cases exist
      if (state.savedCases.length === 0) {
        return { savedCases: [demoCase] };
      }
      return state;
    });
  }
}));

