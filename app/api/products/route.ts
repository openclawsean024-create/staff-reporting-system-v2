/**
 * GET /api/products?pn=X
 * 依 PN 碼查詢產品資訊（名稱、規格、類別、價格）
 *
 * 示範用產品資料（正式環境請替換為真實資料庫查詢）
 */
import { NextRequest, NextResponse } from 'next/server';
import { lookupProduct } from '../../lib/format';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pn = searchParams.get('pn');

  if (!pn?.trim()) {
    return NextResponse.json({ success: false, message: '請提供 PN 碼' }, { status: 400 });
  }

  const product = lookupProduct(pn);
  if (!product) {
    return NextResponse.json({ success: false, message: '查無此產品' }, { status: 404 });
  }

  return NextResponse.json({ success: true, pn: pn.trim().toUpperCase(), ...product });
}
