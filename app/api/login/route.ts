import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const store = typeof body?.store === 'string' ? body.store.trim() : '';

    if (!name) {
      return NextResponse.json({ success: false, message: '請填寫姓名' }, { status: 400 });
    }

    if (!store) {
      return NextResponse.json({ success: false, message: '請填寫店名' }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: { name, store } });
  } catch {
    return NextResponse.json({ success: false, message: '伺服器錯誤' }, { status: 500 });
  }
}
