'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Activity } from './Icons';
import { FoodItem } from '@/types';
import * as XLSX from 'xlsx';

interface ExcelImporterProps {
  onImport: (items: FoodItem[]) => void;
  className?: string;
  collapsed?: boolean;
}

// Mapping logic consistent with the prompt requirements
const HEADER_MAP: Record<string, string> = {
  '樣品名稱': 'name',
  '俗名': 'alias',
  '食品分類': 'cat', // temporary key
  '熱量(kcal)': 'cal',
  '粗蛋白(g)': 'p',
  '粗脂肪(g)': 'f',
  '總碳水化合物(g)': 'c',
  '膳食纖維(g)': 'fiber',
  '糖質總量(g)': 'sugar',
  '飽和脂肪(g)': 'sat_fat',
  '反式脂肪(mg)': 'trans_fat',
  '膽固醇(mg)': 'cholesterol',
  '鈉(mg)': 'sodium', // mapped to sodium in types
  '鉀(mg)': 'k',
  '鈣(mg)': 'ca',
  '鎂(mg)': 'mg',
  '鐵(mg)': 'fe',
  '鋅(mg)': 'zn',
  '磷(mg)': 'p_min',
  '銅(mg)': 'cu',
  '錳(mg)': 'mn',
  '視網醇當量(RE)(ug)': 'vit_a',
  '維生素B1(mg)': 'vit_b1',
  '維生素B2(mg)': 'vit_b2',
  '維生素B6(mg)': 'vit_b6',
  '維生素B12(ug)': 'vit_b12',
  '維生素C(mg)': 'vit_c',
  'α-維生素E當量(α-TE)(mg)': 'vit_e',
  '葉酸(ug)': 'folic_acid',
  '菸鹼素(mg)': 'niacin'
};

const mapCategory = (rawCat: string): string => {
  if (!rawCat) return '油脂/其他';
  if (rawCat.includes('穀') || rawCat.includes('澱粉') || rawCat.includes('米') || rawCat.includes('麵')) return '全穀雜糧';
  if (rawCat.includes('肉') || rawCat.includes('蛋') || rawCat.includes('豆')) return '豆魚蛋肉';
  if (rawCat.includes('魚') || rawCat.includes('貝') || rawCat.includes('蝦') || rawCat.includes('蟹')) return '海鮮';
  if (rawCat.includes('菜') || rawCat.includes('菇') || rawCat.includes('藻')) return '蔬菜';
  if (rawCat.includes('果') && !rawCat.includes('堅果')) return '水果';
  if (rawCat.includes('乳') || rawCat.includes('奶')) return '乳品';
  return '油脂/其他';
};

const ExcelImporter: React.FC<ExcelImporterProps> = ({ onImport, className = '', collapsed = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const parsedItems: FoodItem[] = [];

        data.forEach((row: any, index: number) => {
            const newItem: any = {
                id: `imported_${Date.now()}_${index}` // Temporary ID
            };

            let isValid = true;

            // Map keys
            Object.entries(HEADER_MAP).forEach(([excelKey, appKey]) => {
                let value = row[excelKey];
                
                // Clean data
                if (value === undefined || value === null || value === 'N/A' || value === '-') {
                    value = 0;
                }

                if (appKey === 'name') {
                    if (!value) isValid = false;
                    newItem.name = String(value).trim();
                } else if (appKey === 'alias') {
                    // 處理俗名：去除前後空格，保留逗號分隔的多個值
                    if (value && value !== 0 && value !== 'N/A' && value !== '-') {
                        const aliasStr = String(value).trim();
                        if (aliasStr) {
                            // 將逗號分隔的值清理並重新組合（去除每個別名前後的空格）
                            const aliases = aliasStr.split(',').map(a => a.trim()).filter(a => a.length > 0);
                            newItem.alias = aliases.join(', ');
                        }
                    }
                } else if (appKey === 'cat') {
                    newItem.category = mapCategory(String(row[excelKey] || ''));
                } else {
                    // Number fields
                    let num = parseFloat(value);
                    if (isNaN(num)) num = 0;
                    
                    // Special conversions
                    if (excelKey === '反式脂肪(mg)') {
                        num = num / 1000; // mg to g
                    }

                    newItem[appKey] = num;
                }
            });

            if (isValid && newItem.cal > 0) {
                parsedItems.push(newItem as FoodItem);
            }
        });

        onImport(parsedItems);
        
      } catch (error) {
        console.error("Error parsing excel:", error);
        alert("匯入失敗，請確認 Excel 格式正確。");
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className={collapsed ? '' : 'w-full'}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".xlsx, .xls" 
        className="hidden" 
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        title="匯入 Excel"
        className={`flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${className} ${collapsed ? 'w-10 h-10 px-0' : 'px-3 py-2 w-full'}`}
      >
        {isProcessing ? <Activity className="w-4 h-4 animate-spin flex-shrink-0" /> : <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />}
        {!collapsed && (isProcessing ? '處理中...' : '匯入 Excel')}
      </button>
    </div>
  );
};

export default ExcelImporter;
