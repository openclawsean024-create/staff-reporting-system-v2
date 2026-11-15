# 員工工作回報系統（staffreport）— 產品需求規格 v4.0

> 版本：v4.0（評估＋PRD 重建）｜更新日期：2026-11-16｜狀態：文件重建，尚未依本版開發
> 主 repo：`openclawsean024-create/staff-reporting-system-v2`（預設分支 `main`，重建基準 commit `c775df5`）
> 候選併入 repo（只讀）：
> - `openclawsean024-create/staff-reporting-system`（`master` @ `584138f`，Google Apps Script＋Vercel function）
> - `openclawsean024-create/report-form`（`master` @ `cd4627d`，靜態 HTML＋Vercel function＋Express）
> - `openclawsean024-create/site-report-v2`（`main` @ `c64a643`，只有 PRD 與靜態 dashboard 範本）
> 取代：v3.0.2（2026-09-06，見 `PRD/CHANGELOG.md`）。舊版內容仍可由 git 歷史查閱；`PRD/CHANGELOG.md` 本次不修改。

本文件所有「已實作／部分／未實作」皆以 2026-11-16 實際閱讀程式碼，以及 GitHub Actions 最近一次執行結果為準。**本機無法執行 node（Xcode 授權未同意、未安裝 node），所有 lint／test／build 結果均「未在本機執行」**，只引用 CI 紀錄。README 與程式不一致之處列於 §13。

---

## §0 評估結論

| 項目 | 結論 |
|---|---|
| 現況完成度 | **20／100**。只有「填姓名＋店名 → 輸入或掃描 PN → 查 15 筆寫死示範產品 → 送出 → 看自己今日紀錄」一條流程。無身分驗證、無督導檢視、無匯出、無照片、無主檔管理；未設定 KV 時送出會回傳成功但資料不保存。 |
| 獲利潛力 | **低**。理由見 §0.1。 |
| 目標客群 | 台灣有門市駐點銷售人員（PC／promoter）或商化巡店人員的品牌商、代理商；次要為 5–30 間門市的小型零售連鎖。規模與付費意願**待確認**（無可靠出處）。 |
| 獲利模式 | 首選**專案建置**（替單一品牌或代理商客製回報流程與報表）；若驗證出共通需求，再談 **SaaS 訂閱**。舊 repo 的 `pricing.html`（NT$99／199／399）為未驗證的靜態頁，不作依據。 |
| 主要風險 | ① 與 Sean 在 Logitech 的工作高度重疊（IP 歸屬）；② 舊 repo 公開含真實 Apps Script 端點、試算表 ID 與收件人 Email；③ 紅海市場（巡店／表單／協作工具）；④ 駐點人員姓名、門市與業績屬個資與營業資料；⑤ `@vercel/kv` 已被 Vercel 標示棄用。 |
| 建議 | **暫緩**。現有程式很薄、主要使用情境來自 Sean 的 Logitech 本業，且與私人 repo `sean0407/logi-merch-report` 可能重疊；在 Sean 決定「內部工具 vs. 對外產品」與 IP 歸屬之前，不宜投入開發。若決定對外商業化，需以通用假資料、乾淨重寫（clean-room）方式進行，並以 `GOAL.md` M1 為起點。 |

### 0.1 獲利潛力判斷理由

1. **核心情境是 Logitech 內部流程**：v3.0.2 SPEC 的 Primary persona 是「Logi TW 駐點」；舊 `staff-reporting-system/api/submit.js` 的通知信欄位為「商化」、預設收件人含公司網域。對外可賣的是「通用駐點／巡店回報」，而非這份程式本身。
2. **差異化薄弱**：PN 掃碼＋回報＋當日清單，Google 表單、LINE 群組、既有巡店工具都做得到；舊 PRD 列出的競品與價格（iAuditor、LINE WORKS、雲門 e巡等）沒有附出處，本版一律標「待確認」。
3. **付費者不明**：駐點人員不付費；付費方是品牌行銷或代理商，採購偏向專案而非小額訂閱。
4. **資料整合才是價值**：真正有用的是與品牌的產品主檔、門市主檔、銷售報表（Power BI／Sheets）整合，這部分 Sean 已在 Logitech 內部工具與 skills（如駐點週報、BI dashboard）中處理，外部化會碰到 IP 與資料權限。

### 0.2 重疊與改選建議

| 對象 | 重疊程度 | 說明 |
|---|---|---|
| `sean0407/logi-merch-report`（私人「商化巡店回報系統」，Next.js＋Google Sheets＋Drive＋Asana） | **可能高度重疊** | 無法讀取，未比對程式。**與 sean0407/logi-merch-report 可能重疊，是否合併或擇一由 Sean 決定；該 repo 為公司內部開發，商業化需確認 IP 歸屬。** |
| 第一批 10 個產品（openclawsean024-create） | 低 | `renovation-tracker`（現場進度＋照片回報）概念相近；其餘（beauty-crm、business-card-pro、hotel-pm-pro、contract-tracker 等）不重疊。未讀其程式，僅依產品名稱判斷。 |
| 候選併入的 3 個 repo | 高 | 同一題目的不同嘗試，見 §11 合併清單。 |

**主 repo 是否最佳基礎**：在 openclawsean024-create 的四個 repo 中，`staff-reporting-system-v2` 的 `main` 是唯一有 TypeScript、單元測試且 CI 的 lint／test／build 通過的版本，作為基礎合理。但若 Sean 最後決定只做內部工具，`logi-merch-report` 依 brief 描述功能較完整，可能才是更好的基礎，屆時本 repo 建議封存。此判斷由 Sean 決定。

---

## 1. 問題

品牌或代理商派駐在通路門市的銷售人員與巡店人員，每天需要回報「賣了什麼、門市發生什麼事」：

1. **回報散落**：靠 LINE 群組、紙本或各自的 Google 表單，主管難以當日彙整，也難以按門市、人員、產品查詢。
2. **產品辨識錯誤**：手打型號容易錯；掃 PN／條碼並對應產品主檔與價格可減少錯誤。
3. **現場問題缺乏佐證**：陳列、缺貨、競品活動需附照片並通知相關人員，但照片大、HEIC 格式、Email 附件管理困難。
4. **權限與個資**：銷售業績與人員資料屬營業與個人資料，不應讓任何拿到網址的人讀寫（舊 Apps Script 版本即有此問題）。

## 2. 目標客群

| 類型 | 描述 | 備註 |
|---|---|---|
| Primary | 有 5–50 名門市駐點或巡店人員的品牌商、代理商（例：3C、家電、美妝） | 規模與付費意願待訪談確認 |
| Secondary | 5–30 間門市的小型零售連鎖，店員回報銷售與門市狀況 | 待確認 |
| 不服務 | 需要排班、薪資、考勤打卡法遵的人資情境；人臉辨識打卡 | 見 §8 |

## 3. 獲利模式

- 首選：**專案建置**——為單一品牌／代理商建置回報流程、產品與門市主檔匯入、主管報表；報價待確認。
- 次選：**SaaS 訂閱**——需先完成多租戶（FR-015）與計費（FR-017），屬 M3 以後；價格待確認。
- 不採用：模板販售（差異化不足）、顧問內訓（與產品無關）。

## 4. 競品與差異

| 替代方案 | 說明 | 我們的差異（假設） |
|---|---|---|
| LINE 群組＋人工彙整 | 現況最常見（無統計出處，待確認） | 結構化資料、可查詢、可匯出 |
| Google 表單／Sheets | 免費、易建立 | PN 掃碼對應產品主檔、價格快照、權限分層 |
| 巡店／稽核 SaaS（例如 SafetyCulture／iAuditor） | 功能完整 | 繁中、針對「駐點銷售＋門市事件」兩種回報的輕量流程 |
| 企業協作工具（例如 LINE WORKS） | 通訊為主 | 專注回報資料而非聊天 |

所有競品價格、市佔、客戶案例：**待確認**（舊 PRD 數字無出處，不引用）。

---

## 5. 現況盤點（以程式為準）

### 5.1 主 repo `staff-reporting-system-v2`（`main`）

- 技術棧：Next.js 16.2.3（App Router）、React 19.2.4、TypeScript strict、Tailwind CSS 4、`html5-qrcode`、`@vercel/kv` 3.0.0（lockfile 標示 deprecated）、Vitest 2.1.9、ESLint 9。
- 頁面：`app/page.tsx` 登入頁（姓名＋店名存 `sessionStorage`，以 query string 帶到 `/main`）；`app/main/main-client.tsx` 主頁（PN 輸入、相機掃碼、產品卡片、送出、今日紀錄）。
- API：
  - `POST /api/login`：只檢查非空；**前端從未呼叫**。
  - `GET /api/products?pn=`：查 `app/lib/format.ts` 內寫死的 15 筆 `DEMO_PRODUCTS`（使用 Apple、Samsung、Sony 等真實品牌產品名與價格）。
  - `POST /api/submit`：驗證後寫入 KV key `report:{id}`；**未設定 `VERCEL_KV_REST_API_URL`／`TOKEN` 時不保存仍回 `success: true`**。
  - `GET /api/records?name=&date=`：`kv.keys('report:*')` 全表掃描後依姓名與日期過濾；**無權限檢查**，任何人帶任意姓名即可讀取。
- 日期：`getToday()` 與預設 `date` 皆用 UTC，台灣 00:00–07:59 的紀錄會落在前一天。
- 測試：`tests/format.test.ts` 21 個測試，只測純函式（時間格式、價格格式、產品查表）；無 API、UI、E2E 測試；其中「zero-pads」測試接受未補零結果，斷言過寬。
- CI（`.github/workflows/ci.yml`）：lint、test、build 皆為阻擋性；main push 時 deploy Vercel。最近一次（2026-09-06，run 34027655561）lint／test／build 成功，**deploy 失敗**（未設定 `VERCEL_TOKEN`）。
- 其他：根目錄 `dashboard.html` 為通用模板（「OpenClaw 出品」、假 KPI），不在 `public/`，Next 不會提供；README 為 create-next-app 樣板。
- 非預設分支 `master`：與 `main` 無共同祖先，是較早的 Apps Script 版（`index.html` 46 KB 單頁、`api/submit.js`、Apps Script 歷史檔），含照片上傳（ImgBB，金鑰為佔位字串）、`Admin/Admin` 即成為管理者的前端判斷、**真實 Apps Script Web App 端點**（見 §9.3）。

### 5.2 `staff-reporting-system`（`master`）

- `GoogleAppsScript.js`（README 稱為「目前主要版本」）**無法運作**：`doGet` 定義兩次、使用不存在的 `JsonService`、呼叫 `httpbin.org`。
- `archive/appsscript-*.js` 18 個歷史版本；最完整的 `appsscript-admin.js`／`appsscript-final-v2.js`／`appsscript-tz.js` 提供：從「Price」工作表讀產品與價格、寫入「回報」工作表、`getUserReports`（個人當日清單與金額小計）、`getAllReports`（全體當日清單與總額）、`deleteReport`（以 id＋姓名＋店名比對刪除）。全部走 GET、無驗證；檔內寫死 `SHEET_ID`。
- `api/submit.js`：multipart 上傳 → HEIC 以 `sharp` 轉 JPEG → `nodemailer` Gmail 寄出「駐點人員回報」；`TARGET_EMAIL` 預設值寫死 6 個真實樣式 Email；使用者輸入直接插入 HTML（未跳脫）。
- `index.html` 只轉址到 `dashboard.html`（通用模板）；`pricing.html` 為未接線的方案頁；**repo 內沒有呼叫 `api/submit` 的表單**。
- `package.json` `main: server.js` 但檔案不存在；CI 最近一次（2026-09-06）lint／test／build 失敗。

### 5.3 `report-form`（`master`）

- `submit.html`：回報人、門市（欄位名 `title`）、內容、最多多張照片；前端以 `browser-image-compression`（1 MB、最長邊 1920、轉 JPEG）壓縮。
- `api/submit.js`：手寫 multipart 解析 → 產生 `RPT-xxxxxxxx` 追蹤編號 → 寫入 `data/reports.json` → 若有 Gmail 環境變數則寄 HTML 信（照片 inline）。在 Vercel serverless 上寫檔**不會持久**，`/status` 查詢在正式環境實際上查不到；狀態永遠是 `pending`，沒有更新狀態的介面。使用者輸入未跳脫；CORS `*`。
- `server.js`：本機 Express 版重複實作同一流程，含佔位帳密預設值。
- `index.html` 轉址到通用 `dashboard.html`，與 README「登陸頁」不符。CI 因 `continue-on-error` 顯示成功。

### 5.4 `site-report-v2`（`main`）

- 只有 `SPEC.md`、`PRD/SPEC.md`、通用 `dashboard.html` 與 CI；**沒有任何功能程式碼**。PRD 描述 GPS＋人臉雙驗證打卡、排班匯入、月報等；市場數字無出處。CI 最近一次 deploy 失敗。

---

## 6. 功能需求（FR）

狀態以 2026-11-16 程式為準。「所在 repo」縮寫：v2＝staff-reporting-system-v2 `main`；v2m＝v2 `master` 分支；SRS＝staff-reporting-system；RF＝report-form；SR2＝site-report-v2。

| FR | 需求 | 優先 | 狀態 | 所在 repo | 里程碑 |
|---|---|---|---|---|---|
| FR-001 | 人員身分：登入後取得人員、所屬門市；身分不放在 URL | P0 | 部分（只有姓名＋店名、無驗證、放在 query string） | v2 | M1（mock）、M2（真實登入） |
| FR-002 | PN 手動輸入與相機掃碼 | P0 | 已實作 | v2 | — |
| FR-003 | 產品目錄查詢（名稱、規格、類別、價格） | P0 | 部分（寫死 15 筆真實品牌示範資料） | v2；SRS archive（Sheet 價目表） | M1 |
| FR-004 | 銷售回報送出與持久化（含數量、價格快照、備註） | P0 | 部分（無 KV 時假成功；無數量／備註） | v2；SRS archive（含價格、備註） | M1 |
| FR-005 | 個人當日紀錄（台北時區） | P0 | 部分（UTC 日界、全表掃描） | v2；SRS archive | M1 |
| FR-006 | 刪除自己當日的回報 | P1 | 未實作（v2）；SRS archive 有但無驗證 | SRS archive | M1 |
| FR-007 | 個人／全體當日銷售筆數與金額小計 | P1 | 未實作（v2）；SRS archive 有 | SRS archive | M1 |
| FR-008 | 督導檢視：依日期、門市、人員查全部回報 | P0 | 未實作（v2）；SRS archive `getAllReports` 無權限 | SRS archive | M1 |
| FR-009 | 匯出 CSV | P1 | 未實作 | — | M1 |
| FR-010 | 門市事件回報（標題／門市／內容／照片） | P0 | 未實作（v2）；RF、SRS 有 | RF、SRS | M1（本機 mock 儲存） |
| FR-011 | 照片前端壓縮；HEIC 處理 | P1 | 未實作（v2）；RF 前端壓縮、SRS 以 sharp 轉檔 | RF、SRS | M1（前端壓縮）、M2（HEIC／雲端儲存） |
| FR-012 | 事件通知（Email） | P1 | 未實作（v2）；RF、SRS 以 Gmail 真寄、未跳脫 | RF、SRS | M1（dry-run）、M2（測試信箱） |
| FR-013 | 事件追蹤編號與處理狀態 | P2 | 部分（RF 有編號，狀態無法更新、不持久） | RF | M2 |
| FR-014 | 角色權限：駐點人員／督導／管理者 | P0 | 未實作（v2m 以 `Admin/Admin` 判斷，不算） | — | M1（mock）、M2 |
| FR-015 | 多租戶（品牌／公司隔離） | P1 | 未實作 | — | M3 |
| FR-016 | 門市與人員主檔管理（CSV 匯入） | P1 | 未實作（v2m 有 `getStores` 讀 Sheet） | v2m | M2 |
| FR-017 | 計費方案 | P2 | 未實作（SRS `pricing.html` 為靜態頁） | — | M3 |
| FR-018 | 到店打卡（GPS 快照＋現場照片） | P2 | 未實作（SR2 只有 PRD） | SR2 | 待 Sean 決定 |
| FR-019 | LINE 通知 | P2 | 未實作 | — | M3 |
| FR-020 | 週／月報彙整（含 AI 摘要） | P2 | 未實作（舊 PRD 規劃） | — | M3 |
| FR-021 | 稽核紀錄（誰在何時新增／刪除） | P1 | 未實作 | — | M2 |
| FR-022 | 離線暫存與重送 | P2 | 未實作 | — | M3 |

小計：已實作 1、部分 5（FR-013 的「部分」只存在於 report-form）、未實作 16。

### 6.1 P0 驗收重點

- 送出成功的回報一定可再讀到；儲存不可用時回傳錯誤而非成功（FR-004）。
- 任何讀取回報的 API 都需經角色檢查；駐點人員只看得到自己，督導看得到所轄門市（FR-008、FR-014）。
- 日期邊界以 `Asia/Taipei` 計算（FR-005）。
- 使用者輸入在 HTML（畫面與通知信）中一律跳脫（FR-010、FR-012）。

---

## 7. 非功能需求

| 維度 | 需求 |
|---|---|
| 行動優先 | 360 px 寬可完整操作；不得以 `maximumScale: 1` 禁止縮放 |
| 效能 | 單筆送出在一般 4G 下 2 秒內有回饋（目標，未量測）；查詢不得全表掃描 |
| 可用性 | `html lang="zh-Hant"`；圖示按鈕需有可讀名稱 |
| 可靠性 | 不得假成功；儲存失敗要讓使用者知道並可重試 |
| 時區 | 全系統日期以 `Asia/Taipei` 計算，儲存用 ISO 8601（UTC） |
| 安全 | API 需驗證身分與角色；不使用 CORS `*`；不使用 GET 寫入或刪除 |
| 品質閘門 | lint、typecheck、unit test、build、e2e 皆為 CI 阻擋性檢查 |
| 依賴 | 移除或替換已棄用的 `@vercel/kv`（M2 決定替代方案） |

## 8. 資料與個資處理

### 8.1 資料分級

| 等級 | 資料 | 處理 |
|---|---|---|
| 個資 | 人員姓名、帳號、Email、門市歸屬、照片中可能出現的人臉 | 最小蒐集；不放在 URL；可刪除 |
| 營業資料 | 銷售數量、金額、產品價格、門市事件內容 | 依角色存取；匯出需權限 |
| 公開 | 產品名稱、規格 | — |

### 8.2 規範

- 不做人臉辨識與持續 GPS 追蹤（生物特徵與位置屬高敏感資料）；FR-018 若要做，只取送出當下的定位快照並需明確告知，待 Sean 決定。
- 照片：M1 只存本機 mock；M2 才接雲端儲存並設保存期限。
- 假資料規範：姓名加「示範」或「測試」前綴；電話 `0900-000-xxx`；Email 用 `@example.com`；產品用「示範滑鼠 A」等虛構名稱，不使用真實品牌產品名與真實價格；門市用「示範門市 01」。
- 本 repo 與候選 repo 中疑似真實資料的位置見 §9.3；不得複製到新程式或文件。

## 9. 法規與風險

### 9.1 法規

| 項目 | 說明 |
|---|---|
| 個人資料保護法 | 人員姓名、帳號、照片屬個資；需告知蒐集目的、提供刪除。條文適用細節待確認。 |
| 營業秘密 | 銷售數字與價格屬客戶（品牌商）營業資料；多租戶隔離與權限是商業化前提。 |
| 勞動相關 | 若做打卡（FR-018），可能被視為出勤紀錄，涉及勞動法規；本版列 P2、待確認。 |

### 9.2 商業與技術風險

| 風險 | 說明 | 對策 |
|---|---|---|
| IP 歸屬 | 題目、欄位（「商化」）、收件人網域都指向 Sean 的 Logitech 工作；`logi-merch-report` 為公司內部開發 | 商業化前由 Sean 確認；對外版本以通用假資料 clean-room 重寫 |
| 紅海 | 表單、巡店、協作工具眾多 | 先以專案建置驗證，再談訂閱 |
| 平台 | `@vercel/kv` 已棄用；Vercel 部署 secrets 未設定 | M1 以 adapter 隔離儲存；M2 選定替代方案 |
| 資料遺失 | 現行無 KV 時假成功 | M1 AC-002 |
| 公開端點 | 舊 Apps Script Web App 以擁有者身分執行、任何人可存取，可讀寫刪除試算表 | 由 Sean 評估停用該部署（不在本 PR 範圍） |

### 9.3 已發現的疑似真實資料（只列路徑，不複製內容）

| 路徑 | 內容類型 |
|---|---|
| `staff-reporting-system`：`archive/appsscript-*.js`（多數版本的 `SHEET_ID` 常數與 `openById` 參數） | 寫死的 Google 試算表／檔案 ID |
| `staff-reporting-system`：`api/submit.js` 第 73 行 | `TARGET_EMAIL` 預設值含 6 個真實樣式 Email（含公司網域） |
| `staff-reporting-system-v2` 的 `master` 分支：`index.html` 第 504–505 行 | 真實 Apps Script Web App 部署網址 |
| `staff-reporting-system-v2` 的 `master` 分支：`api/submit.js` 第 73 行、`appsscript-*.js` | 同上收件人 Email 與試算表 ID |
| `staff-reporting-system` 的 `main` 分支：`staff-reporting-system/appsscript-*.js` | 試算表 ID |
| `staff-reporting-system` 的 `main` 分支：`USER.md`、`SOUL.md`、`TOOLS.md`、`.openclaw/workspace-state.json`、`project-dashboard/.vercel/project.json` | AI agent 工作區設定與 Vercel 專案設定檔，可能含使用者描述與專案／組織 ID（未檢出金鑰樣式字串） |

上述 repo 皆為公開。是否轉私有、停用 Apps Script 部署或清理 git 歷史，由 Sean 決定；本 PR 不處理。未發現 API 金鑰或密碼明文（`report-form/server.js`、`v2 master/index.html` 為佔位字串）。

---

## 10. 里程碑

| 里程碑 | 範圍 | 前提 |
|---|---|---|
| **M1：可信的本機回報閉環** | 品質閘門；儲存 adapter（不假成功）；台北時區；通用假產品目錄；回報欄位擴充、刪除、小計；mock 身分與督導檢視、CSV 匯出；門市事件回報（前端壓縮、通知 dry-run、跳脫）；假資料與秘密掃描 | Sean 決定「暫緩」解除後才開始（見 `GOAL.md`） |
| **M2：可試用** | 選定持久化（Redis 或 Postgres 等，待決）與真實登入；照片雲端儲存與 HEIC；Email 測試信箱；門市／人員主檔匯入；稽核紀錄；1 家非 Logitech 試用對象 | IP 確認；試用對象 |
| **M3：可收費** | 多租戶、計費（測試模式 → 正式）、LINE 通知、週／月報、離線暫存 | M2 試用回饋 |

## 11. 合併清單

### 11.1 要搬（以重寫方式搬入，不複製原檔）

| 來源 | 功能 | 搬到 | 里程碑 |
|---|---|---|---|
| SRS `archive/appsscript-admin.js`（概念） | 產品價格、回報備註、價格快照 | `app/lib` 純函式＋產品目錄 adapter | M1 |
| SRS `archive/appsscript-admin.js`（概念） | 個人與全體當日筆數／金額小計（`getUserReports`、`getAllReports`） | 純函式＋督導頁 | M1 |
| SRS `archive/appsscript-admin.js`（概念） | 刪除自己當日回報（`deleteReport`） | `DELETE` API，需身分檢查 | M1 |
| RF `submit.html`、`src/lib/imageCompression.js` | 事件回報欄位、前端圖片壓縮參數（1 MB／1920 px／JPEG） | Next 頁面＋`browser-image-compression` | M1 |
| RF `api/submit.js` | 追蹤編號格式 `RPT-xxxxxxxx`、通知信版面概念 | 通知 adapter（dry-run）＋HTML 跳脫 | M1 |
| SRS `api/submit.js` | HEIC → JPEG 轉換 | 伺服器端圖片處理 | M2 |
| v2m `index.html` | 門市清單讀取（`getStores`）概念 | 門市主檔 CSV 匯入 | M2 |
| SR2 `PRD/SPEC.md` | 到店打卡、異常通知、月報需求 | 只進 backlog（FR-018～FR-020） | 待決 |

### 11.2 不搬

| 項目 | 原因 |
|---|---|
| SRS `GoogleAppsScript.js` | 無法運作（重複 `doGet`、未定義 `JsonService`） |
| 所有寫死的試算表 ID、Apps Script 網址、收件人 Email | 疑似真實資料（§9.3） |
| Apps Script「任何人可存取」Web App 架構、以 GET 寫入／刪除 | 無驗證、無權限 |
| `nodemailer`＋Gmail App Password 寄信 | 個人信箱憑證模式不適合產品；M2 改用測試信箱服務（待決） |
| RF `data/reports.json` 檔案儲存、`server.js` Express 重複實作、手寫 multipart 解析、CORS `*` | serverless 不持久；重複實作；安全性 |
| v2m `Admin/Admin` 管理者判斷、localStorage 歷史、ImgBB 上傳 | 可被任意冒用；資料不在伺服器；第三方圖床不適合營業資料 |
| 三個 repo 共用的 `dashboard.html` 通用模板、SRS `pricing.html` | 假數據、與產品無關；價格未驗證 |
| SR2 人臉辨識打卡 | 生物特徵個資，風險與成本過高 |
| v2 現有 `DEMO_PRODUCTS` 真實品牌產品名與價格 | 改為虛構示範資料（AC-004） |

### 11.3 合併後處置

候選 repo 的去留（封存、轉私有、保留）由 Sean 決定；本次不封存、不改名、不改設定。建議 Sean 優先處理 §9.3 所列公開資料與 Apps Script 公開端點。

## 12. 成功指標

| 階段 | 指標 | 門檻 |
|---|---|---|
| M1 | `GOAL.md` AC 全數通過；CI 全綠 | 100% |
| M1 | 回報送出後可讀回比例（自動化測試） | 100% |
| M2 | 試用對象連續 4 週每日使用的駐點人員比例 | 待與試用對象訂定 |
| M2 | 主管當日彙整時間（自述，前後比較） | 待確認基準 |
| M3 | 付費客戶數、續約率 | 待確認 |

## 13. README／文件與程式不一致處

| # | 文件說法 | 程式實況 |
|---|---|---|
| 1 | v2 `README.md` 為 create-next-app 樣板 | 未描述本產品、指令與環境變數 |
| 2 | v3.0.2 SPEC FR-006「GET /api/login 登入驗證／session，shipped」 | 實為 `POST`，只檢查非空；前端不呼叫；無 session |
| 3 | v3.0.2 SPEC §4「Privacy：無個資蒐集」 | 蒐集姓名與店名，放在 URL query 與 KV |
| 4 | v3.0.2 SPEC §4「WCAG 2.1 AA、按鈕 aria-label」 | 無 `aria-label`；`<html lang="en">`；`maximumScale: 1` 禁止縮放 |
| 5 | v3.0.2 SPEC §6「GHA CI 4 jobs 全綠」 | 最近一次 deploy job 失敗（缺 `VERCEL_TOKEN`） |
| 6 | v3.0.2 SPEC §7「Preview：Per-PR」 | CI 沒有 preview 部署 |
| 7 | v3.0.2 SPEC FR-008「無 KV 時降級」列為已上線功能 | 實為靜默遺失資料：回傳成功但未保存 |
| 8 | v3.0.2 SPEC §2.2「督導查當日紀錄」 | 無督導介面；API 只能依姓名查，且不驗證身分 |
| 9 | v3.0.2 SPEC §1.2 Primary persona「Logi TW 駐點」 | 示範產品為 Apple／Samsung 等，與 persona 不符；且 persona 帶出 IP 問題 |
| 10 | `PRD/CHANGELOG.md` v1.0「LINE 打卡、Excel 月報」 | 兩個分支皆無此程式 |
| 11 | v2 `app/lib/format.ts` 註解「與 main-client.tsx 同名函式語意一致」 | main-client 已改為 import，該註解過時 |
| 12 | SRS `README.md`「`GoogleAppsScript.js` 為目前主要版本」、「`index.html` 為 Web UI」 | 該檔無法運作；`index.html` 只轉址到通用模板 |
| 13 | RF `README.md`「登陸頁 `/`」、「追蹤編號查詢處理進度」、「資料安全保障」 | `/` 轉址到通用模板；狀態不更新且正式環境不持久；CORS `*`、無驗證 |
| 14 | SR2 PRD §6「GHA 全綠」 | 最近一次 deploy 失敗 |

## 14. 待 Sean 決定

1. 本產品定位：Logitech 內部工具、對外產品，或封存？（決定是否解除「暫緩」）
2. 與 `sean0407/logi-merch-report` 合併或擇一；若擇一，本 repo 是否封存。
3. IP 歸屬：對外商業化前是否需公司同意；是否以 clean-room 方式重寫。
4. §9.3 公開資料處理：停用舊 Apps Script 部署、repo 轉私有或清理歷史。
5. 三個候選 repo 與 v2 `master` 分支的去留。
6. M2 持久化與登入方案（Redis／Postgres、Email magic link／LINE Login 等）。
7. 到店打卡（FR-018）是否列入產品範圍。

## 15. 變更紀錄

- v4.0（2026-11-16）：依程式實況重建；新增 §0 評估結論、合併清單、文件不一致清單；建議暫緩。只改文件。
- v3.0.2（2026-09-06）以前：見 `PRD/CHANGELOG.md` 與 git 歷史。
