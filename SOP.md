# 員工工作回報系統 — 開發與驗證 SOP

## 規格對齊狀態（2026-11-16）

- ✅ `PRD/SPEC.md` v4.0 已依實際程式重建；`GOAL.md` 定義 M1。
- ⛔ **建議暫緩**：M1 開發需等 Sean 決定（SPEC §14 第 1–3 點）。
- ⚠️ 本次只重建文件，未修改程式、設定或測試。
- ⚠️ 候選 repo（`staff-reporting-system`、`report-form`、`site-report-v2`）尚未併入。

## 環境

```bash
nvm use 20       # 本 repo 沒有 .nvmrc；CI 使用 Node 20
npm ci           # 使用 package-lock.json（CI 為 npm ci --legacy-peer-deps，失敗時改 npm install）
```

環境變數（皆可選；M1 不需要）：`VERCEL_KV_REST_API_URL`、`VERCEL_KV_REST_API_TOKEN`。未設定時目前程式會「不保存但回成功」（M1 AC-002 修正）。

## 驗證指令（依 `package.json` scripts 查證）

| 類型 | 指令 | 狀態 | 結果 |
|---|---|---|---|
| Install | `npm ci` | 可用 | 未在本機執行；CI 成功 |
| Lint | `npm run lint` | 可用（`eslint`，未帶路徑；ESLint 9 預設檢查目前目錄） | 未在本機執行；CI（2026-09-06）成功 |
| Typecheck | `npm run typecheck` | **尚未配置** | 無此 script；目前僅 `next build` 內含型別檢查（AC-001 新增） |
| Unit test | `npm test` | 可用（`vitest run`） | 未在本機執行；CI：1 檔、21 tests 通過 |
| 單一測試檔 | `npm test -- tests/<檔名>.test.ts` | 可用 | 未在本機執行 |
| Build | `npm run build` | 可用（`next build`） | 未在本機執行；CI 成功，路由 `/`、`/main`、`/api/login`、`/api/products`、`/api/records`、`/api/submit` |
| Dev server | `npm run dev` | 可用（`next dev`，http://localhost:3000） | 未在本機執行 |
| Start | `npm start` | 可用（`next start`） | 未在本機執行 |
| E2E | `npm run e2e` | **尚未配置** | 無 Playwright（AC-001 新增） |
| Format | — | **尚未配置** | 無 formatter |
| Secret 掃描 | `git grep -nIE "(sk-[A-Za-z0-9]{10,}\|AKIA[0-9A-Z]{12,}\|ghp_[A-Za-z0-9]{20,}\|-----BEGIN\|script\.google\.com/macros)" -- app tests .github` | 可用（git 指令） | 未在本機執行（本機 git 無法使用）；以下載的 `main` 原始碼人工檢視未發現 |

本機限制：2026-11-16 文件重建時，本機 `git`、`python3` 因 Xcode 授權未同意無法執行，且未安裝 node；上表結果全部來自 GitHub Actions run `34027655561`（`main` @ `c775df5`）。

尚未配置的指令不得當成通過。M1 完成時，下列指令須全部 exit 0（測試以 `TZ=Asia/Taipei`）：

```bash
npm run lint
npm run typecheck   # M1 新增
npm test
npm run build
npm run e2e         # M1 新增
```

## CI 現況（`.github/workflows/ci.yml`）

- 觸發：push／PR 到 `main`、手動。
- lint、test、build 為阻擋性（無 `continue-on-error`）；test 指令為 `npm test -- --run`（與 `vitest run` 重複但無害）。
- deploy：main push 時以 `amondnet/vercel-action@v25` 部署 production；最近一次因未設定 `VERCEL_TOKEN` 失敗。
- 無 typecheck、e2e job；無 preview 部署。
- 以上在 M1 AC-001 調整；本次文件 PR 不改 CI。

## M1 開發流程（解除暫緩後）

1. 讀 `AGENTS.md`、`GOAL.md`、`PRD/SPEC.md` 對應章節。
2. 先做 AC-001（品質閘門），再依序 AC-002～AC-008；每個 AC 一個分支與 PR，PR 標題含 AC 編號。
3. 先寫測試再實作；只用假資料；候選 repo 功能以重寫方式搬入。
4. 跑上表指令並把 exit code 記到 `STATUS.md`。
5. 不 push `main`、不部署 production；合併由 Sean 決定。

## 故意不做（M1）

- ❌ 真實登入、真實持久化服務、`@vercel/kv` 替換。
- ❌ 真實 Email／LINE 通知、郵件憑證。
- ❌ 照片雲端儲存、HEIC 伺服器端轉檔。
- ❌ 真實人員、門市、產品、銷售資料；Logitech 或其他真實品牌資料。
- ❌ 多租戶、計費、打卡、GPS、人臉辨識。
