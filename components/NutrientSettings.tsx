
import React from 'react';
import { X, Check } from './Icons';
import { NUTRIENT_METADATA, NutrientKey } from '@/types';

interface NutrientSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  visibleNutrients: NutrientKey[];
  onToggle: (key: NutrientKey) => void;
}

const NutrientSettings: React.FC<NutrientSettingsProps> = ({ isOpen, onClose, visibleNutrients, onToggle }) => {
  if (!isOpen) return null;

  // Group metadata for rendering
  const groups = {
    macro: NUTRIENT_METADATA.filter(n => n.group === 'macro'),
    detail: NUTRIENT_METADATA.filter(n => n.group === 'detail'),
    vitamin: NUTRIENT_METADATA.filter(n => n.group === 'vitamin'),
    mineral: NUTRIENT_METADATA.filter(n => n.group === 'mineral'),
  };

  const renderGroup = (title: string, items: typeof NUTRIENT_METADATA, colorClass: string) => (
    <div className="mb-6">
      <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${colorClass}`}>{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((meta) => {
          const isSelected = visibleNutrients.includes(meta.key);
          return (
            <button
              key={meta.key}
              onClick={() => onToggle(meta.key)}
              className={`
                flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all
                ${isSelected 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}
              `}
            >
              <span>{meta.label}</span>
              {isSelected && <Check className="w-3 h-3 text-blue-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">顯示設定</h2>
            <p className="text-xs text-slate-500 mt-1">選擇您希望在清單與計算結果中顯示的營養素</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {renderGroup('基礎營養 (Macros)', groups.macro, 'text-slate-500')}
          {renderGroup('詳細成份 (Details)', groups.detail, 'text-orange-500')}
          {renderGroup('維生素 (Vitamins)', groups.vitamin, 'text-green-500')}
          {renderGroup('礦物質 (Minerals)', groups.mineral, 'text-blue-500')}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95"
          >
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
};

export default NutrientSettings;
