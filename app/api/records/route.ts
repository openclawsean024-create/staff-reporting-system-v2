/**
 * GET /api/records?name=X&date=YYYY-MM-DD
 * 取得指定人員當日的所有回報記錄（依時間倒序）
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  if (!name) {
    return NextResponse.json(
      { success: false, message: '缺少 name 參數' },
      { status: 400 }
    );
  }

  try {
    let reports: object[] = [];

    if (kv) {
      // 掃描所有 report: 開頭的 key
      const allKeys = await kv.keys(`${REPORTS_PREFIX}*`);
      if (allKeys.length > 0) {
        const records = await Promise.all(
          allKeys.map(k => kv.get<string>(k).then(v => v ? JSON.parse(v) : null))
        );
        reports = records
          .filter(r => r && r.name === name && r.submittedAt.startsWith(date))
          .sort((a, b) => new Date((b as { submittedAt: string }).submittedAt).getTime()
                           - new Date((a as { submittedAt: string }).submittedAt).getTime());
      }
    }

    return NextResponse.json({ success: true, reports });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '伺服器錯誤';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
