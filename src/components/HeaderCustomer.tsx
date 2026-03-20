
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/customer/authStore'
import { AuthService } from '@/services/customer/authService';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from "next-auth/react";
import NotificationBell from './common/NotificationBell';
import LoadingButton from './common/LoadingButton';

const Header = () => {
    const router = useRouter();
    const { user, logout, accessToken } = useAuthStore();
    const [hydrated, setHydrated] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    useEffect(() => {
      setHydrated(true);
      if (typeof window !== 'undefined') {
        setIsGoogleUser(sessionStorage.getItem("provider") === "google");
      }
    }, []);

    const handlelogout = async () => {
      try {
        await AuthService.logoutCustomer();
        if (isGoogleUser) {
          await signOut({ callbackUrl: "/" });
        }
        logout();
        router.replace("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        logout();
        router.replace('/login');
      }
    };

    // Render a simple loading state or nothing while waiting for hydration
    if (!hydrated) {
      return <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">Vroom</span>
              </div>
            </div>
          </div>
        </div>
      </header>;
    }

    return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <div className="relative w-8 h-8 mr-2">
                  <Image 
                    src="/images/logo.png" 
                    alt="Vroom Logo" 
                    width={32} 
                    height={32} 
                  />
                </div>
                <span className="text-xl font-bold">Vroom</span>
              </Link>
          
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <Link href="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Home
                </Link>
                <Link href="/cars" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Cars
                </Link>
                <Link href="/booking" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Booking
                </Link>
                <Link href="/testimonials" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Testimonials
                </Link>
              </nav>
            </div>
            
          <div className="hidden md:flex items-center space-x-3">
            <div className="h-6 w-px bg-gray-300" />
            <Link href="/carOwner/signup" className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Become A Host
            </Link>
            
           
              <div className="flex items-center space-x-4">
                {accessToken ? (
                  <>
                   {user?.id && <NotificationBell userId={user.id} />}
                    <Link href="/customer/dashboard/profile" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                      My Profile
                    </Link> 
                    <span className="text-sm text-gray-700">Hi, {user?.fullName}</span>
                    <LoadingButton
                      onClick={handlelogout} 
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Sign Out
                    </LoadingButton>
                  </>
                ) : (
                  <Link href="/login" className="bg-gray-900 text-white px-4 py-2 rounded-md">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
            
          <div className="flex items-center md:hidden">
            <LoadingButton
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </LoadingButton>
          </div>
        </div>
      </div>
      
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link href="/" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                Home
              </Link>
              <Link href="/cars" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                Cars
              </Link>
              <Link href="/booking" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                Booking
              </Link>
              <Link href="/testimonials" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                Testimonials
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">My Profile</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {accessToken ? (
                  <>
                    <span className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                      Hi, {user?.fullName}
                    </span>
                    <LoadingButton
                      onClick={handlelogout} 
                      className="block w-full text-left px-4 py-2 text-base font-medium text-white bg-red-500 hover:bg-red-600"
                    >
                      Sign Out
                    </LoadingButton>
                  </>
                ) : (
                  <Link href="/login" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    );
};

export default Header;