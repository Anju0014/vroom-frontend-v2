'use client';

import LoadingButton from '@/components/common/LoadingButton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ConfirmationPage = () => {
  const router = useRouter();

  useEffect(() => {
  
    const timer = setTimeout(() => {
      router.push('/customer/dashboard/bookings/');
}, 5000);

    const handlePopState = () => {
      router.replace('/customer/home'); 
    };

    window.addEventListener('popstate', handlePopState);

    return () =>{
      clearTimeout(timer);
      window.removeEventListener('popstate',handlePopState)}
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">
          Your booking has been confirmed. You will be redirected to your bookings shortly.
        </p>
        <LoadingButton
          onClick={() => router.push('/customer/dashboard/bookings')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          View Bookings
        </LoadingButton>
      </div>
    </div>
  );
};

export default ConfirmationPage;