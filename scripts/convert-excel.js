const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Mapping: Excel Header -> DB Column
const HEADER_MAP = {
  // Basic Info
  '樣品名稱': 'name',
  '俗名': 'alias',
  '食品分類': 'cat',
  
  // Macros
  '熱量(kcal)': 'cal',
  '水分(g)': 'water',
  '粗蛋白(g)': 'p',
  '粗脂肪(g)': 'f',
  '飽和脂肪(g)': 'sat_fat',
  '灰分(g)': 'ash',
  '總碳水化合物(g)': 'c',
  '膳食纖維(g)': 'fiber',
  '糖質總量(g)': 'sugar',
  '葡萄糖(g)': 'glucose',
  '果糖(g)': 'fructose',
  '半乳糖(g)': 'galactose',
  '麥芽糖(g)': 'maltose',
  '蔗糖(g)': 'sucrose',
  '乳糖(g)': 'lactose',
  '反式脂肪(mg)': 'trans_fat',
  '膽固醇(mg)': 'cholesterol',
  
  // Minerals
  '鈉(mg)': 'sodium',
  '鉀(mg)': 'k',
  '鈣(mg)': 'ca',
  '鎂(mg)': 'mg',
  '鐵(mg)': 'fe',
  '鋅(mg)': 'zn',
  '磷(mg)': 'p_min',
  '銅(mg)': 'cu',
  '錳(mg)': 'mn',
  
  // Vitamin A
  '維生素A總量(IU)': 'vit_a_iu',
  '視網醇當量(RE)(ug)': 'vit_a',
  '視網醇(ug)': 'retinol',
  'α-胡蘿蔔素(ug)': 'alpha_carotene',
  'β-胡蘿蔔素(ug)': 'beta_carotene',
  
  // Vitamin D
  '維生素D總量(IU)': 'vit_d_iu',
  '維生素D總量(ug)': 'vit_d_ug',
  '維生素D2(ug)': 'vit_d2',
  '維生素D3(ug)': 'vit_d3',
  
  // Vitamin E
  '維生素E總量(mg)': 'vit_e_total',
  'α-維生素E當量(α-TE)(mg)': 'vit_e',
  'α-生育酚(mg)': 'alpha_tocopherol',
  'β-生育酚(mg)': 'beta_tocopherol',
  'γ-生育酚(mg)': 'gamma_tocopherol',
  'δ-生育酚(mg)': 'delta_tocopherol',
  
  // Vitamin K
  '維生素K1(ug)': 'vit_k1',
  '維生素K2 (MK-4)(ug)': 'vit_k2_mk4',
  '維生素K2 (MK-7)(ug)': 'vit_k2_mk7',
  
  // B Vitamins
  '維生素B1(mg)': 'vit_b1',
  '維生素B2(mg)': 'vit_b2',
  '菸鹼素(mg)': 'niacin',
  '維生素B6(mg)': 'vit_b6',
  '維生素B12(ug)': 'vit_b12',
  '葉酸(ug)': 'folic_acid',
  '維生素C(mg)': 'vit_c',
  
  // Saturated Fatty Acids (S)
  '脂肪酸S總量(mg)': 'sfa_total',
  '酪酸(4:0)(mg)': 'butyric_acid',
  '己酸(6:0)(mg)': 'caproic_acid',
  '辛酸(8:0)(mg)': 'caprylic_acid',
  '癸酸(10:0)(mg)': 'capric_acid',
  '月桂酸(12:0)(mg)': 'lauric_acid',
  '十三酸(13:0)(mg)': 'tridecanoic_acid',
  '肉豆蔻酸(14:0)(mg)': 'myristic_acid',
  '十五酸(15:0)(mg)': 'pentadecanoic_acid',
  '棕櫚酸(16:0)(mg)': 'palmitic_acid',
  '十七酸(17:0)(mg)': 'heptadecanoic_acid',
  '硬脂酸(18:0)(mg)': 'stearic_acid',
  '十九酸(19:0)(mg)': 'nonadecanoic_acid',
  '花生酸(20:0)(mg)': 'arachidic_acid',
  '山酸(22:0)(mg)': 'behenic_acid',
  '廿四酸(24:0)(mg)': 'lignoceric_acid',
  
  // Monounsaturated Fatty Acids (M)
  '脂肪酸M總量(mg)': 'mufa_total',
  '肉豆蔻烯酸(14:1)(mg)': 'myristoleic_acid',
  '棕櫚烯酸(16:1)(mg)': 'palmitoleic_acid',
  '油酸(18:1)(mg)': 'oleic_acid',
  '鱈烯酸(20:1)(mg)': 'eicosenoic_acid',
  '芥子酸(22:1)(mg)': 'erucic_acid',
  
  // Polyunsaturated Fatty Acids (P)
  '脂肪酸P總量(mg)': 'pufa_total',
  '亞麻油酸(18:2)(mg)': 'linoleic_acid',
  '次亞麻油酸(18:3)(mg)': 'linolenic_acid',
  '十八碳四烯酸(18:4)(mg)': 'stearidonic_acid',
  '花生油酸(20:4)(mg)': 'arachidonic_acid',
  '廿碳五烯酸(20:5)(mg)': 'epa',
  '廿二碳五烯酸(22:5)(mg)': 'dpa',
  '廿二碳六烯酸(22:6)(mg)': 'dha',
  '其他脂肪酸(mg)': 'other_fatty_acids',
  'P/M/S': 'pms_ratio',
  
  // Amino Acids
  '水解胺基酸總量(mg)': 'total_amino_acids',
  '天門冬胺酸(Asp)(mg)': 'aspartic_acid',
  '酥胺酸(Thr)(mg)': 'threonine',
  '絲胺酸(Ser)(mg)': 'serine',
  '麩胺酸(Glu)(mg)': 'glutamic_acid',
  '脯胺酸(Pro)(mg)': 'proline',
  '甘胺酸(Gly)(mg)': 'glycine',
  '丙胺酸(Ala)(mg)': 'alanine',
  '胱胺酸(Cys)(mg)': 'cystine',
  '纈胺酸(Val)(mg)': 'valine',
  '甲硫胺酸(Met)(mg)': 'methionine',
  '異白胺酸(Ile)(mg)': 'isoleucine',
  '白胺酸(Leu)(mg)': 'leucine',
  '酪胺酸(Tyr)(mg)': 'tyrosine',
  '苯丙胺酸(Phe)(mg)': 'phenylalanine',
  '離胺酸(Lys)(mg)': 'lysine',
  '組胺酸(His)(mg)': 'histidine',
  '精胺酸(Arg)(mg)': 'arginine',
  '色胺酸(Trp)(mg)': 'tryptophan',
  
  // Other
  '酒精含量(g)': 'alcohol'
};

const mapCategory = (rawCat) => {
  if (!rawCat) return '油脂/其他';
  if (rawCat.includes('穀') || rawCat.includes('澱粉') || rawCat.includes('米') || rawCat.includes('麵')) return '全穀雜糧';
  if (rawCat.includes('肉') || rawCat.includes('蛋') || rawCat.includes('豆')) return '豆魚蛋肉';
  if (rawCat.includes('魚') || rawCat.includes('貝') || rawCat.includes('蝦') || rawCat.includes('蟹')) return '海鮮';
  if (rawCat.includes('菜') || rawCat.includes('菇') || rawCat.includes('藻')) return '蔬菜';
  if (rawCat.includes('果') && !rawCat.includes('堅果')) return '水果';
  if (rawCat.includes('乳') || rawCat.includes('奶')) return '乳品';
  return '油脂/其他';
};

function convertExcelToJson() {
  try {
    const filePath = path.join(process.cwd(), 'raw_data.xlsx');
    const outputPath = path.join(process.cwd(), 'public', 'foods.json');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ raw_data.xlsx 檔案不存在！');
      process.exit(1);
    }

    console.log('📖 讀取 Excel 檔案...');
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    console.log(`📊 找到 ${rawData.length} 筆資料，開始轉換...`);
    const foodItems = [];

    rawData.forEach((row, index) => {
      const newItem = {
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
          if (value && value !== 0 && value !== 'N/A' && value !== '-') {
            const aliasStr = String(value).trim();
            if (aliasStr) {
              const aliases = aliasStr.split(',').map(a => a.trim()).filter(a => a.length > 0);
              newItem.alias = aliases.join(', ');
            }
          }
        } else if (appKey === 'cat') {
          newItem.category = mapCategory(String(row[excelKey] || ''));
        } else {
          let num = parseFloat(value);
          if (isNaN(num)) num = 0;

          // Unit conversions
          if (excelKey === '反式脂肪(mg)') {
            num = num / 1000; // mg to g
          }
          // All fatty acids and amino acids are in mg, keep as is
          // All vitamins and minerals keep their original units

          newItem[appKey] = num;
        }
      });

      if (isValid && newItem.cal > 0) {
        foodItems.push(newItem);
      }
    });

    // 確保 public 目錄存在
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 寫入 JSON 檔案
    fs.writeFileSync(outputPath, JSON.stringify(foodItems, null, 2), 'utf8');
    
    const fileSize = fs.statSync(outputPath).size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
    
    console.log(`✅ 轉換完成！`);
    console.log(`   - 有效資料: ${foodItems.length} 筆`);
    console.log(`   - 輸出檔案: ${outputPath}`);
    console.log(`   - 檔案大小: ${fileSizeMB} MB`);
    
    if (fileSize > 50 * 1024 * 1024) {
      console.log(`\n⚠️  檔案超過 50MB，建議使用 Git LFS 管理`);
      console.log(`   執行: git lfs track "public/foods.json"`);
    }
  } catch (error) {
    console.error('❌ 轉換失敗:', error);
    process.exit(1);
  }
}

convertExcelToJson();

