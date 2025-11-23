
import React from 'react';
import { X, Dna, Activity, Flame, Leaf, Droplets } from './Icons';
import { FoodItem, NUTRIENT_METADATA } from '@/types';

interface FoodDetailDialogProps {
  item: FoodItem;
  onClose: () => void;
}

const FoodDetailDialog: React.FC<FoodDetailDialogProps> = ({ item, onClose }) => {
  
  // Group metadata for organized rendering
  const groups = {
    macro: NUTRIENT_METADATA.filter(n => n.group === 'macro'),
    detail: NUTRIENT_METADATA.filter(n => n.group === 'detail'),
    vitamin: NUTRIENT_METADATA.filter(n => n.group === 'vitamin'),
    mineral: NUTRIENT_METADATA.filter(n => n.group === 'mineral'),
  };

  const formatValue = (key: string, value: number | undefined) => {
    if (value === undefined || value === null) return '-';
    if (key === 'cal') return Math.round(value);
    return value.toFixed(1);
  };

  const renderNutrientBox = (meta: typeof NUTRIENT_METADATA[0]) => {
    const value = item[meta.key as keyof FoodItem];
    const displayValue = formatValue(meta.key as string, value as number | undefined);

    return (
      <div key={meta.key} className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100">
        <span className="text-xs text-slate-500 font-medium">{meta.label}</span>
        <span className="text-sm font-bold text-slate-700 font-mono">
          {displayValue} <span className="text-[10px] text-slate-400 font-sans">{meta.unit}</span>
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 px-4 py-6 md:py-10">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-full animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                {item.category}
              </span>
              <span className="text-xs text-slate-400">每 100g 含量</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">{item.name}</h2>
            {item.alias && (
               <p className="text-sm text-slate-500 font-medium mt-1">{item.alias}</p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 -mt-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-6 custom-scrollbar">
          
          {/* Section: Macros */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
              <Activity className="w-4 h-4 text-blue-500" /> 基礎營養 (Macros)
            </h3>
            <div className="grid grid-cols-2 gap-3">
               {groups.macro.map((meta) => {
                 const val = item[meta.key as keyof FoodItem] as number;
                 // Special styling for macros
                 let colorClass = "bg-slate-50 border-slate-100 text-slate-700";
                 if (meta.key === 'cal') colorClass = "bg-slate-100 border-slate-200 text-slate-900";
                 if (meta.key === 'p') colorClass = "bg-blue-50 border-blue-100 text-blue-900";
                 if (meta.key === 'f') colorClass = "bg-yellow-50 border-yellow-100 text-yellow-900";
                 if (meta.key === 'c') colorClass = "bg-orange-50 border-orange-100 text-orange-900";

                 return (
                   <div key={meta.key} className={`flex flex-col items-center justify-center p-4 rounded-xl border ${colorClass}`}>
                      <span className="text-xs opacity-70 uppercase font-bold mb-1">{meta.label}</span>
                      <span className="text-2xl font-black font-mono leading-none">
                        {formatValue(meta.key as string, val)}
                        <span className="text-xs font-medium ml-1 opacity-60">{meta.unit}</span>
                      </span>
                   </div>
                 )
               })}
            </div>
          </section>

          {/* Section: Details */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
              <Flame className="w-4 h-4 text-orange-500" /> 詳細成分
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {groups.detail.map(renderNutrientBox)}
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Section: Vitamins */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                <Leaf className="w-4 h-4 text-green-500" /> 維生素
              </h3>
              <div className="space-y-2">
                {groups.vitamin.map(renderNutrientBox)}
              </div>
            </section>

            {/* Section: Minerals */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                <Droplets className="w-4 h-4 text-indigo-500" /> 礦物質
              </h3>
              <div className="space-y-2">
                {groups.mineral.map(renderNutrientBox)}
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FoodDetailDialog;
