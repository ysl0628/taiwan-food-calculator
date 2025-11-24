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

### 4. 啟用 GitHub Pages（**必須步驟！**）

⚠️ **重要**：如果跳過此步驟，GitHub Actions 部署會失敗！

1. 前往 GitHub 倉庫的 **Settings** → **Pages**
   - 網址：`https://github.com/YOUR_USERNAME/taiwan-food-calculator/settings/pages`
2. 在 **Source** 區塊中：
   - 選擇 **GitHub Actions**（不是 "Deploy from a branch"）
3. 點擊 **Save**
4. 等待 Actions 完成建置和部署

**驗證**：啟用後，在 Settings → Pages 頁面應該會看到 "Your site is live at..." 的訊息。

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

### Q: 部署時出現 "Creating Pages deployment failed" 或 "Not Found" 錯誤？

A: 這表示 GitHub Pages 還沒有啟用。解決方法：

1. 前往 `https://github.com/YOUR_USERNAME/taiwan-food-calculator/settings/pages`
2. 在 **Source** 區塊選擇 **GitHub Actions**（不是 "Deploy from a branch"）
3. 點擊 **Save**
4. 重新運行 GitHub Actions 工作流

**注意**：必須在第一次部署前完成此步驟，否則會一直失敗。

