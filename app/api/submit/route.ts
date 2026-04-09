/**
 * POST /api/submit
 * 儲存一筆駐點回報記錄
 * 
 * 接收：{ name, store, pnCode, productInfo }
 * 回傳：{ success: true, record }
 */
import { createClient } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const kv = process.env.VERCEL_KV_REST_API_URL && process.env.VERCEL_KV_REST_API_TOKEN
  ? createClient({
      url: process.env.VERCEL_KV_REST_API_URL,
      token: process.env.VERCEL_KV_REST_API_TOKEN,
    })
  : null;

const REPORTS_PREFIX = 'report:';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, store, pnCode, productInfo } = body;

    // 基本驗證
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: '請填寫姓名' },
        { status: 400 }
      );
    }
    if (!store?.trim()) {
      return NextResponse.json(
        { success: false, message: '請填寫店名' },
        { status: 400 }
      );
    }
    if (!pnCode?.trim()) {
      return NextResponse.json(
        { success: false, message: '請先查詢產品' },
        { status: 400 }
      );
    }

    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      name: name.trim(),
      store: store.trim(),
      pnCode: pnCode.trim(),
      productInfo: productInfo || null,
      submittedAt: new Date().toISOString(),
    };

    // 若有 Vercel KV，寫入持久化儲存
    if (kv) {
      await kv.set(`${REPORTS_PREFIX}${record.id}`, JSON.stringify(record));
    }

    return NextResponse.json({ success: true, record });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '伺服器錯誤';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
