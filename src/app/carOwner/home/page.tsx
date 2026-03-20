'use client';

import Footer from '@/components/carOwner/Footer';
import Header from '@/components/carOwner/Header';
import Head from 'next/head';
import Image from 'next/image';
import { useAuthStoreOwner } from '@/store/carOwner/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Home = () => {
  const router = useRouter();
  const { user, accessTokenOwner } = useAuthStoreOwner();

  useEffect(() => {
    if (!user || !accessTokenOwner) {
      console.log('Unauthenticated, redirecting to /login');
      router.replace('/login');
    } else {
      console.log('Authenticated, replacing history with /carOwner/home');
      window.history.replaceState(null, '', '/carOwner/home');
    }
  }, [user, accessTokenOwner, router]);

  if (!user || !accessTokenOwner) {
    return null; 
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Vroom - Hassle-Free Car Rentals</title>
        <meta name="description" content="Secure, simple, and seamless key handovers for car rentals" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Hassle-Free Car Rentals
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Secure, simple, and seamless key handovers.<br />
              Start your journey with confidence.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition">
                Get Started
              </button>
              <button className="border border-gray-300 px-6 py-2 rounded-md hover:bg-gray-50 transition">
                Learn More
              </button>
            </div>
            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-600">Verified Users</span>
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-600">Secure Handovers</span>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="rounded-lg overflow-hidden relative">
              <div className="aspect-w-16 aspect-h-9 relative">
                <Image
                  src="/images/6517.jpg"
                  alt="Car key handover"
                  width={500}
                  height={300}
                  className="object-cover rounded-lg"
                  layout="responsive"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Quick Process</h3>
              <p className="text-gray-600 text-sm">Simple booking and key exchange in minutes</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Always here to help when you need us</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Secure Platform</h3>
              <p className="text-gray-600 text-sm">Verified users and secure transactions</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;