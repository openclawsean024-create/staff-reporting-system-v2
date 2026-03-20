# staff-reporting-system v2

正式第二版的 staff reporting system。

## 結構
- `index.html`：前端頁面
- `api/`：Vercel serverless API
- `vercel.json`：部署設定
- `package.json`：專案設定

## Apps Script 檔案說明
此目錄保留多個 Apps Script 歷史版本，目的是保留遷移與除錯脈絡，避免第二版正式化時把先前實驗脈絡直接丟失。

- `GoogleAppsScript.js`：較早期整合版
- `appsscript-final.js` / `appsscript-final-v2.js`：接近正式版的收斂稿
- `appsscript-admin.js`：管理向版本
- `appsscript-fixed.js` / `appsscript-tz.js` / `appsscript-price.js`：特定修正版本
- `appsscript-v3.js` ~ `appsscript-v13.js`：歷史迭代版本
- `appsscript-simple.js`：簡化版本

## 保留策略
目前先保留這些歷史檔於 repo 根目錄，避免功能與流程背景流失；後續若要進一步整理，可再搬入 `archive/` 或 `references/`。

## 部署
預期部署於 Vercel。
