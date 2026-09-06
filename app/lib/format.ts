// 純函式工具模組（從 main-client.tsx 抽出，方便測試）
// 注意：保持與 main-client.tsx 中的同名函式語意一致

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatPrice(p: number): string {
  return `$${p.toLocaleString('zh-TW')}`;
}

// DEMO 產品資料（從 app/api/products/route.ts 同步複製，方便測試）
// 正式環境由真實 DB 取代
export const DEMO_PRODUCTS: Record<string, { name: string; spec: string; category: string; price: number }> = {
  PN001: { name: 'iPhone 15 Pro', spec: '256GB', category: '手機', price: 36900 },
  PN002: { name: 'MacBook Air M3', spec: '13吋', category: '筆電', price: 39900 },
  PN003: { name: 'AirPods Pro 2', spec: 'USB-C', category: '耳機', price: 7990 },
  PN004: { name: 'iPad Pro 12.9', spec: '256GB', category: '平板', price: 44900 },
  PN005: { name: 'Apple Watch S9', spec: '45mm', category: '手錶', price: 13900 },
  PN006: { name: 'Samsung S24 Ultra', spec: '512GB', category: '手機', price: 44900 },
  PN007: { name: 'Sony WH-1000XM5', spec: '旗艦款', category: '耳機', price: 10990 },
  PN008: { name: 'Dell XPS 15', spec: 'i7/32GB', category: '筆電', price: 54900 },
  PN009: { name: 'Nintendo Switch', spec: 'OLED', category: '遊戲機', price: 9880 },
  PN010: { name: 'PS5', spec: '光碟版', category: '遊戲機', price: 12580 },
  PN011: { name: 'iPhone 15', spec: '128GB', category: '手機', price: 29900 },
  PN012: { name: 'MacBook Pro 14"', spec: 'M3 Pro', category: '筆電', price: 59900 },
  PN013: { name: 'AirPods 4', spec: '主動降噪', category: '耳機', price: 5990 },
  PN014: { name: 'iPad Air 11"', spec: '256GB', category: '平板', price: 24900 },
  PN015: { name: 'Galaxy Watch 6', spec: '44mm', category: '手錶', price: 11900 },
};

export function lookupProduct(pnRaw: string | null | undefined): { name: string; spec: string; category: string; price: number } | null {
  if (!pnRaw) return null;
  const pn = pnRaw.trim().toUpperCase();
  return DEMO_PRODUCTS[pn] || null;
}
