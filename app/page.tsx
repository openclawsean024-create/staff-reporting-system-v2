/**
 * 駐點回報系統 V2 — 登入頁
 * 
 * 功能：輸入姓名與店名後進入系統，頂部顯示「姓名 / 店名」
 * 手機優先 RWD設計
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [store, setStore] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // 嘗試恢復登入狀態
  useEffect(() => {
    const savedName = sessionStorage.getItem('staff_name');
    const savedStore = sessionStorage.getItem('staff_store');
    if (savedName && savedStore) {
      router.replace(`/main?name=${encodeURIComponent(savedName)}&store=${encodeURIComponent(savedStore)}`);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('請填寫姓名');
      return;
    }
    if (!store.trim()) {
      setError('請填寫店名');
      return;
    }
    // 儲存登入資訊
    sessionStorage.setItem('staff_name', name.trim());
    sessionStorage.setItem('staff_store', store.trim());
    router.push(`/main?name=${encodeURIComponent(name.trim())}&store=${encodeURIComponent(store.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / 標題區 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">駐點回報系統</h1>
          <p className="text-gray-500 mt-1">V2</p>
        </div>

        {/* 登入表單卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-6 text-center">登入</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 姓名欄位 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1.5">
                姓名
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="請輸入姓名"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800 placeholder-gray-400"
                autoComplete="name"
              />
            </div>

            {/* 店名欄位 */}
            <div>
              <label htmlFor="store" className="block text-sm font-medium text-gray-600 mb-1.5">
                店名
              </label>
              <input
                id="store"
                type="text"
                value={store}
                onChange={(e) => { setStore(e.target.value); setError(''); }}
                placeholder="請輸入店名"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800 placeholder-gray-400"
                autoComplete="organization"
              />
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            {/* 提交按鈕 */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-md"
            >
              進入系統
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          無需密碼，請填寫正確資訊
        </p>
      </div>
    </div>
  );
}
