
import React, { useEffect, useState } from 'react';
import { DietPlan, FOOD_GROUPS, MEAL_TIMES, EXCHANGE_STANDARDS, FoodGroupId, MealTimeId } from '@/types';
import { ClipboardList, ArrowRight, Target } from './Icons';

interface PlanningViewProps {
  plan: DietPlan;
  tdee: number; // Recommendation reference
  onUpdate: (plan: DietPlan) => void;
  onNext: () => void;
}

const PlanningView: React.FC<PlanningViewProps> = ({ plan, tdee, onUpdate, onNext }) => {
  
  // Handle Portion Input Change
  const handlePortionChange = (groupId: FoodGroupId, mealId: MealTimeId, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    const newPortions = { ...plan.portions };
    
    if (!newPortions[groupId]) newPortions[groupId] = {} as any;
    newPortions[groupId][mealId] = numValue;

    recalculatePlan(newPortions);
  };

  // Recalculate Totals based on new portions
  const recalculatePlan = (portions: typeof plan.portions) => {
    let totalP = 0;
    let totalF = 0;
    let totalC = 0;
    let totalCal = 0;

    // Iterate through all groups and meals
    FOOD_GROUPS.forEach(group => {
      let groupPortions = 0;
      MEAL_TIMES.forEach(meal => {
        const p = portions[group.id]?.[meal.id] || 0;
        groupPortions += p;
      });

      const std = EXCHANGE_STANDARDS[group.id];
      totalP += groupPortions * std.p;
      totalF += groupPortions * std.f;
      totalC += groupPortions * std.c;
      totalCal += groupPortions * std.cal;
    });

    onUpdate({
      ...plan,
      portions,
      targetCalories: totalCal,
      targetP: totalP,
      targetF: totalF,
      targetC: totalC
    });
  };

  // Helper to get total portions for a specific group row
  const getGroupTotal = (groupId: FoodGroupId) => {
    let total = 0;
    MEAL_TIMES.forEach(meal => {
      total += plan.portions[groupId]?.[meal.id] || 0;
    });
    return total;
  };

  // Calculate macro percentages
  const pRatio = plan.targetCalories > 0 ? Math.round((plan.targetP * 4 / plan.targetCalories) * 100) : 0;
  const fRatio = plan.targetCalories > 0 ? Math.round((plan.targetF * 9 / plan.targetCalories) * 100) : 0;
  const cRatio = plan.targetCalories > 0 ? Math.round((plan.targetC * 4 / plan.targetCalories) * 100) : 0;

  return (
    <div className="w-full mx-auto p-4 lg:p-6 space-y-8 animate-in slide-in-from-right-8 duration-500">
       <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shadow-sm">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">熱量設計 (Calorie Planning)</h2>
          <p className="text-slate-500">設定六大餐次份量分配，系統自動計算營養總量</p>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6">
         
         {/* Calorie Target */}
         <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">目標熱量 / 建議 TDEE</div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800">{Math.round(plan.targetCalories)}</span>
                <span className="text-sm font-medium text-slate-400">/ {tdee} kcal</span>
            </div>
            <div className={`text-xs mt-2 font-medium ${plan.targetCalories > tdee ? 'text-red-500' : 'text-emerald-500'}`}>
               {plan.targetCalories > tdee ? `(+${Math.round(plan.targetCalories - tdee)})` : `(${Math.round(plan.targetCalories - tdee)})`}
            </div>
         </div>

         {/* Macro Breakdown */}
         <div className="md:col-span-3 grid grid-cols-3 gap-4">
             <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                 <div className="text-xs text-blue-600 font-bold mb-1">蛋白質 (P)</div>
                 <div className="text-xl font-bold text-blue-800 mb-1">{Math.round(plan.targetP)}g</div>
                 <div className="text-xs text-blue-500 opacity-80">{pRatio}% ({Math.round(plan.targetP * 4)} kcal)</div>
             </div>
             <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-center">
                 <div className="text-xs text-yellow-600 font-bold mb-1">脂肪 (F)</div>
                 <div className="text-xl font-bold text-yellow-800 mb-1">{Math.round(plan.targetF)}g</div>
                 <div className="text-xs text-yellow-500 opacity-80">{fRatio}% ({Math.round(plan.targetF * 9)} kcal)</div>
             </div>
             <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 text-center">
                 <div className="text-xs text-orange-600 font-bold mb-1">碳水 (C)</div>
                 <div className="text-xl font-bold text-orange-800 mb-1">{Math.round(plan.targetC)}g</div>
                 <div className="text-xs text-orange-500 opacity-80">{cRatio}% ({Math.round(plan.targetC * 4)} kcal)</div>
             </div>
         </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
         <div className="p-4 border-b border-slate-100 bg-slate-50/50">
             <h3 className="font-bold text-slate-800">食物代換份量分配表</h3>
         </div>
         
         <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                     <tr>
                         <th className="px-4 py-3 font-bold sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[140px]">
                             食物種類
                         </th>
                         {MEAL_TIMES.map(meal => (
                             <th key={meal.id} className="px-2 py-3 text-center min-w-[60px]">{meal.label}</th>
                         ))}
                         <th className="px-4 py-3 text-center font-bold bg-slate-100 text-slate-700 min-w-[60px]">總份數</th>
                         <th className="px-4 py-3 min-w-[140px]">營養估算</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {FOOD_GROUPS.map(group => {
                         const totalPortions = getGroupTotal(group.id);
                         const std = EXCHANGE_STANDARDS[group.id];
                         const subCal = totalPortions * std.cal;
                         const subP = totalPortions * std.p;
                         const subF = totalPortions * std.f;
                         const subC = totalPortions * std.c;
                         
                         return (
                             <tr key={group.id} className="hover:bg-slate-50/50 transition-colors group">
                                 <td className={`px-4 py-3 font-medium sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] ${group.color}`}>
                                     {group.label}
                                 </td>
                                 {MEAL_TIMES.map(meal => (
                                     <td key={meal.id} className="px-2 py-2 text-center">
                                         <input 
                                            type="number" 
                                            min="0"
                                            step="0.5"
                                            value={plan.portions[group.id]?.[meal.id] || ''}
                                            onChange={(e) => handlePortionChange(group.id, meal.id, e.target.value)}
                                            className="w-12 h-8 text-center bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 font-mono text-sm placeholder-slate-200"
                                            placeholder="-"
                                         />
                                     </td>
                                 ))}
                                 <td className="px-4 py-3 text-center font-bold bg-slate-50 text-slate-900 font-mono text-base">
                                     {totalPortions > 0 ? totalPortions : <span className="text-slate-300">-</span>}
                                 </td>
                                 
                                 {/* Improved Nutrient Display */}
                                 <td className="px-4 py-2 align-middle">
                                     <div className={`flex items-center justify-between mb-1.5 ${totalPortions > 0 ? 'opacity-100' : 'opacity-30'}`}>
                                        <span className="text-xs font-bold text-slate-500">熱量</span>
                                        <span className="font-mono font-bold text-slate-900">{Math.round(subCal)} <span className="text-[10px] font-normal text-slate-400">kcal</span></span>
                                     </div>
                                     
                                     <div className={`grid grid-cols-3 gap-1 ${totalPortions > 0 ? 'opacity-100' : 'opacity-20'}`}>
                                        {/* Protein */}
                                        <div className="bg-blue-50 rounded px-1.5 py-1 flex flex-col items-center border border-blue-100">
                                            <span className="text-[9px] font-bold text-blue-400 leading-none mb-0.5">P</span>
                                            <span className="text-xs font-bold text-blue-700 font-mono leading-none">{subP}</span>
                                        </div>
                                        {/* Fat */}
                                        <div className="bg-yellow-50 rounded px-1.5 py-1 flex flex-col items-center border border-yellow-100">
                                            <span className="text-[9px] font-bold text-yellow-500 leading-none mb-0.5">F</span>
                                            <span className="text-xs font-bold text-yellow-800 font-mono leading-none">{subF}</span>
                                        </div>
                                        {/* Carb */}
                                        <div className="bg-orange-50 rounded px-1.5 py-1 flex flex-col items-center border border-orange-100">
                                            <span className="text-[9px] font-bold text-orange-400 leading-none mb-0.5">C</span>
                                            <span className="text-xs font-bold text-orange-800 font-mono leading-none">{subC}</span>
                                        </div>
                                     </div>
                                 </td>
                             </tr>
                         );
                     })}
                 </tbody>
                 <tfoot className="bg-slate-50 border-t border-slate-200">
                     <tr>
                         <td className="px-4 py-3 font-bold sticky left-0 bg-slate-50 z-10">總計</td>
                         <td colSpan={6} className="px-2 py-3 text-right text-slate-400 text-xs pr-4">
                             整日總營養目標 &rarr;
                         </td>
                         <td className="px-4 py-3 text-center font-black text-slate-900 font-mono text-lg border-l border-slate-100">
                             -
                         </td>
                         <td className="px-4 py-3">
                             <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-600">總熱量</span>
                                <span className="text-base font-black text-slate-900">{Math.round(plan.targetCalories)} <span className="text-xs font-medium text-slate-500">kcal</span></span>
                             </div>
                             <div className="flex justify-between gap-1 text-[10px] font-mono text-slate-500 mt-1 pt-1 border-t border-slate-200">
                                <span>P: {Math.round(plan.targetP)}g</span>
                                <span>F: {Math.round(plan.targetF)}g</span>
                                <span>C: {Math.round(plan.targetC)}g</span>
                             </div>
                         </td>
                     </tr>
                 </tfoot>
             </table>
         </div>
      </div>

      <button 
            onClick={onNext}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-[0.98]"
        >
            下一步：開始飲食紀錄
            <ArrowRight className="w-4 h-4" />
        </button>
    </div>
  );
};

export default PlanningView;
