import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FoodItem } from '@/types';

// Mapping: Excel Header -> DB Column
const HEADER_MAP: Record<string, string> = {
  '樣品名稱': 'name',
  '俗名': 'alias',
  '食品分類': 'cat',
  '熱量(kcal)': 'cal',
  '粗蛋白(g)': 'p',
  '粗脂肪(g)': 'f',
  '總碳水化合物(g)': 'c',
  '膳食纖維(g)': 'fiber',
  '糖質總量(g)': 'sugar',
  '飽和脂肪(g)': 'sat_fat',
  '反式脂肪(mg)': 'trans_fat',
  '膽固醇(mg)': 'cholesterol',
  '鈉(mg)': 'sodium',
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

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'raw_data.xlsx');
    const fileBuffer = readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    const foodItems: FoodItem[] = [];

    rawData.forEach((row: any, index: number) => {
      const newItem: any = {
        id: `food_${index + 1}`
      };

      let isValid = true;

      Object.entries(HEADER_MAP).forEach(([excelKey, appKey]) => {
        let value = row[excelKey];

        if (value === undefined || value === null || value === '' || value === 'N/A' || value === '-') {
          value = 0;
        }

        if (appKey === 'name') {
          if (!value || value === 0) {
            isValid = false;
          } else {
            newItem.name = String(value).trim();
          }
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
          let num = parseFloat(value);
          if (isNaN(num)) num = 0;

          if (excelKey === '反式脂肪(mg)') {
            num = num / 1000; // mg to g
          }

          newItem[appKey] = num;
        }
      });

      if (isValid && newItem.cal > 0) {
        foodItems.push(newItem as FoodItem);
      }
    });

    return NextResponse.json(foodItems);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return NextResponse.json(
      { error: 'Failed to read food data' },
      { status: 500 }
    );
  }
}

