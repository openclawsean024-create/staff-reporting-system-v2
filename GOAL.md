# Goal — 員工工作回報系統 M1

> **建議暫緩，需 Sean 決定後才開發。** 理由見 `PRD/SPEC.md` §0：程式完成度約 20／100、主要情境來自 Logitech 本業、可能與 `sean0407/logi-merch-report` 重疊，且商業化需先確認 IP 歸屬。以下 M1 只在 Sean 決定「解除暫緩並以對外產品方向開發」後才執行。

## Objective

在只使用明顯假資料、不寄出真實通知、不連接真實雲端儲存的前提下，把現有「PN 掃碼回報」原型做成可信的本機閉環：駐點人員能回報銷售與門市事件、督導能依權限檢視與匯出，且送出的資料一定讀得回來；同時建立擋得住失敗的品質閘門。候選 repo 的功能依 `PRD/SPEC.md` §11 以重寫方式搬入。

規格依據：`PRD/SPEC.md` v4.0（§6 FR、§10 M1、§11 合併清單）。

## Acceptance criteria

每條 AC 的「驗證」指令都必須 exit 0。測試檔名為 M1 需新增的檔案，名稱可在實作 PR 中調整，但須同步更新本檔與 `SOP.md`。所有測試以 `TZ=Asia/Taipei` 執行。

- **AC-001：品質閘門真正擋得住失敗**
  - `package.json` 新增 `typecheck`（`tsc --noEmit`）與 `e2e`（Playwright，固定 `Asia/Taipei`、使用 mock 儲存）script；`lint` 改為明確的 `eslint .`。
  - CI 新增 typecheck 與 e2e job，所有檢查 job 都不得有 `continue-on-error` 或 `|| echo`／`|| true` 吞錯；deploy job 只在所有檢查通過、且為 main push 時執行，未設定 Vercel secrets 時以條件跳過而非失敗。
  - 收緊 `tests/format.test.ts` 中接受未補零結果的斷言（固定時區後斷言 `05:07:09`）。
  - 驗證：`npm run lint && npm run typecheck && npm test && npm run build && npm run e2e` 全部 exit 0；`grep -nE "continue-on-error|\|\| *(echo|true)" .github/workflows/ci.yml` 無結果；PR 上 GitHub Actions 檢查 job 全綠。

- **AC-002：儲存層不再假成功**（FR-004）
  - 新增 `ReportStore` 介面與兩個實作：`MemoryReportStore`（開發與測試）、`KvReportStore`（包裝既有 KV client，M1 只以 mock client 測試）。API route 只透過介面存取。
  - 正式模式（`NODE_ENV=production`）下若未設定儲存，`POST /api/submit` 回 503 與明確訊息，不得回 `success: true`。
  - 讀取不得使用 `keys('report:*')` 全表掃描；改以「日期＋門市」索引（例如每日 sorted set 或等效結構）。
  - 驗證：`npm test -- tests/report-store.test.ts tests/api-submit.test.ts`（斷言：寫入後可讀回；無儲存時回 503；mock KV 的 `keys` 呼叫次數為 0）。

- **AC-003：台北時區日界**（FR-005）
  - 「今日」與預設查詢日期一律以 `Asia/Taipei` 計算；儲存仍為 UTC ISO 8601。
  - 驗證：`npm test -- tests/date-boundary.test.ts`（以 fake timers 設定 `2026-01-01T23:30:00Z`，斷言今日為 `2026-01-02`，且該筆紀錄出現在 `2026-01-02` 的查詢結果）。

- **AC-004：通用假產品目錄與 CSV 匯入**（FR-003；合併 SRS 價目表概念）
  - 移除 `DEMO_PRODUCTS` 中的真實品牌產品名與價格，改為 `fixtures/products.csv` 的虛構資料（例：「示範滑鼠 A」），欄位：PN、名稱、規格、類別、價格。
  - 新增 `ProductCatalog` 介面與 CSV 解析純函式：重複 PN、價格非數字、必填欄位缺漏時回傳逐列錯誤。
  - 驗證：`npm test -- tests/product-catalog.test.ts`；`git grep -niE "iphone|macbook|airpods|samsung|sony|nintendo|ps5|logitech|logi " -- app fixtures tests` 無結果。

- **AC-005：銷售回報欄位、當日刪除與小計**（FR-004、FR-006、FR-007；合併 SRS `getUserReports`／`deleteReport` 概念）
  - 回報新增數量（正整數）、送出當下的價格快照、備註（上限 200 字）。
  - 駐點人員可刪除自己當日的回報；刪除他人或非當日回報回 403；刪除改用 `DELETE` 方法。
  - 純函式計算個人與全體當日筆數、數量、金額小計。
  - 驗證：`npm test -- tests/report-rules.test.ts tests/api-delete.test.ts`；`npm run e2e -- tests/e2e/report-flow.spec.ts`（查詢 → 送出 → 清單與小計更新 → 刪除 → 小計回復）。

- **AC-006：mock 身分、角色權限與督導檢視**（FR-001、FR-008、FR-009、FR-014）
  - 以 `fixtures/accounts.json` 假帳號（駐點人員、督導、管理者）建立 mock session（httpOnly cookie，僅開發／測試模式啟用，程式中明確標示非正式登入）；姓名與門市不再出現在 URL query。
  - 純函式 `can(account, action, resource)`：駐點人員只能讀寫自己的回報；督導只能讀所轄門市；管理者可讀全部並匯出。所有回報 API 先做權限檢查。
  - 新增督導頁：依日期、門市、人員篩選，顯示當日總額；可匯出 CSV（UTF-8 BOM，含「含營業資料」標註列）。
  - 驗證：`npm test -- tests/permissions.test.ts tests/csv-export.test.ts`（權限矩陣逐格測試）；`npm run e2e -- tests/e2e/supervisor.spec.ts`；`git grep -nE "searchParams\.get\('(name|store)'\)" -- app` 無結果。

- **AC-007：門市事件回報（照片壓縮＋通知 dry-run）**（FR-010、FR-011、FR-012；合併 RF 表單與壓縮）
  - 新增事件回報頁：門市、標題、內容、最多 5 張照片；前端以 `browser-image-compression` 壓縮（1 MB、最長邊 1920、JPEG）。照片在 M1 只存 mock 儲存。
  - 新增 `Notifier` 介面與 dry-run 實作：產生通知內容並寫入本機「通知紀錄」，狀態 `dry-run`；M1 不安裝 `nodemailer`、不讀取任何郵件憑證、不呼叫網路。
  - 畫面與通知 HTML 中的使用者輸入一律跳脫。
  - 驗證：`npm test -- tests/notifier.test.ts tests/escape.test.ts`（mock `fetch` 呼叫次數為 0；輸入 `<script>` 時輸出為跳脫字元）；`npm run e2e -- tests/e2e/incident.spec.ts`；`git grep -nE "nodemailer|GMAIL_|SMTP_" -- app package.json` 無結果。

- **AC-008：只用明顯假資料、無秘密、文件一致**
  - 所有 fixture 與測試資料符合 `PRD/SPEC.md` §8.2：姓名加「示範」或「測試」前綴、電話 `0900-000-xxx`、Email `@example.com`、門市「示範門市 NN」。
  - 新增自動檢查測試：掃描 `fixtures/` 與 `tests/`，出現不在 `0900-000-` 範圍的 `09` 開頭電話、非 `example.com` Email、Google 試算表 ID 樣式字串或 `script.google.com/macros` 即失敗。
  - README 改寫為本產品說明（功能、指令、環境變數、mock 範圍），與 `SOP.md` 一致；刪除或移出未被 Next 提供的根目錄 `dashboard.html`。
  - 驗證：`npm test -- tests/fixtures-safety.test.ts`；`git grep -nIE "(sk-[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{12,}|ghp_[A-Za-z0-9]{20,}|-----BEGIN|script\.google\.com/macros)" -- app tests fixtures .github ':!tests/fixtures-safety.test.ts'` 無結果（排除檢查測試本身的樣式字串）。

## Out of scope

- 真實登入、帳號註冊、SSO／LINE Login（M2）。
- 真實持久化服務的建立與選型（Upstash Redis、Postgres 等）、`@vercel/kv` 替換（M2 決定）。
- 真實 Email／LINE 通知、Gmail 帳號或 App Password、任何郵件服務金鑰（M2 只接測試信箱）。
- 照片雲端儲存、HEIC 伺服器端轉檔（M2）。
- 真實人員、門市、產品、銷售資料；任何 Logitech 或其他真實品牌資料；與 `logi-merch-report` 的整合。
- 多租戶、計費、金流（M3）；到店打卡、GPS、人臉辨識（待 Sean 決定）。
- production 部署、Vercel 設定或 secrets 變更；封存、刪除、改名或改設定任何 repo；停用舊 Apps Script 部署（由 Sean 處理）。

## Exit gate

- Sean 已書面解除「暫緩」，並確認 `PRD/SPEC.md` §14 第 1–3 點。
- AC-001～AC-008 的驗證指令全部 exit 0，指令與結果記錄於 `STATUS.md`。
- 實作 PR 的 GitHub Actions 檢查 job 全綠（lint、typecheck、test、build、e2e）。
- `PRD/SPEC.md` §11.1 標為 M1 的「要搬」項目皆有對應模組與測試；§11.2「不搬」原因仍成立。
- Sean 覆審後才可進入 M2（真實登入、持久化、通知測試信箱、試用對象）。
