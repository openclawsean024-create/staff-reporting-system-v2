# Status — staff-reporting-system-v2（員工工作回報系統）

- 產品代號：staffreport；產品名稱（暫定）：員工工作回報系統
- 主 repo：`openclawsean024-create/staff-reporting-system-v2`（`main` @ `c775df5`）
- 候選併入（只讀）：`staff-reporting-system`（`master` @ `584138f`）、`report-form`（`master` @ `cd4627d`）、`site-report-v2`（`main` @ `c64a643`）
- 規格：`PRD/SPEC.md` v4.0；目標：`GOAL.md`（M1）
- 狀態：⛔ **建議暫緩**；🟡 文件重建完成，**尚未開發**（2026-11-16）

## §0 評估摘要

| 項目 | 結論 |
|---|---|
| 完成度 | 20／100 |
| 獲利潛力 | 低 |
| 獲利模式 | 專案建置為主；SaaS 訂閱待驗證 |
| 建議 | 暫緩——程式薄、情境源自 Logitech 本業、可能與 `sean0407/logi-merch-report` 重疊、IP 待確認 |

## 目前狀態摘要

- 可運作：登入（姓名＋店名，無驗證）→ 輸入或掃描 PN → 查 15 筆寫死示範產品 → 送出 → 看自己今日紀錄。
- 缺陷：未設定 KV 時送出「假成功」；`/api/records` 無權限、全表掃描；日期以 UTC 計算；身分放在 URL；示範產品使用真實品牌名與價格；`@vercel/kv` 已棄用。
- 無督導檢視、匯出、照片、事件回報、通知、主檔管理、權限。

## FR 對照（以程式為準）

| FR | 需求 | 優先 | 狀態 | 所在 repo |
|---|---|---|---|---|
| FR-001 | 人員身分 | P0 | 部分 | v2 |
| FR-002 | PN 輸入與掃碼 | P0 | 已實作 | v2 |
| FR-003 | 產品目錄查詢 | P0 | 部分 | v2；SRS archive |
| FR-004 | 銷售回報送出與持久化 | P0 | 部分 | v2；SRS archive |
| FR-005 | 個人當日紀錄（台北時區） | P0 | 部分 | v2；SRS archive |
| FR-006 | 刪除自己當日回報 | P1 | 未實作（SRS archive 有，無驗證） | SRS archive |
| FR-007 | 當日筆數／金額小計 | P1 | 未實作（SRS archive 有） | SRS archive |
| FR-008 | 督導檢視 | P0 | 未實作（SRS archive 有，無權限） | SRS archive |
| FR-009 | 匯出 CSV | P1 | 未實作 | — |
| FR-010 | 門市事件回報 | P0 | 未實作（RF、SRS 有） | RF、SRS |
| FR-011 | 照片壓縮／HEIC | P1 | 未實作（RF、SRS 有） | RF、SRS |
| FR-012 | Email 通知 | P1 | 未實作（RF、SRS 有，未跳脫） | RF、SRS |
| FR-013 | 追蹤編號與狀態 | P2 | 部分（僅 RF） | RF |
| FR-014 | 角色權限 | P0 | 未實作 | — |
| FR-015 | 多租戶 | P1 | 未實作 | — |
| FR-016 | 門市／人員主檔 | P1 | 未實作（v2 `master` 分支有讀 Sheet） | v2 `master` |
| FR-017 | 計費 | P2 | 未實作（SRS 靜態方案頁） | — |
| FR-018 | 到店打卡 | P2 | 未實作（SR2 只有 PRD） | SR2 |
| FR-019 | LINE 通知 | P2 | 未實作 | — |
| FR-020 | 週／月報 | P2 | 未實作 | — |
| FR-021 | 稽核紀錄 | P1 | 未實作 | — |
| FR-022 | 離線暫存 | P2 | 未實作 | — |

小計：已實作 1、部分 5、未實作 16。縮寫：v2＝本 repo `main`；SRS＝staff-reporting-system；RF＝report-form；SR2＝site-report-v2。

## Deterministic checks

本次文件重建**未在本機執行**任何檢查（本機 git／python3 因 Xcode 授權未同意無法使用，且未安裝 node）。以下引用 GitHub Actions：

| Repo／run | 日期 | 結果 |
|---|---|---|
| v2 `main` run 34027655561 | 2026-09-06 | Lint ✅、Unit Tests ✅（1 檔 21 tests）、Build ✅、Deploy ❌（缺 `VERCEL_TOKEN`） |
| staff-reporting-system run 34027518869 | 2026-09-06 | Lint ❌、Unit Tests ❌、Build Check ❌、Deploy 跳過 |
| report-form run 34027816755 | 2026-09-06 | 成功（lint／test 設 `continue-on-error`，不代表通過） |
| site-report-v2 run 34066665043 | 2026-09-06 | Link Check ✅、Deploy to Pages ❌ |

## 已知風險與問題

- **公開 repo 中的疑似真實資料**（只列路徑，詳見 SPEC §9.3）：`staff-reporting-system/archive/appsscript-*.js`（試算表 ID）、`staff-reporting-system/api/submit.js:73`（6 個收件人 Email）、本 repo `master` 分支 `index.html:504-505`（真實 Apps Script Web App 網址）與 `api/submit.js:73`、`staff-reporting-system` 的 `main` 分支 agent 工作區檔與 `.vercel/project.json`。
- 舊 Apps Script Web App 以擁有者身分執行、任何人可存取，可讀取、寫入、刪除試算表資料（依程式判斷，未實際呼叫）。
- 舊版 Email 範本未跳脫使用者輸入（SRS、RF）。
- IP：題目與欄位指向 Logitech 本業；`logi-merch-report` 為公司內部開發。
- README 與程式不一致 14 項，見 SPEC §13。

## 待決事項（Sean）

1. 定位：內部工具、對外產品或封存（決定是否解除暫緩）。
2. 與 `sean0407/logi-merch-report` 合併或擇一。
3. 商業化的 IP 歸屬確認與 clean-room 方式。
4. §9.3 公開資料處理（停用 Apps Script 部署、轉私有、清理歷史）。
5. 三個候選 repo 與本 repo `master` 分支去留。
6. M2 持久化與登入方案。
7. 到店打卡是否納入範圍。

## 本次變更

- 重寫 `PRD/SPEC.md`（v4.0）、`AGENTS.md`（保留原 Next.js 提醒區塊）；新增 `GOAL.md`、`SOP.md`、`STATUS.md`。
- 未修改任何程式碼、設定、測試、`PRD/CHANGELOG.md`、`CLAUDE.md`。

## 下一步

1. Sean 決定上述待決事項 1–3。
2. 若解除暫緩：依 `GOAL.md` 先做 AC-001（品質閘門），再進行 AC-002～AC-008。
3. 若封存或改以 `logi-merch-report` 為主：關閉本 PR 的後續開發，另行決定 repo 處置。
