
import React, { useState } from 'react';
import { CaseRecord, NUTRIENT_METADATA, MEAL_TIMES } from '@/types';
import { FileSpreadsheet, Trash2, History, X, Activity, User, Calendar, Calculator, Scale, ArrowRight } from './Icons';

interface HistoryViewProps {
  savedCases: CaseRecord[];
  onDelete: (id: string) => void;
  onLoad?: (record: CaseRecord) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ savedCases, onDelete, onLoad }) => {
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);

  // --- Global Export (Summary of all cases) ---
  const handleExportSummary = () => {
    if (!(window as any).XLSX) {
        alert('Excel export library not loaded.');
        return;
    }

    const exportData = savedCases.map(c => ({
        '紀錄日期': new Date(c.timestamp).toLocaleDateString(),
        '姓名': c.profile.name || '未命名',
        '性別': c.profile.gender === 'male' ? '男' : '女',
        '年齡': c.profile.age,
        '身高(cm)': c.profile.height,
        '體重(kg)': c.profile.weight,
        'BMI': (c.profile.weight / Math.pow(c.profile.height/100, 2)).toFixed(1),
        '目標熱量(kcal)': c.plan.targetCalories,
        '實際攝取(kcal)': c.summary.calories.actual,
        '熱量達成率(%)': Math.round((c.summary.calories.actual / c.plan.targetCalories) * 100) + '%',
        '備註': c.profile.notes || ''
    }));

    const worksheet = (window as any).XLSX.utils.json_to_sheet(exportData);
    const workbook = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, "Case List");
    (window as any).XLSX.writeFile(workbook, `NutriPro_CaseSummary_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- Single Case Detail Export ---
  const handleExportSingleCase = (record: CaseRecord) => {
      if (!(window as any).XLSX) { alert('Excel library missing'); return; }
      
      const wb = (window as any).XLSX.utils.book_new();
      const dateStr = new Date(record.timestamp).toLocaleDateString();

      // Sheet 1: Profile & Plan
      const profileData = [
          { Category: '基本資料', Key: '姓名', Value: record.profile.name || '未命名' },
          { Category: '基本資料', Key: '日期', Value: dateStr },
          { Category: '基本資料', Key: '性別', Value: record.profile.gender === 'male' ? '男' : '女' },
          { Category: '基本資料', Key: '年齡', Value: record.profile.age },
          { Category: '基本資料', Key: '身高 (cm)', Value: record.profile.height },
          { Category: '基本資料', Key: '體重 (kg)', Value: record.profile.weight },
          { Category: '基本資料', Key: '活動量', Value: record.profile.activityLevel },
          { Category: '基本資料', Key: '備註', Value: record.profile.notes || '' },
          { Category: '熱量設計', Key: '目標熱量', Value: record.plan.targetCalories },
          { Category: '熱量設計', Key: '目標蛋白質 (g)', Value: record.plan.targetP },
          { Category: '熱量設計', Key: '目標脂肪 (g)', Value: record.plan.targetF },
          { Category: '熱量設計', Key: '目標碳水 (g)', Value: record.plan.targetC },
      ];
      const wsProfile = (window as any).XLSX.utils.json_to_sheet(profileData);
      (window as any).XLSX.utils.book_append_sheet(wb, wsProfile, "個案資料");

      // Sheet 2: Nutrient Analysis (Full)
      // Calculate totals for all nutrients
      const allItems = Object.values(record.record).flat();
      const totalNutrients: Record<string, number> = {};
      
      allItems.forEach(item => {
         NUTRIENT_METADATA.forEach(meta => {
             const val = item[meta.key as keyof typeof item] || 0;
             // @ts-ignore
             if (typeof val === 'number') {
                 totalNutrients[meta.key] = (totalNutrients[meta.key] || 0) + val * item.quantity;
             }
         });
      });

      const analysisData = NUTRIENT_METADATA.map(meta => ({
          '營養素': meta.label,
          '單位': meta.unit,
          '總攝取量': parseFloat((totalNutrients[meta.key] || 0).toFixed(2)),
          '建議目標': ['cal','p','f','c'].includes(meta.key as string) ? 
                      (meta.key === 'cal' ? record.plan.targetCalories : 
                       meta.key === 'p' ? record.plan.targetP :
                       meta.key === 'f' ? record.plan.targetF : record.plan.targetC) : '-'
      }));
      const wsAnalysis = (window as any).XLSX.utils.json_to_sheet(analysisData);
      (window as any).XLSX.utils.book_append_sheet(wb, wsAnalysis, "營養總分析");

      // Sheet 3: Food Log
      const logData: any[] = [];
      MEAL_TIMES.forEach(meal => {
          const items = record.record[meal.id] || [];
          items.forEach(item => {
              logData.push({
                  '餐次': meal.label,
                  '食物名稱': item.name,
                  '份量': item.quantity,
                  '克數(g)': Math.round(item.quantity * 100), // Added explicit grams column
                  '熱量': Math.round(item.cal * item.quantity),
                  '蛋白質': (item.p * item.quantity).toFixed(1),
                  '脂肪': (item.f * item.quantity).toFixed(1),
                  '碳水': (item.c * item.quantity).toFixed(1)
              });
          });
      });
      const wsLog = (window as any).XLSX.utils.json_to_sheet(logData);
      (window as any).XLSX.utils.book_append_sheet(wb, wsLog, "飲食紀錄明細");

      (window as any).XLSX.writeFile(wb, `${record.profile.name || 'Case'}_FullReport.xlsx`);
  };

  // --- Modal Component for Details ---
  const DetailModal = ({ record, onClose }: { record: CaseRecord, onClose: () => void }) => {
      const allItems = Object.values(record.record).flat();
      
      // Helper to get total for a specific nutrient key
      const getTotal = (key: string) => {
          return allItems.reduce((sum, item) => {
              const val = item[key as keyof typeof item];
              // @ts-ignore
              return sum + (typeof val === 'number' ? val * item.quantity : 0);
          }, 0);
      };

      // Group metadata
      const groups = {
          macro: NUTRIENT_METADATA.filter(n => n.group === 'macro'),
          detail: NUTRIENT_METADATA.filter(n => n.group === 'detail'),
          vitamin: NUTRIENT_METADATA.filter(n => n.group === 'vitamin'),
          mineral: NUTRIENT_METADATA.filter(n => n.group === 'mineral'),
      };

      const renderNutrientGrid = (items: typeof NUTRIENT_METADATA, colorClass: string) => (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map(meta => {
                  const val = getTotal(meta.key as string);
                  return (
                      <div key={meta.key} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                          <span className={`text-[10px] font-bold uppercase mb-1 ${colorClass}`}>{meta.label}</span>
                          <span className="text-lg font-bold text-slate-800 font-mono leading-none">
                              {meta.key === 'cal' ? Math.round(val) : val.toFixed(1)}
                              <span className="text-[10px] font-medium text-slate-400 ml-1">{meta.unit}</span>
                          </span>
                      </div>
                  )
              })}
          </div>
      );

      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
              <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5" />
                          </div>
                          <div>
                              <h2 className="text-xl font-bold text-slate-800">{record.profile.name || '未命名'} 的個案資料</h2>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(record.timestamp).toLocaleString()}
                              </div>
                          </div>
                      </div>
                      <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                      
                      {/* Profile Summary */}
                      <section>
                          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <User className="w-4 h-4" /> 基本資料
                          </h3>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                               <div><div className="text-xs text-slate-400">性別</div><div className="font-medium">{record.profile.gender === 'male' ? '男' : '女'}</div></div>
                               <div><div className="text-xs text-slate-400">年齡</div><div className="font-medium">{record.profile.age} 歲</div></div>
                               <div><div className="text-xs text-slate-400">身高/體重</div><div className="font-medium">{record.profile.height}cm / {record.profile.weight}kg</div></div>
                               <div><div className="text-xs text-slate-400">BMI</div><div className="font-medium">{(record.profile.weight / Math.pow(record.profile.height/100, 2)).toFixed(1)}</div></div>
                          </div>
                          {record.profile.notes && (
                              <div className="mt-2 bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm border border-yellow-100">
                                  <span className="font-bold mr-2">備註:</span> {record.profile.notes}
                              </div>
                          )}
                      </section>

                      {/* Nutrient Analysis */}
                      <section>
                          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Activity className="w-4 h-4" /> 營養總分析
                          </h3>
                          
                          <div className="space-y-6">
                              <div>
                                  <div className="text-xs font-bold text-slate-400 mb-2">三大營養素 & 熱量</div>
                                  {renderNutrientGrid(groups.macro, 'text-blue-600')}
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-slate-400 mb-2">詳細成分</div>
                                  {renderNutrientGrid(groups.detail, 'text-orange-600')}
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-slate-400 mb-2">微量營養素 (維生素 & 礦物質)</div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                      {[...groups.vitamin, ...groups.mineral].map(meta => {
                                          const val = getTotal(meta.key as string);
                                          return (
                                            <div key={meta.key} className="bg-white p-2.5 rounded-lg border border-slate-100 flex justify-between items-center shadow-sm">
                                                <span className="text-xs text-slate-500 font-medium">{meta.label}</span>
                                                <span className="text-sm font-bold text-slate-800 font-mono">
                                                    {val.toFixed(1)} <span className="text-[10px] text-slate-400">{meta.unit}</span>
                                                </span>
                                            </div>
                                          )
                                      })}
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* Food Logs */}
                      <section>
                          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Scale className="w-4 h-4" /> 飲食紀錄摘要
                          </h3>
                          <div className="space-y-2">
                              {MEAL_TIMES.map(meal => {
                                  const items = record.record[meal.id];
                                  if (!items || items.length === 0) return null;
                                  return (
                                      <div key={meal.id} className="flex gap-4 items-start py-2 border-b border-slate-50 last:border-0">
                                          <div className="w-16 text-xs font-bold text-slate-500 mt-1">{meal.label}</div>
                                          <div className="flex-1 flex flex-wrap gap-2">
                                              {items.map((item, idx) => (
                                                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-700 border border-slate-200">
                                                      <span className="font-medium">{item.name}</span>
                                                      <span className="text-slate-500 font-mono bg-white px-1.5 rounded border border-slate-100 ml-1">
                                                          {Math.round(item.quantity * 100)}g
                                                      </span>
                                                  </span>
                                              ))}
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      </section>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                      <button 
                          onClick={() => handleExportSingleCase(record)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 hover:text-blue-600 transition-colors font-medium text-sm shadow-sm"
                      >
                          <FileSpreadsheet className="w-4 h-4" />
                          匯出完整資料 (Excel)
                      </button>

                      <div className="flex gap-3">
                          <button 
                             onClick={onClose}
                             className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm"
                          >
                              關閉
                          </button>
                          {onLoad && (
                              <button 
                                  onClick={() => {
                                      onLoad(record);
                                      onClose();
                                  }}
                                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-200"
                              >
                                  <User className="w-4 h-4" />
                                  載入並修改
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="w-full mx-auto p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        {selectedCase && (
            <DetailModal record={selectedCase} onClose={() => setSelectedCase(null)} />
        )}

        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-sm">
                    <History className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">個案紀錄 (History)</h2>
                    <p className="text-slate-500">點擊列表項目以查看詳細資料與微量營養素</p>
                </div>
            </div>
            
            {savedCases.length > 0 && (
                <button 
                    onClick={handleExportSummary}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    匯出列表摘要
                </button>
            )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {savedCases.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <History className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-medium mb-1">尚無紀錄</h3>
                    <p className="text-slate-400 text-sm">請在「成效分析」頁面點擊儲存來新增個案紀錄</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold">日期</th>
                                <th className="px-6 py-4 font-bold">姓名</th>
                                <th className="px-6 py-4 font-bold">基本資料</th>
                                <th className="px-6 py-4 font-bold">熱量目標</th>
                                <th className="px-6 py-4 font-bold">實際攝取</th>
                                <th className="px-6 py-4 font-bold text-center">達成率</th>
                                <th className="px-6 py-4 font-bold text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {savedCases.map((item) => {
                                const pct = item.plan.targetCalories > 0 
                                    ? Math.round((item.summary.calories.actual / item.plan.targetCalories) * 100) 
                                    : 0;
                                
                                let statusColor = 'bg-emerald-100 text-emerald-700';
                                if (pct > 110) statusColor = 'bg-red-100 text-red-700';
                                if (pct < 90) statusColor = 'bg-orange-100 text-orange-700';

                                return (
                                    <tr 
                                        key={item.id} 
                                        className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedCase(item)}
                                    >
                                        <td className="px-6 py-4 text-slate-500 font-mono">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800 group-hover:text-blue-600">
                                            {item.profile.name || '未命名'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {item.profile.gender === 'male' ? '男' : '女'} / {item.profile.age}歲
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-600">
                                            {item.plan.targetCalories} kcal
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-800">
                                            {Math.round(item.summary.calories.actual)} kcal
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                                {pct}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent row click
                                                    onDelete(item.id);
                                                }}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="刪除紀錄"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="ml-2 p-2 text-slate-300 group-hover:text-blue-400 lg:hidden">
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );
};

export default HistoryView;
