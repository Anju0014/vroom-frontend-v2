
'use client';

import { OwnerAuthService } from '@/services/carOwner/authService';
import { useAuthStoreOwner } from '@/store/carOwner/authStore';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationBell from '../common/NotificationBell';
import LoadingButton from '../common/LoadingButton';

const Header = () => {
  const router = useRouter();
  const { user, logout, accessTokenOwner } = useAuthStoreOwner();

  const handleLogout = async () => {
    try {
      await OwnerAuthService.logoutOwner();
      logout(); // Clears state and cookies
      router.replace('/login');
    } catch (error) {
      console.log('Logout failed:', error);
      logout();
      router.replace('/login');
    }
  };

  return (
    <header className="border-b py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-blue-900 font-bold text-xl flex items-center">
            <Image src="/images/logo.png" alt="Vroom Logo" width={32} height={32} />
            Vroom
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-gray-700 hover:text-gray-900">
            Home
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900">
            How It Works
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900">
            Pricing
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900">
            Contact Us
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          {accessTokenOwner ? (
            
            <>
               {user?.id && <NotificationBell userId={user.id} />}
              <Link href="/carOwner/dashboard/profile" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                My Dashboard
              </Link>
              <span className="text-sm text-gray-700">Hi, {user?.fullName}</span>
              <LoadingButton onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
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
    </header>
  );
};

export default Header;