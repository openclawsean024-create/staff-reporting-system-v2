<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — 員工工作回報系統（staff-reporting-system-v2）

> **目前狀態：建議暫緩。** 在 Sean 解除暫緩前，只允許文件與品質檢查相關變更；不得開始 `GOAL.md` 的功能開發。

## 1. 權威文件與範圍

- 規格：[`PRD/SPEC.md`](./PRD/SPEC.md) v4.0（§0 評估、FR 狀態、合併清單、里程碑、待決事項）。
- 目前目標：[`GOAL.md`](./GOAL.md)（只含 M1）。
- 驗證指令：[`SOP.md`](./SOP.md)；目前狀態：[`STATUS.md`](./STATUS.md)。
- 歷史：`PRD/CHANGELOG.md`（v3.0.2 以前，與 v4.0 衝突時以 v4.0 為準）。
- 候選併入 repo（**只讀**）：`staff-reporting-system`、`report-form`、`site-report-v2`；搬什麼、不搬什麼以 SPEC §11 為準，一律重寫、不複製原檔。
- 可能重疊：`sean0407/logi-merch-report`（私人、公司內部開發）。不得讀取、引用或搬入其程式與資料；合併或擇一由 Sean 決定。

## 2. 專案結構（`main`）

```
app/
├── page.tsx                 # 登入頁（姓名＋店名 → sessionStorage → /main?name=&store=）
├── main/page.tsx            # Suspense 包裝
├── main/main-client.tsx     # PN 輸入／掃碼、產品卡片、送出、今日紀錄
├── api/login/route.ts       # POST，只檢查非空；前端未使用
├── api/products/route.ts    # GET ?pn=，查 DEMO_PRODUCTS
├── api/submit/route.ts      # POST，寫入 KV（未設定時不保存但回成功）
├── api/records/route.ts     # GET ?name=&date=，KV 全表掃描
├── lib/format.ts            # 純函式與 DEMO_PRODUCTS（15 筆）
├── layout.tsx、globals.css
tests/format.test.ts         # Vitest，21 tests
dashboard.html               # 通用模板，不在 public/，Next 不提供
PRD/                         # SPEC.md、CHANGELOG.md
```

非預設分支 `master` 是與 `main` 無共同祖先的舊 Apps Script 版，含真實 Apps Script 端點與收件人 Email；**不得從 `master` 合併或複製任何內容**。

## 3. 技術棧

| 項目 | 版本／說明 |
|---|---|
| 框架 | Next.js 16.2.3（App Router），React 19.2.4 |
| 語言 | TypeScript 5 strict，路徑別名 `@/*` |
| 樣式 | Tailwind CSS 4（`@tailwindcss/postcss`） |
| 掃碼 | `html5-qrcode` 2.3.8 |
| 儲存 | `@vercel/kv` 3.0.0（lockfile 標示已棄用）；環境變數 `VERCEL_KV_REST_API_URL`、`VERCEL_KV_REST_API_TOKEN`（可選） |
| 測試 | Vitest 2.1.9（`environment: node`，`tests/**/*.test.ts(x)`） |
| Lint | ESLint 9 flat config＋`eslint-config-next` 16.2.3 |
| CI | `.github/workflows/ci.yml`：lint、test、build（阻擋性），main push 時 deploy Vercel |

## 4. 開發規則

1. **只用假資料**：fixture、測試、seed、文件範例依 SPEC §8.2（「示範」／「測試」前綴、電話 `0900-000-xxx`、Email `@example.com`、虛構產品與門市）。不得使用真實品牌產品名與價格、真實人員或門市。發現疑似真實資料時不要複製，回報檔案路徑。
2. **不得提交憑證**：token、API key、郵件帳密、`.env*`、試算表 ID、Apps Script 網址都不得進 repo。M1 不得讀取任何郵件、LINE 或雲端儲存憑證。
3. **不假成功**：儲存或通知失敗必須回傳錯誤；不得以「降級」名義回傳 `success: true`。
4. **不自動發送**：M1 通知只能 dry-run，不得呼叫網路、不得安裝 `nodemailer`。
5. **權限**：所有回報 API 先做角色檢查；不得用 GET 寫入或刪除；不得使用 CORS `*`；身分資訊不得放在 URL。
6. **時區**：日期邊界一律 `Asia/Taipei`；測試以 `TZ=Asia/Taipei` 執行。
7. **測試不可為了通過而刪改斷言**：不得刪除、`.skip`／`.only`、放寬斷言或改期望值來讓測試通過；行為變更需在 PR 說明並對應 FR／AC。
8. **不擴大 scope**：多租戶、計費、打卡、GPS、人臉辨識、LINE、AI 月報不在 M1；新增需求先改 SPEC 並經 Sean 同意。
9. **依賴**：新增依賴需在 PR 說明理由並固定版本；不引入第二套樣式系統。
10. **Git**：從 `main` 開分支、以 PR 合併；不直接 push `main`、不 force push、不改 repo 設定；未經 Sean 同意不得部署 production、封存或刪除任何 repo。
11. **Commit 格式**：`<type>(scope): <說明或 FR/AC 編號>`，例如 `feat(store): AC-002 ReportStore adapter`。

## 5. 驗證

指令與目前狀態見 [`SOP.md`](./SOP.md)。尚未配置的指令（typecheck、e2e、format）不得宣稱已通過；未在本機執行的檢查須如實標示。
