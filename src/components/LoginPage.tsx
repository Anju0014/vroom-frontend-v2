

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { loginSchema } from '@/lib/validation';
import { AuthService } from '@/services/customer/authService';
import { OwnerAuthService } from '@/services/carOwner/authService';
import { useAuthStore } from '@/store/customer/authStore';
import { useAuthStoreOwner } from '@/store/carOwner/authStore';
import { signIn, useSession } from 'next-auth/react';
import { LoginData } from '@/types/authTypes';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import InputField from './InputField';
import AuthSideBanner from './AuthSideBanner';
import LoadingButton from './common/LoadingButton';

interface LoginComponentProps {
  defaultRole?: 'customer' | 'carOwner';
}

const LoginComponent = ({ defaultRole = 'customer' }: LoginComponentProps) => {
  const router = useRouter();
  const hasHydrated = useHasHydrated();
  const { data: session, status } = useSession();
  const { user: customerUser, accessToken } = useAuthStore();
  const { user: ownerUser, accessTokenOwner } = useAuthStoreOwner();
  
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    role: defaultRole,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const blocked = urlParams.get('blocked');
  const role = urlParams.get('role'); 

  if (blocked === '1' ) {
    if (role === 'customer') {
      useAuthStore.getState().logout();
      toast.error('Your customer account has been blocked.');
      
    } else if (role === 'carOwner') {
      useAuthStoreOwner.getState().logout();
      toast.error('Your car owner account has been blocked.');
    
    } else {
      toast.error('Your account has been blocked.');
    
    }
  }
}, []);


  useEffect(() => {
  if (!hasHydrated) return;

  // const storedUserRole = sessionStorage.getItem('userRole');
  // const storedToken = sessionStorage.getItem('accessToken');
  const isCustomer = customerUser && accessToken;
  const isOwner = ownerUser && accessTokenOwner;


  // Use either stored values or Zustand values to detect auth state
  // const isCustomer = (storedUserRole === 'customer' && storedToken) || (customerUser && customerAccessToken);
  // const isOwner = (storedUserRole === 'carOwner' && storedToken) || (ownerUser && accessTokenOwner);

  if (isCustomer) {
    console.log('Customer authenticated, redirecting to /customer/home');
    router.replace('/customer/home');
  } else if (isOwner) {
    console.log('Car owner authenticated, redirecting to /carOwner/home');
    router.replace('/carOwner/home');
  }
}, [hasHydrated,customerUser,accessToken,ownerUser,accessTokenOwner,router]);


  // Handle Google Sign In
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      handleGoogleSignIn();
    }
  }, [status, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role: 'customer' | 'carOwner') => {
    setFormData({ ...formData, role });
  };

  const storeSessionData = (role: string,email:string) => {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('userEmail', email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = loginSchema.safeParse({
      email: formData.email,
      password: formData.password,
    });
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message).join(', ');
      setError(errorMessages);
      toast.error(errorMessages);
      return;
    }

    setLoading(true);
    try {
      let response;
      let accessToken, user;

      if (formData.role === 'customer') {
        response = await AuthService.loginCustomer({
          email: formData.email,
          password: formData.password,
        });
        accessToken = response.data.accessToken;
        user = response.data.user;
        console.log("from login page",accessToken, user)
        useAuthStore.getState().setAuth(user, accessToken);
      } else {
        response = await OwnerAuthService.loginCarOwner({
          email: formData.email,
          password: formData.password,
        });
        accessToken = response.data.accessToken;
        user = response.data.user;
        useAuthStoreOwner.getState().setAuthOwner(user, accessToken);
      }
      

      // if (user && accessToken) {
      //   if (formData.role === 'customer') {
      //     useAuthStore.getState().setAuth(user, accessToken);
      //   } else {
      //     useAuthStoreOwner.getState().setAuthOwner(user, accessToken);
      //   }

        storeSessionData(formData.role,formData.email);
        toast.success(`Login successful as ${formData.role}!`);
        const redirectPath = formData.role === 'customer' ? '/customer/home' : '/carOwner/home';
        console.log(`Redirecting to ${redirectPath}`);
        window.history.replaceState(null, '', redirectPath);
        router.replace(redirectPath);
      // } else {
      //   throw new Error('User or access token is missing.');
      // }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    sessionStorage.setItem('googleLoginRole', formData.role);
    try {
      await signIn('google', { redirect: false });
    } catch (error) {
      console.error('Google Login Failed:', error);
      toast.error('Google Login Failed');
      sessionStorage.removeItem('googleLoginRole');
    }
  };

  const handleGoogleSignIn = async () => {
    if (status !== 'authenticated' || !session?.user) return;

    const storedRole = sessionStorage.getItem('googleLoginRole');
    if (!storedRole) {
      console.log('No googleLoginRole found, redirecting to /login');
      toast.error('Please select a role before logging in with Google.');
      router.replace('/login');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let response;
      let accessToken, user;

      console.log(`Google Sign-In: storedRole=${storedRole}`);
      if (storedRole === 'customer') {
        response = await AuthService.googlesigninCustomer({
          fullName: session.user.name ?? '',
          email: session.user.email ?? '',
          profileImage: session.user.image ?? '',
          provider: 'google',
          role: 'customer',
        });
        accessToken = response.data.customerAccessToken;
        user = response.data.user;
        useAuthStore.getState().setAuth(user, accessToken);
      } else if (storedRole === 'carOwner') {
        response = await OwnerAuthService.googlesigninOwner({
          fullName: session.user.name ?? '',
          email: session.user.email ?? '',
          profileImage: session.user.image ?? '',
          provider: 'google',
          role: 'carOwner',
        });
        accessToken = response.data.ownerAccessToken;
        user = response.data.user;
        useAuthStoreOwner.getState().setAuthOwner(user, accessToken);
      } else {
        throw new Error('Invalid role selected.');
      }

      if (user && accessToken) {
        if (storedRole === 'customer') {
          useAuthStore.getState().setAuth(user, accessToken);
        } else {
          useAuthStoreOwner.getState().setAuthOwner(user, accessToken);
        }

        storeSessionData(storedRole,user.email);
        sessionStorage.setItem('provider', 'google');
        sessionStorage.setItem('userEmail', session.user.email ?? '');
        toast.success('Google Login Successful!');
        const redirectPath = storedRole === 'customer' ? '/customer/home' : '/carOwner/home';
        console.log(`Redirecting to ${redirectPath}`);
        window.history.replaceState(null, '', redirectPath);
        router.replace(redirectPath);
        sessionStorage.removeItem('googleLoginRole');
      } else {
        throw new Error('User or access token is missing.');
      }
    } catch (error: any) {
      console.error('Google Login Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Google login failed.');
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

 
  if (!hasHydrated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
       <AuthSideBanner
          subText= {`Welcome back! Log in to access your account and manage your car ${
              formData.role === "customer" ? "rentals" : "listings"
            }.`}
          bottomText="The journey of a thousand miles begins with a single login."
        />

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Please sign in to your account</p>
          </div>
          <div className="mt-4 mb-2">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <label className="text-sm font-medium text-red-600 mx-2">Login as: </label>
                <input
                  id="customer-role"
                  name="role-selection"
                  type="radio"
                  checked={formData.role === 'customer'}
                  onChange={() => handleRoleChange('customer')}
                  className="h-4 w-4 accent-red-500 focus:ring-red-500 border-gray-300"
                />
                <label htmlFor="customer-role" className="ml-2 block text-sm text-gray-700">
                  Customer
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="carOwner-role"
                  name="role-selection"
                  type="radio"
                  checked={formData.role === 'carOwner'}
                  onChange={() => handleRoleChange('carOwner')}
                  className="h-4 w-4 accent-red-600 focus:ring-red-500 border-gray-300"
                />
                <label htmlFor="carOwner-role" className="ml-2 block text-sm text-gray-700">
                  Car Owner
                </label>
              </div>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      
      <InputField
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="your.email@example.com"
      />

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="block text-sm font-bold text-gray-700">
            Password
          </label>
          <Link
            href="/forgotpassword/emailStore"
            onClick={() => sessionStorage.setItem("userRole", formData.role)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Forgot password?
          </Link>
        </div>
        <InputField
          label=""
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
        />
      </div>

      {/* Submit Button */}
      <LoadingButton
        type="submit"
        className="w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 transition-all flex justify-center items-center"
        disabled={loading}
      >
        {loading ? `Signing In as ${formData.role}...` : `Sign In as ${formData.role}`}
      </LoadingButton>
    </form>
          <LoadingButton
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 transition-all flex justify-center items-center"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Login through Google'}
          </LoadingButton>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href={formData.role === 'customer' ? '/signup' : '/carOwner/signup'}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Sign Up as {formData.role === 'customer' ? 'Customer' : 'Car Owner'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
