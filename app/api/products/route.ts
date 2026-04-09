/**
 * GET /api/products?pn=X
 * 依 PN 碼查詢產品資訊（名稱、規格、類別、價格）
 * 
 * 示範用產品資料（正式環境請替換為真實資料庫查詢）
 */
import { NextRequest, NextResponse } from 'next/server';

// 示範產品資料庫
const DEMO_PRODUCTS: Record<string, { name: string; spec: string; category: string; price: number }> = {
  'PN001': { name: 'iPhone 15 Pro', spec: '256GB', category: '手機', price: 36900 },
  'PN002': { name: 'MacBook Air M3', spec: '13吋', category: '筆電', price: 39900 },
  'PN003': { name: 'AirPods Pro 2', spec: 'USB-C', category: '耳機', price: 7990 },
  'PN004': { name: 'iPad Pro 12.9', spec: '256GB', category: '平板', price: 44900 },
  'PN005': { name: 'Apple Watch S9', spec: '45mm', category: '手錶', price: 13900 },
  'PN006': { name: 'Samsung S24 Ultra', spec: '512GB', category: '手機', price: 44900 },
  'PN007': { name: 'Sony WH-1000XM5', spec: '旗艦款', category: '耳機', price: 10990 },
  'PN008': { name: 'Dell XPS 15', spec: 'i7/32GB', category: '筆電', price: 54900 },
  'PN009': { name: 'Nintendo Switch', spec: 'OLED', category: '遊戲機', price: 9880 },
  'PN010': { name: 'PS5', spec: '光碟版', category: '遊戲機', price: 12580 },
  'PN011': { name: 'iPhone 15', spec: '128GB', category: '手機', price: 29900 },
  'PN012': { name: 'MacBook Pro 14"', spec: 'M3 Pro', category: '筆電', price: 59900 },
  'PN013': { name: 'AirPods 4', spec: '主動降噪', category: '耳機', price: 5990 },
  'PN014': { name: 'iPad Air 11"', spec: '256GB', category: '平板', price: 24900 },
  'PN015': { name: 'Galaxy Watch 6', spec: '44mm', category: '手錶', price: 11900 },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pn = searchParams.get('pn')?.trim().toUpperCase();

  if (!pn) {
    return NextResponse.json({ success: false, message: '請提供 PN 碼' }, { status: 400 });
  }

  const product = DEMO_PRODUCTS[pn];
  if (!product) {
    return NextResponse.json({ success: false, message: '查無此產品' }, { status: 404 });
  }

  return NextResponse.json({ success: true, pn, ...product });
}
