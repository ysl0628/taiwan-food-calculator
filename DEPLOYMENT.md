# 部署指南

## 首次部署步驟

### 1. 準備資料檔案

```bash
# 確保 raw_data.xlsx 在專案根目錄
# 轉換為 JSON
pnpm convert-excel
```

### 2. 設定 Git LFS（如果 foods.json > 50MB）

```bash
# 安裝 Git LFS（如果還沒安裝）
git lfs install

# 追蹤大檔案
git lfs track "public/foods.json"

# 提交設定
git add .gitattributes
```

### 3. 提交檔案到 Git

```bash
# 添加所有檔案（包括 public/foods.json）
git add public/foods.json
git add .

# 提交
git commit -m "Initial commit with foods.json"

# 推送到 GitHub
git push origin main
```

### 4. 啟用 GitHub Pages

1. 前往 GitHub 倉庫的 **Settings** → **Pages**
2. Source 選擇 **GitHub Actions**
3. 等待 Actions 完成建置和部署

## 更新資料

當 `raw_data.xlsx` 更新時：

```bash
# 1. 更新 Excel 檔案（本地）
# 2. 重新轉換
pnpm convert-excel

# 3. 提交新的 JSON
git add public/foods.json
git commit -m "Update foods data"
git push origin main

# 4. GitHub Actions 會自動重新部署
```

## 常見問題

### Q: 為什麼 raw_data.xlsx 不提交？

A: 因為檔案太大，超過 GitHub 的檔案大小限制（100MB）。我們只提交轉換後的 `public/foods.json`。

### Q: 如果 foods.json 也很大怎麼辦？

A: 使用 Git LFS（Large File Storage）來管理大檔案。已經在 `.gitattributes` 中設定好了。

### Q: 部署後沒有資料？

A: 檢查：
1. `public/foods.json` 是否已提交到 Git
2. 檔案是否在 `public/` 目錄下
3. 瀏覽器 Console 是否有錯誤

### Q: 如何確認 foods.json 已提交？

```bash
git ls-files | grep foods.json
# 應該顯示：public/foods.json
```

