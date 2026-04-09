import { createClient } from '@vercel/kv';

const kv = process.env.VERCEL_KV_REST_API_URL && process.env.VERCEL_KV_REST_API_TOKEN
  ? createClient({
      url: process.env.VERCEL_KV_REST_API_URL,
      token: process.env.VERCEL_KV_REST_API_TOKEN,
    })
  : null;

const PRODUCTS_KEY = 'products:list';
const REPORTS_PREFIX = 'report:';

// Demo product data
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

async function initializeProducts() {
  if (!kv) return;
  try {
    const existing = await kv.get(PRODUCTS_KEY);
    if (!existing) {
      await kv.set(PRODUCTS_KEY, JSON.stringify(DEMO_PRODUCTS));
    }
  } catch (e) {
    console.error('KV init error:', e);
  }
}

initializeProducts();

// GET /api/records?name=X&date=YYYY-MM-DD
export async function GET(req) {
  const url = new URL(req.url);

  // Distinguish records vs products
  if (url.pathname === '/api/records') {
    const name = url.searchParams.get('name');
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!name) {
      return new Response(JSON.stringify({ success: false, message: '缺少 name 參數' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      let reports = [];

      if (kv) {
        const allKeys = await kv.keys(`${REPORTS_PREFIX}*`);
        const records = await Promise.all(allKeys.map(k => kv.get(k)));
        reports = records
          .filter(r => r && r.name === name && r.submittedAt.startsWith(date))
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      }

      return new Response(JSON.stringify({ success: true, reports }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Unknown route
  return new Response(JSON.stringify({ success: false, message: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST /api/submit
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, store, pnCode, productInfo } = body;

    if (!name || !store) {
      return new Response(JSON.stringify({ success: false, message: '請填寫姓名與店名' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!pnCode) {
      return new Response(JSON.stringify({ success: false, message: '請填寫 PN 碼' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const record = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      store,
      pnCode,
      productInfo: productInfo || null,
      submittedAt: new Date().toISOString(),
    };

    if (kv) {
      await kv.set(`${REPORTS_PREFIX}${record.id}`, JSON.stringify(record));
    }

    return new Response(JSON.stringify({ success: true, record }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
