import { Suspense } from 'react';
import MainClientPage from './main-client';

export default function MainPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">載入中…</div>}>
      <MainClientPage />
    </Suspense>
  );
}
