'use client';

import React, { useState, useEffect } from 'react';
import { ViewType, UserProfile, DietPlan, DEFAULT_VISIBLE_NUTRIENTS, NutrientKey, FOOD_GROUPS, MEAL_TIMES, FoodItem, DailyRecord, MealTimeId, CartItem, CaseRecord, ActivityLevel } from '@/types';
import Sidebar from '@/components/Sidebar';
import ProfileView from '@/components/ProfileView';
import PlanningView from '@/components/PlanningView';
import CalculatorView from '@/components/CalculatorView';
import AnalysisView from '@/components/AnalysisView';
import HistoryView from '@/components/HistoryView';
import { User } from '@/components/Icons';

export default function Home() {
  // --- Global State ---
  const [activeView, setActiveView] = useState<ViewType>('profile');
  const [visibleNutrients, setVisibleNutrients] = useState<NutrientKey[]>(DEFAULT_VISIBLE_NUTRIENTS);
  const [foodDB, setFoodDB] = useState<FoodItem[]>([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(true);

  // Store imported food items globally so they persist across view changes
  const [extraFoods, setExtraFoods] = useState<FoodItem[]>([]);

  // Load food data from API
  useEffect(() => {
    const loadFoods = async () => {
      try {
        const response = await fetch('/api/foods');
        if (response.ok) {
          const data = await response.json();
          setFoodDB(data);
        } else {
          console.error('Failed to load food data');
        }
      } catch (error) {
        console.error('Error loading food data:', error);
      } finally {
        setIsLoadingFoods(false);
      }
    };
    loadFoods();
  }, []);

  // --- DEMO DATA ---
  const safeDemoRecord: DailyRecord = React.useMemo(() => {
    if (foodDB.length === 0) {
      const initialRecord: DailyRecord = {} as DailyRecord;
      MEAL_TIMES.forEach(m => {
        initialRecord[m.id] = [];
      });
      return initialRecord;
    }
    
    const findFood = (predicate: (f: FoodItem) => boolean): FoodItem | undefined => {
      return foodDB.find(predicate);
    };
    
    return {
      breakfast: [
        foodDB[0] ? { ...foodDB[0], quantity: 2 } : null,
        findFood(f => f.name.includes('雞蛋') || f.name.includes('蛋')) ? { ...findFood(f => f.name.includes('雞蛋') || f.name.includes('蛋'))!, quantity: 1 } : null
      ].filter((item): item is CartItem => item !== null),
      morning_snack: [],
      lunch: [
        findFood(f => f.name.includes('糙米') || f.name.includes('米飯')) ? { ...findFood(f => f.name.includes('糙米') || f.name.includes('米飯'))!, quantity: 1.5 } : null,
        findFood(f => f.name.includes('雞胸') || f.name.includes('雞肉')) ? { ...findFood(f => f.name.includes('雞胸') || f.name.includes('雞肉'))!, quantity: 1.2 } : null,
        findFood(f => f.category === '蔬菜') ? { ...findFood(f => f.category === '蔬菜')!, quantity: 2 } : null
      ].filter((item): item is CartItem => item !== null),
      afternoon_snack: [
        findFood(f => f.name.includes('香蕉')) ? { ...findFood(f => f.name.includes('香蕉'))!, quantity: 1 } : null
      ].filter((item): item is CartItem => item !== null),
      dinner: [
        findFood(f => f.name.includes('地瓜') || f.name.includes('甘藷')) ? { ...findFood(f => f.name.includes('地瓜') || f.name.includes('甘藷'))!, quantity: 1.5 } : null,
        findFood(f => f.name.includes('鮭魚') || f.name.includes('魚')) ? { ...findFood(f => f.name.includes('鮭魚') || f.name.includes('魚'))!, quantity: 1 } : null
      ].filter((item): item is CartItem => item !== null),
      evening_snack: []
    };
  }, [foodDB]);

  // Initialize empty portions matrix
  const initialPortions: any = {};
  FOOD_GROUPS.forEach(g => {
    initialPortions[g.id] = {};
    MEAL_TIMES.forEach(m => {
      initialPortions[g.id][m.id] = 0;
    });
  });

  // Pre-fill some portions for demo
  const demoPortions = JSON.parse(JSON.stringify(initialPortions));
  demoPortions.starch.breakfast = 3;
  demoPortions.meat_med.breakfast = 1;
  demoPortions.starch.lunch = 3;
  demoPortions.meat_low.lunch = 2;
  demoPortions.veg.lunch = 2;

  const DEMO_CASE: CaseRecord = React.useMemo(() => ({
    id: 'demo-case-001',
    timestamp: Date.now() - 172800000, // 2 days ago
    profile: {
      name: '範例個案 - 陳大明',
      height: 176,
      weight: 82,
      age: 45,
      gender: 'male',
      activityLevel: 'moderate',
      notes: '輕微高血壓，建議控制鈉攝取量 (<2300mg)。喜好麵食。'
    },
    plan: {
      targetCalories: 2200,
      targetP: 110,
      targetF: 73,
      targetC: 275,
      portions: demoPortions
    },
    record: safeDemoRecord,
    summary: {
      calories: { target: 2200, actual: 1850 },
      protein: { target: 110, actual: 95 },
      fat: { target: 73, actual: 60 },
      carb: { target: 275, actual: 210 }
    }
  }), [safeDemoRecord]);

  // Store Saved Cases with Demo Data
  const [savedCases, setSavedCases] = useState<CaseRecord[]>([]);
  
  // Initialize demo case when foodDB is loaded
  useEffect(() => {
    if (foodDB.length > 0 && savedCases.length === 0) {
      const demoCase: CaseRecord = {
        id: 'demo-case-001',
        timestamp: Date.now() - 172800000,
        profile: {
          name: '範例個案 - 陳大明',
          height: 176,
          weight: 82,
          age: 45,
          gender: 'male',
          activityLevel: 'moderate',
          notes: '輕微高血壓，建議控制鈉攝取量 (<2300mg)。喜好麵食。'
        },
        plan: {
          targetCalories: 2200,
          targetP: 110,
          targetF: 73,
          targetC: 275,
          portions: demoPortions
        },
        record: safeDemoRecord,
        summary: {
          calories: { target: 2200, actual: 1850 },
          protein: { target: 110, actual: 95 },
          fat: { target: 73, actual: 60 },
          carb: { target: 275, actual: 210 }
        }
      };
      setSavedCases([demoCase]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodDB.length]);

  const handleImport = (items: FoodItem[]) => {
    setExtraFoods((prev: FoodItem[]) => [...items, ...prev]);
  };

  // 1. User Profile (Assessment)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    height: 0,
    weight: 0,
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    notes: '',
    name: ''
  });

  // 2. Diet Plan (Prescription)
  const [dietPlan, setDietPlan] = useState<DietPlan>({
    targetCalories: 0,
    targetP: 0,
    targetF: 0,
    targetC: 0,
    portions: initialPortions
  });

  // 3. Daily Record (Log)
  const initialRecord: any = {};
  MEAL_TIMES.forEach(m => initialRecord[m.id] = []);
  
  const [dailyRecord, setDailyRecord] = useState<DailyRecord>(initialRecord);

  const handleAddToLog = (mealId: MealTimeId, items: CartItem[]) => {
    setDailyRecord((prev: DailyRecord) => ({
      ...prev,
      [mealId]: [...(prev[mealId] || []), ...items]
    }));
  };

  const handleRemoveFromLog = (mealId: string, index: number) => {
    setDailyRecord((prev: DailyRecord) => {
      const updatedList = [...prev[mealId as MealTimeId]];
      updatedList.splice(index, 1);
      return { ...prev, [mealId]: updatedList };
    });
  };

  // 4. Calculated TDEE (Shared between Profile and Planning)
  const [tdee, setTdee] = useState(2000);

  // Recalculate TDEE whenever profile changes
  React.useEffect(() => {
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
      setTdee(newTdee);
    }
  }, [userProfile]);

  // --- Save Case Logic ---
  const handleSaveCase = () => {
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

    setSavedCases((prev: CaseRecord[]) => [newCase, ...prev]);
    setActiveView('history');
    
    alert('儲存成功！');
  };

  // --- Load Case Logic (For Editing) ---
  const handleLoadCase = (record: CaseRecord) => {
    const newProfile = JSON.parse(JSON.stringify(record.profile));
    const newPlan = JSON.parse(JSON.stringify(record.plan));
    const newRecord = JSON.parse(JSON.stringify(record.record));

    setUserProfile(newProfile);
    setDietPlan(newPlan);
    setDailyRecord(newRecord);
    
    setActiveView('profile');
  };

  // Mobile Header
  const MobileHeader = () => (
    <div className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-50">
      <h1 className="text-lg font-bold text-slate-800">Nutri<span className="text-blue-600">Pro</span></h1>
      <div className="flex gap-2">
        <button onClick={() => setActiveView('profile')} className={`p-2 rounded-lg ${activeView === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}>
          <User className="w-5 h-5"/>
        </button>
      </div>
    </div>
  );

  if (isLoadingFoods) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">載入食材資料中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:flex-row">
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar 
        activeView={activeView} 
        onChangeView={setActiveView} 
        onImport={handleImport}
      />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {activeView === 'profile' && (
          <ProfileView 
            profile={userProfile} 
            onUpdate={setUserProfile} 
            onNext={() => setActiveView('planning')}
          />
        )}

        {activeView === 'planning' && (
          <PlanningView 
            plan={dietPlan} 
            tdee={tdee} 
            onUpdate={setDietPlan} 
            onNext={() => setActiveView('calculator')}
          />
        )}

        {activeView === 'calculator' && (
          <CalculatorView 
            dietPlan={dietPlan}
            visibleNutrients={visibleNutrients}
            setVisibleNutrients={setVisibleNutrients}
            extraFoods={extraFoods}
            dailyRecord={dailyRecord}
            onAddToLog={handleAddToLog}
            onRemoveFromLog={handleRemoveFromLog}
            onGoToAnalysis={() => setActiveView('analysis')}
            foodDB={foodDB}
          />
        )}

        {activeView === 'analysis' && (
          <AnalysisView 
            plan={dietPlan}
            dailyRecord={dailyRecord}
            onSave={handleSaveCase}
            onRemoveFromLog={handleRemoveFromLog}
          />
        )}

        {activeView === 'history' && (
          <HistoryView 
            savedCases={savedCases}
            onDelete={(id: string) => setSavedCases((prev: CaseRecord[]) => prev.filter((c: CaseRecord) => c.id !== id))}
            onLoad={handleLoadCase}
          />
        )}
      </main>
    </div>
  );
}

