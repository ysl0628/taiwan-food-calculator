# Taiwan Food Calculator

台灣營養計算專業版 - 純前端應用，可部署至 GitHub Pages。

## 功能特色

- 個案評估：計算 TDEE（總熱量消耗）
- 熱量設計：制定個人化飲食計劃
- 飲食紀錄：記錄每日飲食內容
- 成效分析：分析營養攝取是否符合目標
- 個案紀錄：保存和管理個案資料（使用 localStorage）

## 技術棧

- **框架**: Next.js 15 (靜態導出)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **資料處理**: xlsx (Excel 轉換工具)

## 安裝與運行

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 轉換 Excel 為 JSON

將 `raw_data.xlsx` 轉換為 `public/foods.json`：

```bash
pnpm convert-excel
```

**重要說明**：
- `raw_data.xlsx` 檔案**不會**被提交到 Git（檔案太大，已加入 `.gitignore`）
- `public/foods.json` 檔案**必須**提交到 Git（這是部署時使用的資料來源）
- 如果更新了 `raw_data.xlsx`，需要重新執行轉換並提交新的 `public/foods.json`

### 3. 啟動開發伺服器

```bash
pnpm dev
```

應用程式將在 [http://localhost:3000](http://localhost:3000) 運行。

### 4. 建置靜態版本

```bash
pnpm build
```

建置後的靜態檔案會在 `out/` 目錄中。

## 部署到 GitHub Pages

### 方法 1: 使用 GitHub Actions (推薦)

1. **首次設定**：確保已轉換 Excel 並提交 JSON 檔案
```bash
# 轉換 Excel 為 JSON
pnpm convert-excel

# 如果 foods.json 很大（>50MB），設定 Git LFS
git lfs install
git lfs track "public/foods.json"
git add .gitattributes public/foods.json
git commit -m "Add foods.json data"
```

2. 推送程式碼到 GitHub（包含 `public/foods.json`）

3. **重要：在 GitHub 設定中啟用 GitHub Pages**：
   - 前往仓库：`https://github.com/YOUR_USERNAME/taiwan-food-calculator/settings/pages`
   - 在 **Source** 下拉選單中選擇：**GitHub Actions**
   - 點擊 **Save**
   - ⚠️ **必須先完成此步驟，否則部署會失敗！**

4. GitHub Actions 會自動建置並部署（見 `.github/workflows/deploy.yml`）

**資料來源**：部署時會從 Git 倉庫的 `public/foods.json` 讀取資料，所以這個檔案必須提交到 Git。

### 方法 2: 手動部署

```bash
# 建置靜態檔案
pnpm build

# 將 out/ 目錄內容推送到 gh-pages 分支
```

## 專案結構

```
taiwan-food-calculator/
├── app/
│   ├── globals.css            # 全域樣式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 主頁面
├── components/                # React 組件
├── public/
│   └── foods.json             # 食材資料 JSON（由 Excel 轉換）
├── scripts/
│   └── convert-excel.js       # Excel 轉 JSON 腳本
├── types.ts                   # TypeScript 類型定義
└── package.json
```

## 資料來源

食材資料從 `public/foods.json` 載入（純前端，無需後端）。

### 資料流程

```
本地開發：
raw_data.xlsx (不提交) 
  ↓ pnpm convert-excel
public/foods.json (提交到 Git)
  ↓ git push
GitHub 倉庫
  ↓ GitHub Actions 建置
GitHub Pages 部署
  ↓ 瀏覽器請求
/foods.json (從靜態檔案載入)
```

### 更新資料

1. 更新本地的 `raw_data.xlsx` 檔案
2. 執行轉換腳本：`pnpm convert-excel`
3. **提交 `public/foods.json` 到 Git**（這是部署時使用的資料）
4. 推送到 GitHub，GitHub Actions 會自動重新部署

**重要**：`public/foods.json` 必須在 Git 倉庫中，否則部署後會沒有資料！

## 大檔案處理

如果 `foods.json` 超過 50MB，建議使用 Git LFS：

```bash
# 安裝 Git LFS
git lfs install

# 追蹤大檔案
git lfs track "public/foods.json"

# 提交 .gitattributes
git add .gitattributes
git commit -m "Add Git LFS tracking for foods.json"
```

## 開發注意事項

- 所有組件使用 `@/` 作為路徑別名
- 使用 `'use client'` 標記客戶端組件
- 應用程式為純前端，所有資料在瀏覽器端處理
- 個案紀錄使用 `localStorage` 保存（可選，未實作）
