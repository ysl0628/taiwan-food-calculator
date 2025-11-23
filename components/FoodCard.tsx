
import React, { useState } from 'react';
import { FoodItem, NUTRIENT_METADATA, NutrientKey } from '@/types';
import { Plus, Info } from './Icons';
import FoodDetailDialog from './FoodDetailDialog';

interface FoodCardProps {
  item: FoodItem;
  onAdd: (item: FoodItem) => void;
  visibleNutrients: NutrientKey[];
}

const FoodCard: React.FC<FoodCardProps> = ({ item, onAdd, visibleNutrients }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '全穀雜糧': return 'bg-amber-100 text-amber-800 border-amber-200';
      case '蔬菜': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case '水果': return 'bg-rose-100 text-rose-800 border-rose-200';
      case '豆魚蛋肉': return 'bg-red-100 text-red-800 border-red-200';
      case '乳品': return 'bg-blue-100 text-blue-800 border-blue-200';
      case '海鮮': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // We prioritize showing Cal/P/F/C in the top row if they are selected, 
  // then overflow others into a grid
  const priorityKeys = ['cal', 'p', 'f', 'c'];
  
  const topRowStats = visibleNutrients.filter(k => priorityKeys.includes(k as string));
  const detailStats = visibleNutrients.filter(k => !priorityKeys.includes(k as string));

  const renderBadge = (key: NutrientKey) => {
    const meta = NUTRIENT_METADATA.find(m => m.key === key);
    if (!meta) return null;
    
    const value = item[key as keyof FoodItem];
    
    // Formatting Logic: 
    // Cal -> Integer (Math.round)
    // Others -> 1 Decimal Place (.toFixed(1))
    let displayValue: string | number = '-';
    
    if (typeof value === 'number' && value >= 0) {
        if (key === 'cal') {
            displayValue = Math.round(value);
        } else {
            displayValue = value.toFixed(1);
        }
    }

    // Dynamic colors based on group
    let bgClass = 'bg-slate-50 text-slate-600';
    if (meta.group === 'macro') {
        if (key === 'p') bgClass = 'bg-blue-50 text-blue-700';
        if (key === 'f') bgClass = 'bg-yellow-50 text-yellow-700';
        if (key === 'c') bgClass = 'bg-orange-50 text-orange-700';
        if (key === 'cal') bgClass = 'bg-slate-100 text-slate-700';
    } else if (meta.group === 'vitamin') {
        bgClass = 'bg-green-50 text-green-700';
    } else if (meta.group === 'mineral') {
        bgClass = 'bg-indigo-50 text-indigo-700';
    }

    return (
      <div key={key} className={`flex flex-col items-center justify-center p-1.5 rounded-lg ${bgClass}`}>
        <span className="text-[9px] font-bold uppercase opacity-60 leading-none mb-0.5">{meta.label}</span>
        <span className="text-xs font-bold font-mono flex items-baseline gap-0.5">
            {displayValue}
            {displayValue !== '-' && <span className="text-[8px] opacity-70 font-medium">{meta.unit}</span>}
        </span>
      </div>
    );
  };

  return (
    <>
      {isDetailOpen && (
        <FoodDetailDialog item={item} onClose={() => setIsDetailOpen(false)} />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 group overflow-hidden flex flex-col relative">
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(item.category)}`}>
              {item.category}
            </span>
            
            <button 
              onClick={() => setIsDetailOpen(true)}
              className="p-1.5 -mr-2 -mt-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
              title="查看完整營養成分"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          
          {/* Name and Alias Section */}
          <div className="mb-3 pr-6">
             <div className="flex items-baseline gap-2">
                <h3 className="text-base font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors" title={item.name}>
                  {item.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap flex-shrink-0">
                  (每 100g)
                </span>
             </div>
             {item.alias && (
               <div className="text-xs text-slate-500 font-medium mt-0.5">
                 {item.alias}
               </div>
             )}
          </div>
          
          {/* Priority Row */}
          {topRowStats.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              {topRowStats.map(renderBadge)}
            </div>
          )}

          {/* Details Row */}
          {detailStats.length > 0 && (
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-50">
               {detailStats.slice(0, 8).map(renderBadge)}
               {detailStats.length > 8 && (
                   <div className="flex items-center justify-center text-[10px] text-slate-400">+{detailStats.length - 8}</div>
               )}
            </div>
          )}
        </div>
        
        <button 
          onClick={() => onAdd(item)}
          className="w-full py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-medium text-xs flex items-center justify-center gap-2 border-t border-slate-100 transition-colors active:bg-blue-100"
        >
          <Plus className="w-3 h-3" />
          加入
        </button>
      </div>
    </>
  );
};

export default FoodCard;
