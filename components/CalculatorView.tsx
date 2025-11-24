
import React, { useState, useEffect, useRef } from 'react';
import { FoodItem, CartItem, Category, CATEGORIES, NutrientKey, DietPlan, DailyRecord, MealTimeId, MEAL_TIMES } from '@/types';
import { Search, Activity, Plus, Target, X, PieChart, ChevronRight, ClipboardList, Trash2 } from './Icons';
import FoodCard from './FoodCard';
import Cart from './Cart';
import NutrientSettings from './NutrientSettings';
interface CalculatorViewProps {
  dietPlan: DietPlan;
  visibleNutrients: NutrientKey[];
  setVisibleNutrients: (nutrients: NutrientKey[]) => void;
  extraFoods?: FoodItem[];
  dailyRecord: DailyRecord; // To calculate existing progress
  onAddToLog: (mealId: MealTimeId, items: CartItem[]) => void;
  onRemoveFromLog: (mealId: MealTimeId, index: number) => void;
  onGoToAnalysis: () => void;
  foodDB: FoodItem[];
}

// --- Sub-component: Progress Bar ---
const ProgressBar = ({ label, current, target, color }: { label: string, current: number, target: number, color: string }) => {
    const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    return (
        <div className="flex-1 min-w-[100px]">
            <div className="flex justify-between text-[10px] mb-1 font-medium">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-700 font-mono">{Math.round(current)} / {target}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    )
}

// --- Sub-component: Dashboard Content ---
const ProgressDashboard = ({ current, target, onAnalysis }: { current: any, target: DietPlan, onAnalysis: () => void }) => (
    <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
               <Target className="w-4 h-4 text-blue-500" /> 整日攝取進度 (日記 + 暫存)
           </div>
           <button 
             onClick={onAnalysis}
             className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
           >
             <PieChart className="w-3 h-3" />
             分析
             <ChevronRight className="w-3 h-3" />
           </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <ProgressBar label="熱量 (kcal)" current={current.cal} target={target.targetCalories} color="bg-slate-800" />
            <ProgressBar label="蛋白質 (g)" current={current.p} target={target.targetP} color="bg-blue-500" />
            <ProgressBar label="脂肪 (g)" current={current.f} target={target.targetF} color="bg-yellow-500" />
            <ProgressBar label="碳水 (g)" current={current.c} target={target.targetC} color="bg-orange-500" />
        </div>
    </div>
);

const CalculatorView: React.FC<CalculatorViewProps> = ({ 
  dietPlan, 
  visibleNutrients, 
  setVisibleNutrients, 
  extraFoods = [],
  dailyRecord,
  onAddToLog,
  onRemoveFromLog,
  onGoToAnalysis,
  foodDB
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false); // Drawer State
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Mobile Floating Button State
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);
  const [isProgressPopupOpen, setIsProgressPopupOpen] = useState(false);
  
  // Ref for scroll container to handle floating button visibility
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Calculate Totals from Saved Record
  const recordTotals = Object.values(dailyRecord).flat().reduce((acc, item) => ({
      cal: acc.cal + (item.cal * item.quantity),
      p: acc.p + (item.p * item.quantity),
      f: acc.f + (item.f * item.quantity),
      c: acc.c + (item.c * item.quantity),
  }), { cal: 0, p: 0, f: 0, c: 0 });

  // 2. Calculate Totals from Current Cart
  const cartTotals = cartItems.reduce((acc, item) => ({
      cal: acc.cal + (item.cal * item.quantity),
      p: acc.p + (item.p * item.quantity),
      f: acc.f + (item.f * item.quantity),
      c: acc.c + (item.c * item.quantity),
  }), { cal: 0, p: 0, f: 0, c: 0 });

  // 3. Combined Progress
  const combinedTotals = {
      cal: recordTotals.cal + cartTotals.cal,
      p: recordTotals.p + cartTotals.p,
      f: recordTotals.f + cartTotals.f,
      c: recordTotals.c + cartTotals.c,
  };

  const totalLoggedItems = Object.values(dailyRecord).reduce((acc, items) => acc + items.length, 0);

  // Scroll Listener for Mobile Floating Button attached to the container
  useEffect(() => {
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        // Show button if scrolled down more than 100px on mobile/tablet
        if (scrollContainerRef.current.scrollTop > 100 && window.innerWidth < 1024) {
            setShowFloatingBtn(true);
        } else {
            setShowFloatingBtn(false);
        }
    };

    const el = scrollContainerRef.current;
    if (el) {
        el.addEventListener('scroll', handleScroll);
    }
    return () => {
        if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchData(0, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, foodDB]);

  const fetchData = async (pageNum: number, reset: boolean) => {
    setIsLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      let filteredData = [...foodDB];

      // Search Logic
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.name.toLowerCase().includes(lowerSearch) || 
          (item.alias && item.alias.toLowerCase().includes(lowerSearch))
        );
      }

      // Category Filter
      if (selectedCategory !== 'All') {
        filteredData = filteredData.filter(item => item.category === selectedCategory);
      }

      // Pagination
      const limit = 20;
      const from = pageNum * limit;
      const to = from + limit;
      const foods = filteredData.slice(from, to);

      if (reset) {
        setFoodItems(foods);
      } else {
        setFoodItems(prev => [...prev, ...foods]);
      }
      if (foods.length < 20) setHasMore(false);
      else setHasMore(true);

    } catch (error) {
      console.error("Failed to fetch foods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, false);
    }
  };

  const addToCart = (item: FoodItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) => prev.map((item) => {
        if (item.id === id) return { ...item, quantity: Math.max(0.1, item.quantity + delta) };
        return item;
      }));
  };

  const setExactQuantity = (id: string, quantity: number) => {
    setCartItems((prev) => prev.map((item) => item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item));
  };

  const toggleNutrient = (key: NutrientKey) => {
    if (visibleNutrients.includes(key)) {
      if (key === 'cal' && visibleNutrients.length === 1) return; 
      setVisibleNutrients(visibleNutrients.filter(k => k !== key));
    } else {
      setVisibleNutrients([...visibleNutrients, key]);
    }
  };

  // Filter extra foods based on current search/category
  const filteredExtraFoods = extraFoods.filter(item => {
      const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.alias && item.alias.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  const handleSaveToLog = (mealId: MealTimeId) => {
      onAddToLog(mealId, cartItems);
      setCartItems([]); // Clear cart after saving
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen bg-slate-50">
      <NutrientSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        visibleNutrients={visibleNutrients}
        onToggle={toggleNutrient}
      />

      {/* --- Right Drawer for Daily Log --- */}
      {isLogDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsLogDrawerOpen(false)}
            />
            
            {/* Drawer Content */}
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">今日已記錄餐點</h2>
                            <p className="text-xs text-slate-500">已儲存的飲食內容</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsLogDrawerOpen(false)}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                    {totalLoggedItems === 0 ? (
                         <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <ClipboardList className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-medium">尚未記錄任何餐點</p>
                            <p className="text-xs mt-1">請從搜尋頁面加入食物</p>
                        </div>
                    ) : (
                        MEAL_TIMES.map(meal => {
                            const items = dailyRecord[meal.id] || [];
                            if (items.length === 0) return null;
                            
                            const mealCalories = items.reduce((sum, item) => sum + (item.cal * item.quantity), 0);

                            return (
                                <div key={meal.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-slate-700">{meal.label}</h3>
                                        <span className="text-xs font-mono font-medium text-slate-500">{Math.round(mealCalories)} kcal</span>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {items.map((item, idx) => (
                                            <div key={`${meal.id}-${idx}`} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-bold text-slate-800">{item.name}</span>
                                                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {Math.round(item.quantity * 100)}g
                                                        <span className="mx-1.5 opacity-30">|</span>
                                                        {Math.round(item.cal * item.quantity)} kcal
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => onRemoveFromLog(meal.id, idx)}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="刪除此項目"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                     <button 
                        onClick={onGoToAnalysis}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <PieChart className="w-4 h-4" />
                        前往成效分析
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Progress Header (Fixed on Desktop) */}
      <div className="hidden lg:block flex-shrink-0 w-full bg-slate-50/95 backdrop-blur-md border-b border-slate-200 shadow-sm z-30">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
            <ProgressDashboard current={combinedTotals} target={dietPlan} onAnalysis={onGoToAnalysis} />
          </div>
      </div>

      {/* Main Content Area (Flex Grow, Hidden Overflow) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full overflow-hidden">
        
        {/* Left Column: Search & List */}
        <div className="flex-1 min-w-0 flex flex-col h-full">
            
            {/* Search Bar (Fixed in Flex Col) */}
            <div className="flex-shrink-0 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center mb-4 z-20">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                    type="text"
                    placeholder="搜尋食物..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                selectedCategory === cat ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                            >
                            {cat === 'All' ? '全部' : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Food Grid Container */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin scrollbar-thumb-slate-200"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-24 lg:pb-4">
                    {filteredExtraFoods.map((item) => (
                    <FoodCard 
                        key={item.id} 
                        item={item} 
                        onAdd={addToCart}
                        visibleNutrients={visibleNutrients}
                    />
                    ))}
                    {foodItems.map((item) => (
                    <FoodCard 
                        key={item.id} 
                        item={item} 
                        onAdd={addToCart}
                        visibleNutrients={visibleNutrients}
                    />
                    ))}
                </div>
                {hasMore && (
                    <div className="mt-4 mb-8 text-center pb-20 lg:pb-0">
                        <button onClick={loadMore} disabled={isLoading} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 flex items-center gap-2 mx-auto">
                            {isLoading ? <Activity className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {isLoading ? '載入中...' : '載入更多'}
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Cart Sidebar */}
        <div className="lg:w-[360px] flex-shrink-0 h-full">
            <Cart 
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onSetQuantity={setExactQuantity}
                onRemove={(id) => setCartItems(prev => prev.filter(i => i.id !== id))}
                onClear={() => setCartItems([])}
                visibleNutrients={visibleNutrients}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onAddToLog={handleSaveToLog}
                onGoToAnalysis={onGoToAnalysis}
                onOpenLog={() => setIsLogDrawerOpen(true)}
            />
        </div>
      </div>

      {/* Mobile Floating Button */}
      <button 
        onClick={() => setIsProgressPopupOpen(true)}
        className={`
            fixed right-4 bottom-24 z-40 lg:hidden
            w-12 h-12 bg-slate-900 text-white rounded-full shadow-xl shadow-slate-900/30
            flex items-center justify-center transition-all duration-300
            ${showFloatingBtn ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10'}
        `}
      >
          <Target className="w-6 h-6" />
      </button>

      {/* Mobile Progress Popup */}
      {isProgressPopupOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden flex items-end sm:items-center justify-center p-4 pb-6">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsProgressPopupOpen(false)} />
              <div className="relative bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-10">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800">目前攝取進度</h3>
                      <button onClick={() => setIsProgressPopupOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <ProgressDashboard current={combinedTotals} target={dietPlan} onAnalysis={onGoToAnalysis} />
              </div>
          </div>
      )}

    </div>
  );
};

export default CalculatorView;
