# staff-reporting-system-v2 · CHANGELOG

> 維護者：Sean Li（食刻設計 / Savor Studio）
> 本 CHANGELOG 為 v3.0.2 等級規格演進紀錄

---

## v3.0.2 — 2026-09-06（目前版本）

> v3.0.2 完成於 2026-09-06 by Sean 10-repo-fleet

### Added
- `PRD/SPEC.md` 全面重寫：對齊 SPEC v3.0 契約（9 章節 + 12 條 FR + NFR table + 部署契約 + mermaid flow）
- `PRD/CHANGELOG.md`（本檔）— 從 v0.1 到 v3.0.2 完整演進紀錄
- `.github/workflows/ci.yml` — 4-job CI（lint / test / build / deploy-vercel）

### Changed
- 規格書從「v2.2.1 AI 強化版」對齊到「v3.0.2 實作對齊版」 — 反映實際 src 結構（4 個 API route + 2 個頁面 + html5-qrcode + Vercel KV）
- 移除 v2.2.1 中未實作的「AI 自動 OCR + 異常照片偵測 + AI 月報」功能（標示為 FR-012 P3 ⏳ planned）
- 明確列出「無 KV 時降級為純 API 模式」邏輯（§5.3 降級策略）

### Notes
- v2.2.1 原始 SPEC（763 行）保留於 git history（commit b0ca8f5 之前）
- v3.0.2 規格書聚焦「實作對齊」 — 標示 FR-001~FR-009 為 shipped、FR-010~FR-012 為 planned
- Next.js 16.2 + React 19.2 + Tailwind v4 為目前 stack（README 與 AGENTS.md 已標記「This is NOT the Next.js you know」）

---

## v2.2.1 — 2026-07-19（AI 強化重寫版）

### Added
- §0 本版重寫摘要：sweet spot 3/10（kill）後重寫為「v1 + AI 智能」
- 完整 12 章節規格書（763 行）
- Persona 涵蓋中型保全 / 清潔 / 包租代管 / 醫院長照（4 類）
- v1 vs v2 差異化：「LINE 打卡 → AI 出敘述型月報 → 主管 1 分鐘交給客戶」

### Notes
- v2.2.1 規格描述「AI 自動 OCR + 異常照片偵測 + AI 月報」等 v3 等級功能
- 實際 src 實作為「QR 掃碼 + PN 查表 + Vercel KV」v1 等級功能
- 為 repo-fleet Batch 5C v3.0.2 對齊基礎

---

## v1.0 — 2026-05-XX（LINE 打卡基本版）

### Added
- 駐點人員 LINE 打卡基本功能
- 群組回報彙整
- Excel 月報輸出

### Notes
- 對應 sweet spot = 4/10（v1 留住 5 人以下微型保全）
- v1 為 v2 的「基本版」 — 沒有 AI、沒有產品 PN 查表

---

## v0.1 — 2026-04-XX（Next.js 16 模板起點）

### Added
- Next.js 16.2 + React 19.2 + TypeScript strict + Tailwind v4 + ESLint v9
- 4 個 API route（login / products / records / submit）
- 2 個頁面（login + main）
- html5-qrcode 整合（手機相機掃碼）
- @vercel/kv 整合（可選持久化）
- AGENTS.md 標記「This is NOT the Next.js you know」（提醒模型先讀 docs）

### Notes
- 從 create-next-app 模板建立
- Next.js 16.2 為相對新版本，breaking changes 需注意
- DEMO_PRODUCTS 寫死 15 個示範 PN（PN001 ~ PN015）
