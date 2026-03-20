
'use client';
import { useLoadingStore } from '@/store/loading/loadingStore';

export default function GlobalSpinner() {
  const { isLoading } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="loader border-4 border-t-blue-500 border-r-transparent rounded-full w-16 h-16 animate-spin"></div>
    </div>
  );
}

