// app/unauthorized/page.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const UnauthorizedPage: React.FC = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/"); 
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to access this page. Please check your role or contact support.
        </p>
        <div className="space-x-4">
          <button
            onClick={handleGoHome}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Go to Home
          </button>
          <Link href="/login" className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;