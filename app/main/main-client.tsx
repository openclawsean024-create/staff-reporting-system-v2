'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';

interface ProductInfo {
  name: string;
  spec: string;
  category: string;
  price: number;
}

interface Report {
  id: string;
  name: string;
  store: string;
  pnCode: string;
  productInfo: ProductInfo | null;
  submittedAt: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function formatPrice(p: number): string {
  return `$${p.toLocaleString('zh-TW')}`;
}

function QRScanner({ onScan, onClose }: { onScan: (v: string) => void; onClose: () => void }) {
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const start = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        html5QrcodeRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 100 } },
          (decodedText: string) => {
            onScan(decodedText);
            scanner.stop().then(onClose).catch(() => {});
          },
          () => {}
        );
      } catch (e) {
        console.error('Camera start error:', e);
        alert('無法開啟相機，請確認已授權相機權限');
        onClose();
      }
    };
    start();
    return () => {
      html5QrcodeRef.current?.stop().catch(() => {});
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div id="qr-reader" className="w-full max-w-sm rounded-2xl overflow-hidden" />
      <button
        onClick={async () => {
          await html5QrcodeRef.current?.stop().catch(() => {});
          onClose();
        }}
        className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors font-medium"
      >
        取消
      </button>
    </div>
  );
}

function ProductCard({ product }: { product: ProductInfo }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
      <p className="text-xs font-medium text-green-600 uppercase tracking-wide">產品資訊</p>
      <div className="space-y-1">
        <p className="font-semibold text-gray-800 text-lg">{product.name}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
          <span>規格：{product.spec}</span>
          <span>類別：{product.category}</span>
          <span className="col-span-2 text-gray-800 font-medium">價格：{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  );
}

function RecordItem({ record }: { record: Report }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-gray-800 text-sm">{record.productInfo?.name || record.pnCode}</p>
          <p className="text-xs text-gray-400 mt-0.5">PN：{record.pnCode}</p>
          {record.productInfo && (
            <p className="text-xs text-gray-500 mt-0.5">
              {record.productInfo.spec} · {formatPrice(record.productInfo.price)}
            </p>
          )}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{formatDate(record.submittedAt)}</span>
      </div>
    </div>
  );
}

export default function MainClientPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name = searchParams.get('name') ?? '';
  const store = searchParams.get('store') ?? '';

  const [pnCode, setPnCode] = useState('');
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [records, setRecords] = useState<Report[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    if (!name || !store) router.replace('/');
  }, [name, store, router]);

  const loadRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const res = await fetch(`/api/records?name=${encodeURIComponent(name)}&date=${getToday()}`);
      const data = await res.json();
      if (data.success) setRecords(data.reports || []);
    } finally {
      setLoadingRecords(false);
    }
  }, [name]);

  useEffect(() => {
    if (name) loadRecords();
  }, [name, loadRecords]);

  const handleLogout = () => {
    sessionStorage.removeItem('staff_name');
    sessionStorage.removeItem('staff_store');
    router.replace('/');
  };

  const handleQuery = async () => {
    if (!pnCode.trim()) {
      setError('請輸入 PN 碼');
      return;
    }
    setQuerying(true);
    setError('');
    setProduct(null);
    try {
      const res = await fetch(`/api/products?pn=${encodeURIComponent(pnCode.trim())}`);
      const data = await res.json();
      if (data.success) setProduct({ name: data.name, spec: data.spec, category: data.category, price: data.price });
      else setError(data.message ?? '查無此產品');
    } catch {
      setError('查詢失敗，請稍後再試');
    } finally {
      setQuerying(false);
    }
  };

  const handleSubmit = async () => {
    if (!product) {
      setError('請先查詢產品');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, store, pnCode, productInfo: product }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('回報成功！');
        setPnCode('');
        setProduct(null);
        loadRecords();
      } else {
        setError(data.message ?? '提交失敗');
      }
    } catch {
      setError('提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScan = (value: string) => {
    setPnCode(value);
    setShowScanner(false);
    setError('');
    setProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium text-sm sm:text-base">{name} / {store}</span>
        </div>
        <button onClick={handleLogout} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">登出</button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl text-center font-medium">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl text-center font-medium">{success}</div>}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <label className="block text-sm font-medium text-gray-600">PN 碼</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={pnCode}
              onChange={(e) => { setPnCode(e.target.value); setError(''); setProduct(null); }}
              placeholder="輸入或掃描 PN 碼"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-800 placeholder-gray-400 font-mono text-base"
            />
            <button onClick={() => setShowScanner(true)} className="flex items-center gap-1.5 px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors" title="掃描條碼">掃描</button>
          </div>
          <button onClick={handleQuery} disabled={querying || !pnCode.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
            {querying ? '查詢中…' : '查詢產品'}
          </button>
        </div>

        {product && <ProductCard product={product} />}

        {product && (
          <button onClick={handleSubmit} disabled={submitting} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 px-4 rounded-2xl transition-colors text-lg shadow-md">
            {submitting ? '提交中…' : '✓ 確認回報'}
          </button>
        )}

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">今日回報記錄</h2>
          {loadingRecords ? (
            <div className="text-center py-8 text-gray-400 text-sm">載入中…</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">尚無回報記錄</div>
          ) : (
            <div className="space-y-2">
              {records.map((r) => <RecordItem key={r.id} record={r} />)}
            </div>
          )}
        </div>
      </div>

      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
    </div>
  );
}
