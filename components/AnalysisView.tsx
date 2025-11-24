
import React from 'react';
import { DietPlan, DailyRecord, FOOD_GROUPS, MEAL_TIMES, EXCHANGE_STANDARDS, FoodGroupId, CartItem, MealTimeId } from '@/types';
import { PieChart, AlertTriangle, Check, Save, FileSpreadsheet, Trash2 } from './Icons';

interface AnalysisViewProps {
  plan: DietPlan;
  dailyRecord: DailyRecord;
  onSave?: () => void;
  onRemoveFromLog?: (mealId: MealTimeId, index: number) => void;
}

// --- Logic: Convert grams/calories back to Portions ---
const calculateActualPortions = (items: CartItem[]): Record<FoodGroupId, number> => {
    const portions: Record<FoodGroupId, number> = {
        starch: 0, meat_low: 0, meat_med: 0, dairy_low: 0, dairy_med: 0, veg: 0, fruit: 0, fat: 0, nut: 0
    };

    items.forEach(item => {
        const totalQty = item.quantity; // units (usually 100g)
        
        let groupId: FoodGroupId = 'fat'; 
        
        if (item.category === '全穀雜糧') groupId = 'starch';
        else if (item.category === '蔬菜') groupId = 'veg';
        else if (item.category === '水果') groupId = 'fruit';
        else if (item.category === '海鮮') groupId = 'meat_low';
        else if (item.category === '豆魚蛋肉') {
             if (item.f > 5) groupId = 'meat_med';
             else groupId = 'meat_low';
        }
        else if (item.category === '乳品') groupId = 'dairy_med';
        else if (item.category === '油脂/其他') groupId = 'fat';

        let portionCount = 0;
        const std = EXCHANGE_STANDARDS[groupId];
        
        if (groupId === 'starch' || groupId === 'fruit') {
             const totalC = item.c * totalQty;
             portionCount = totalC / std.c;
        } else if (groupId === 'veg') {
             portionCount = totalQty; 
        } else if (groupId.startsWith('meat') || groupId.startsWith('dairy')) {
             const totalP = item.p * totalQty;
             portionCount = totalP / std.p;
        } else {
             const totalF = item.f * totalQty;
             portionCount = totalF / std.f;
        }

        portions[groupId] += portionCount;
    });

    return portions;
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ plan, dailyRecord, onSave, onRemoveFromLog }) => {
  
  // Fix: cast empty object or initialize fully to satisfy Record type
  const actualPortionsMatrix = {} as Record<FoodGroupId, Record<string, number>>;
  
  // Initialize
  FOOD_GROUPS.forEach(g => {
      actualPortionsMatrix[g.id] = {};
      MEAL_TIMES.forEach(m => actualPortionsMatrix[g.id][m.id] = 0);
  });

  // Populate Matrix
  MEAL_TIMES.forEach(meal => {
      const items = dailyRecord[meal.id] || [];
      const p = calculateActualPortions(items);
      FOOD_GROUPS.forEach(g => {
          actualPortionsMatrix[g.id][meal.id] = p[g.id];
      });
  });

  // Helper to check deviation
  const renderComparison = (groupId: FoodGroupId, mealId: string) => {
      const planned = plan.portions[groupId]?.[mealId as MealTimeId] || 0;
      const actual = actualPortionsMatrix[groupId]?.[mealId] || 0;
      
      if (planned === 0 && actual === 0) return <span className="text-slate-200">-</span>;
      
      const diff = actual - planned;
      const isWayOver = diff > 1;
      const isWayUnder = diff < -1;
      
      let color = 'text-slate-400';
      if (Math.abs(diff) < 0.3) color = 'text-emerald-500 font-bold'; 
      else if (isWayOver) color = 'text-red-500 font-bold';
      else if (isWayUnder) color = 'text-orange-400';

      return (
          <div className="flex flex-col items-center leading-none">
              <span className={`text-xs ${color}`}>{actual.toFixed(1)}</span>
              <span className="text-[9px] text-slate-300 border-t border-slate-100 mt-0.5 pt-0.5 w-full text-center">
                  / {planned}
              </span>
          </div>
      );
  };

  const handleExportSingle = () => {
      if (!(window as any).XLSX) {
        alert('Excel library missing');
        return;
      }
      // Prepare data
      const allItems = Object.values(dailyRecord).flat();
      const totalCal = allItems.reduce((sum, i) => sum + i.cal * i.quantity, 0);

      const data = [
        { '項目': '目標熱量', '數值': plan.targetCalories },
        { '項目': '實際熱量', '數值': Math.round(totalCal) },
        // ... could add more details
      ];

      // Also add Meal Log details
      const logData = allItems.map(i => ({
          '餐次': MEAL_TIMES.find(m => dailyRecord[m.id].includes(i))?.label || '未知',
          '食物': i.name,
          '份量(單位)': i.quantity,
          '熱量': Math.round(i.cal * i.quantity)
      }));

      const wb = (window as any).XLSX.utils.book_new();
      const wsSummary = (window as any).XLSX.utils.json_to_sheet(data);
      const wsLog = (window as any).XLSX.utils.json_to_sheet(logData);
      
      (window as any).XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
      (window as any).XLSX.utils.book_append_sheet(wb, wsLog, "DietLog");
      
      (window as any).XLSX.writeFile(wb, "Analysis_Single.xlsx");
  };

  return (
    <div className="w-full mx-auto p-4 lg:p-6 space-y-8 animate-in slide-in-from-right-8 duration-500 pb-24">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shadow-sm">
                    <PieChart className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">成效分析 (Analysis)</h2>
                    <p className="text-slate-500">比對熱量設計與實際攝取量 (實際 / 目標)</p>
                </div>
            </div>
            
            <div className="flex gap-2">
                 <button 
                    onClick={handleExportSingle}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    匯出本頁
                </button>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">份數達成率矩陣</h3>
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1 text-emerald-600"><Check className="w-3 h-3"/> 達標 (±0.3)</div>
                    <div className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-3 h-3"/> 超標 (&gt;1)</div>
                    <div className="flex items-center gap-1 text-orange-400"><AlertTriangle className="w-3 h-3"/> 不足 (&lt;1)</div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-3 font-bold sticky left-0 bg-slate-50 z-10 min-w-[140px]">食物種類</th>
                            {MEAL_TIMES.map(meal => (
                                <th key={meal.id} className="px-2 py-3 text-center min-w-[60px]">{meal.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {FOOD_GROUPS.map(group => (
                            <tr key={group.id} className="hover:bg-slate-50/50">
                                <td className={`px-4 py-3 font-medium sticky left-0 z-10 ${group.color}`}>
                                    {group.label}
                                </td>
                                {MEAL_TIMES.map(meal => (
                                    <td key={meal.id} className="px-2 py-2 text-center">
                                        {renderComparison(group.id, meal.id)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* Diet Record Details Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">飲食紀錄明細</h3>
            </div>
            <div className="p-4 space-y-4">
                {MEAL_TIMES.map(meal => {
                    const items = dailyRecord[meal.id] || [];
                    if (items.length === 0) return null;
                    return (
                        <div key={meal.id} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">{meal.label}</h4>
                            <div className="space-y-2">
                                {items.map((item, idx) => (
                                    <div key={`${meal.id}-${idx}`} className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-slate-800">{item.name}</span>
                                            <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                {Math.round(item.quantity * 100)}g
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-slate-600">
                                                {Math.round(item.cal * item.quantity)} kcal
                                            </span>
                                            {onRemoveFromLog && (
                                                <button 
                                                    onClick={() => onRemoveFromLog(meal.id, idx)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                    title="刪除此項目"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {Object.values(dailyRecord).every(items => items.length === 0) && (
                    <div className="text-center text-slate-400 text-sm py-4">尚無飲食紀錄</div>
                )}
            </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800">
            <strong>說明：</strong> 系統會根據實際攝取食物的主營養素（如肉類看蛋白質、澱粉看碳水），自動換算回「份數」。這是一個估算值，僅供參考。
        </div>

        {/* Footer Action Bar */}
        <div className="fixed bottom-0 lg:bottom-auto lg:sticky lg:top-[calc(100vh-80px)] left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50 flex items-center justify-between lg:rounded-xl lg:mx-6 lg:mb-6 lg:shadow-sm lg:border">
            <div className="text-sm font-medium text-slate-600">
                確認資料無誤後，請點擊儲存。
            </div>
            <button 
                onClick={onSave}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
            >
                <Save className="w-4 h-4" />
                儲存至個案紀錄
            </button>
        </div>
    </div>
  );
};

export default AnalysisView;
