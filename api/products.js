// Demo product data (same as submit.js for consistency)
const DEMO_PRODUCTS = [
  { pn: 'PN001', name: 'iPhone 15 Pro', spec: '256GB', category: '手機', price: 36900 },
  { pn: 'PN002', name: 'MacBook Air M3', spec: '13吋', category: '筆電', price: 39900 },
  { pn: 'PN003', name: 'AirPods Pro 2', spec: 'USB-C', category: '耳機', price: 7990 },
  { pn: 'PN004', name: 'iPad Pro 12.9', spec: '256GB', category: '平板', price: 44900 },
  { pn: 'PN005', name: 'Apple Watch S9', spec: '45mm', category: '手錶', price: 13900 },
  { pn: 'PN006', name: 'Samsung S24 Ultra', spec: '512GB', category: '手機', price: 44900 },
  { pn: 'PN007', name: 'Sony WH-1000XM5', spec: '旗艦款', category: '耳機', price: 10990 },
  { pn: 'PN008', name: 'Dell XPS 15', spec: 'i7/32GB', category: '筆電', price: 54900 },
  { pn: 'PN009', name: 'Nintendo Switch', spec: 'OLED', category: '遊戲機', price: 9880 },
  { pn: 'PN010', name: 'PS5', spec: '光碟版', category: '遊戲機', price: 12580 },
  { pn: 'PN011', name: 'iPhone 15', spec: '128GB', category: '手機', price: 29900 },
  { pn: 'PN012', name: 'MacBook Pro 14"', spec: 'M3 Pro', category: '筆電', price: 59900 },
  { pn: 'PN013', name: 'AirPods 4', spec: '主動降噪', category: '耳機', price: 5990 },
  { pn: 'PN014', name: 'iPad Air 11"', spec: '256GB', category: '平板', price: 24900 },
  { pn: 'PN015', name: 'Galaxy Watch 6', spec: '44mm', category: '手錶', price: 11900 },
];

export async function GET() {
  return new Response(JSON.stringify(DEMO_PRODUCTS), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
