# Taiwan Food Calculator (Next.js)

台灣營養計算專業版 - 已遷移至 Next.js，使用 `raw_data.xlsx` 作為食材資料來源。

## 功能特色

- 個案評估：計算 TDEE（總熱量消耗）
- 飲食處方：制定個人化飲食計劃
- 飲食紀錄：記錄每日飲食內容
- 成效分析：分析營養攝取是否符合目標
- 個案紀錄：保存和管理個案資料

## 技術棧

- **框架**: Next.js 15
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **資料處理**: xlsx (讀取 Excel 檔案)

## 安裝與運行

### 1. 安裝依賴

使用 pnpm 安裝依賴：

```bash
pnpm install
```

### 2. 確保 Excel 檔案存在

確保專案根目錄下有 `raw_data.xlsx` 檔案，此檔案包含所有食材資料。

**注意**：`raw_data.xlsx` 檔案不會被提交到 Git 倉庫（因為檔案較大）。請確保在本地保留此檔案，或從其他來源獲取。

### 3. 啟動開發伺服器

```bash
pnpm dev
```

應用程式將在 [http://localhost:3000](http://localhost:3000) 運行。

### 4. 建置生產版本

```bash
pnpm build
pnpm start
```

## 專案結構

```
taiwan-food-calculator/
├── app/
│   ├── api/
│   │   └── foods/
│   │       └── route.ts      # API 路由：讀取 raw_data.xlsx
│   ├── globals.css            # 全域樣式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 主頁面
├── components/                # React 組件
├── types.ts                   # TypeScript 類型定義
├── raw_data.xlsx              # 食材資料 Excel 檔案
└── package.json
```

## 資料來源

食材資料從 `raw_data.xlsx` 讀取，透過 `/api/foods` API 路由提供給前端使用。

Excel 檔案應包含以下欄位：
- 樣品名稱
- 俗名（可包含多個值，以逗號分隔）
- 食品分類
- 熱量(kcal)
- 粗蛋白(g)
- 粗脂肪(g)
- 總碳水化合物(g)
- 以及其他營養素欄位...

**重要**：`raw_data.xlsx` 檔案需要放在專案根目錄下，應用程式才能正常運作。

## 開發注意事項

- 所有組件使用 `@/` 作為路徑別名
- 使用 `'use client'` 標記客戶端組件
- API 路由在伺服器端執行，可直接讀取檔案系統
