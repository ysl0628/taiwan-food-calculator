
import React, { useMemo, useState, useEffect } from 'react';
import { CartItem, NUTRIENT_METADATA, NutrientKey, MEAL_TIMES, MealTimeId } from '@/types';
import { Trash2, Plus, Minus, Utensils, ChevronUp, ChevronDown, Settings, Save, PieChart, ClipboardList } from './Icons';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  visibleNutrients: NutrientKey[];
  onOpenSettings: () => void;
  // New props for logging
  onAddToLog: (mealId: MealTimeId) => void;
  onGoToAnalysis: () => void;
  onOpenLog: () => void;
}

const Cart: React.FC<CartProps> = ({ 
  items, 
  onUpdateQuantity, 
  onSetQuantity, 
  onRemove, 
  onClear, 
  visibleNutrients, 
  onOpenSettings,
  onAddToLog,
  onGoToAnalysis,
  onOpenLog
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealTimeId>('lunch');
  const isEmpty = items.length === 0;

  // Auto-open cart on mobile when first item is added
  useEffect(() => {
    if (!isEmpty && window.innerWidth < 1024) {
      // setIsOpen(true); 
    }
  }, [isEmpty]);

  // Dynamic Calculation of Totals based on Visible Nutrients
  const totals = useMemo(() => {
    const initialTotals: Record<string, number> = {};
    
    // Initialize with 0 for all visible nutrients
    visibleNutrients.forEach(key => initialTotals[key] = 0);

    return items.reduce((acc, item) => {
      visibleNutrients.forEach(key => {
        const val = item[key as keyof CartItem] || 0;
        if (typeof val === 'number') {
            acc[key] = (acc[key] || 0) + val * item.quantity;
        }
      });
      return acc;
    }, initialTotals);
  }, [items, visibleNutrients]);

  const totalCalories = Math.round(totals['cal'] || 0);
  const itemCount = items.length;

  const toggleCart = () => {
    if (window.innerWidth < 1024) { 
      setIsOpen(!isOpen);
    }
  };

  // Helper to render a stat box
  const renderStatBox = (key: NutrientKey) => {
    const meta = NUTRIENT_METADATA.find(m => m.key === key);
    if (!meta) return null;
    const value = totals[key] || 0;
    
    // Color logic
    let borderColor = 'border-slate-100';
    let textColor = 'text-slate-700';
    let bgColor = 'bg-slate-50';

    if (meta.group === 'macro') {
        if (key === 'p') { bgColor = 'bg-blue-50'; borderColor = 'border-blue-100'; textColor = 'text-blue-700'; }
        if (key === 'f') { bgColor = 'bg-yellow-50'; borderColor = 'border-yellow-100'; textColor = 'text-yellow-700'; }
        if (key === 'c') { bgColor = 'bg-orange-50'; borderColor = 'border-orange-100'; textColor = 'text-orange-700'; }
    } else if (meta.group === 'vitamin') {
        textColor = 'text-green-700'; bgColor = 'bg-green-50/50';
    } else if (meta.group === 'mineral') {
        textColor = 'text-indigo-700'; bgColor = 'bg-indigo-50/50';
    }

    // Formatting Logic for Totals
    const displayValue = key === 'cal' 
        ? Math.round(value) 
        : value.toFixed(1);

    return (
        <div key={key} className={`p-2 rounded-lg border flex flex-col items-center justify-center ${bgColor} ${borderColor}`}>
            <div className={`text-[9px] font-bold uppercase opacity-60 ${textColor}`}>{meta.label}</div>
            <div className={`text-sm font-bold font-mono leading-tight ${textColor}`}>
                {displayValue}
                <span className="text-[8px] ml-0.5 opacity-70 font-normal">{meta.unit}</span>
            </div>
        </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-[1px] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        bg-white flex flex-col
        border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]
        
        /* Mobile (< 1024px) */
        fixed bottom-0 left-0 right-0 top-auto z-50
        transition-[height,border-radius] duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        /* Reduced max-height to 80vh to prevent overflowing screen on tablets */
        ${isOpen ? 'h-[80vh] rounded-t-2xl' : 'h-[72px] rounded-t-xl'} 

        /* Desktop (>= 1024px) */
        lg:static lg:h-[calc(100vh-8rem)] lg:w-full lg:rounded-2xl lg:shadow-sm lg:border lg:border-slate-100
        lg:transition-none lg:transform-none
      `}>
        
        {/* Header */}
        <div 
          className="flex-shrink-0 h-[72px] lg:h-auto p-4 border-b lg:border-b-0 border-slate-100 bg-white flex justify-between items-center cursor-pointer lg:cursor-default rounded-t-xl lg:rounded-t-2xl select-none relative z-20"
          onClick={toggleCart}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg relative transition-colors ${isEmpty ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
              <Utensils className="w-5 h-5" />
              {!isEmpty && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white lg:hidden">
                  {itemCount}
                </span>
              )}
            </div>
            
            <div className="flex flex-col justify-center">
              <h2 className="font-bold text-slate-800 text-sm lg:text-base leading-tight flex items-center gap-2">
                飲食暫存盤
                <button onClick={(e) => { e.stopPropagation(); onOpenSettings(); }} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 lg:hidden">
                  <Settings className="w-3 h-3" />
                </button>
              </h2>
              <div className="lg:hidden text-xs text-slate-500 leading-tight mt-0.5">
                {isEmpty ? '尚未選擇食物' : `熱量: ${totalCalories} kcal`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <button 
               onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
               className="hidden lg:flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
             >
               <Settings className="w-3 h-3" />
               設定
             </button>
             {!isEmpty && (
               <div className="hidden lg:block text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
                 {itemCount} 項
               </div>
             )}
          </div>

          <div className="lg:hidden text-slate-400">
             {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </div>
        </div>

        {/* Content */}
        <div className={`${isOpen ? 'flex' : 'hidden lg:flex'} flex-col flex-1 min-h-0 overflow-hidden relative z-10`}>
          
          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
            {isEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Utensils className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-sm font-medium text-slate-900 mb-1">暫存盤是空的</h3>
                <p className="text-slate-500 text-xs max-w-[200px] mb-4">
                  加入食物後，您可以將其記錄到特定的餐次（如早餐、午餐）。
                </p>
                <button 
                  onClick={onOpenLog}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all"
                >
                  <ClipboardList className="w-3 h-3" />
                  查看今日紀錄
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex gap-3 items-center group">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{item.name}</h4>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                        className="text-slate-300 hover:text-red-500 p-1 -mr-1 -mt-1 rounded-full hover:bg-red-50 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 mb-2">{item.category}</div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, -0.5); }}
                          className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                          title="-50g"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        
                        {/* Gram Input */}
                        <div className="flex items-center px-1">
                           <input 
                             type="number"
                             min="0"
                             onClick={(e) => e.stopPropagation()}
                             value={Math.round(item.quantity * 100)}
                             onChange={(e) => {
                               const grams = parseFloat(e.target.value);
                               if (!isNaN(grams)) {
                                 onSetQuantity(item.id, grams / 100);
                               }
                             }}
                             className="w-10 text-center text-xs font-bold font-mono text-slate-800 bg-transparent border-b border-transparent focus:border-blue-500 outline-none p-0 appearance-none"
                           />
                           <span className="text-[10px] text-slate-400 font-medium">g</span>
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, 0.5); }}
                          className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                          title="+50g"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* Total Calories Display */}
                      <div className="flex flex-col items-end">
                        <div className="text-sm font-bold text-slate-900 leading-none">
                          {Math.round(item.cal * item.quantity)} <span className="text-[10px] font-normal text-slate-400">kcal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Dynamic Footer */}
            <div className="flex-shrink-0 mt-auto border-t border-slate-200 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-20 flex flex-col max-h-[50vh]">
              
              {/* Scrollable Grid for Nutrients (Only show if not empty) */}
              {!isEmpty && (
                <div className="flex-1 overflow-y-auto p-4 border-b border-slate-100 scrollbar-thin bg-slate-50/30">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {visibleNutrients.map(renderStatBox)}
                    </div>
                </div>
              )}

              {/* Meal Log Actions */}
              <div className="p-4 space-y-3">
                {!isEmpty ? (
                  <>
                    <div className="flex items-center gap-2">
                        <select 
                            value={selectedMeal}
                            onChange={(e) => setSelectedMeal(e.target.value as MealTimeId)}
                            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-medium outline-none"
                        >
                            {MEAL_TIMES.map(m => (
                                <option key={m.id} value={m.id}>{m.label}</option>
                            ))}
                        </select>
                        <button 
                            onClick={() => onAddToLog(selectedMeal)}
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                        >
                            <Save className="w-4 h-4" />
                            記錄
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-1">
                        <button 
                            onClick={onOpenLog}
                            className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 px-1"
                        >
                            <ClipboardList className="w-3 h-3" />
                            查看今日紀錄
                        </button>
                        <button 
                            onClick={onClear}
                            className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1 px-1"
                        >
                            <Trash2 className="w-3 h-3" />
                            清空暫存
                        </button>
                    </div>
                  </>
                ) : (
                   <div className="flex items-center gap-2">
                      <button 
                         onClick={onOpenLog}
                         className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                      >
                         <ClipboardList className="w-4 h-4" />
                         查看今日紀錄
                      </button>
                   </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
