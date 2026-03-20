'use client';
import { useState,useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPasswordSchema} from '@/lib/validation';
import { toast } from 'react-hot-toast';
import { AuthService } from '@/services/customer/authService';
import { OwnerAuthService } from '@/services/carOwner/authService';
import InputField from '@/components/InputField';
import AuthSideBanner from '@/components/AuthSideBanner';
import LoadingButton from '@/components/common/LoadingButton';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    setToken(searchParams.get('token'));
    setRole(searchParams.get('role'));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = resetPasswordSchema.safeParse({newPassword,confirmPassword});
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message).join(", ");
      toast.error(errorMessages);
      return;
    }
     try{
      if (role === "customer") {
                await AuthService.resetPasswordCustomer({ token,newPassword });
              } else {
                await OwnerAuthService.resetPasswordCarOwner({ token,newPassword});
              }
   
    toast.success("Password reset successful. Please log in.");
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    }
  };
  return (
     <div className="flex min-h-screen">
          <AuthSideBanner
  subText="Reset Your Password to  Log in to  your account."
  bottomText="Secure your account — reset your password quickly and safely."
/>

          <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="max-w-md w-full space-y-8">
           <div className=" items-center  ">
         <div className="bg-red-50 p-6 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-3 text-center text-gray-800">
          Password Reset
          </h2>
         
          
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <InputField 
          label="Password" 
          name="password" 
          type="password" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter your New password"
          suppressHydrationWarning
        />
        <InputField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          suppressHydrationWarning
        />

      <LoadingButton type="submit" className="w-full py-3 text-white font-semibold rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 transition-all flex justify-center items-center"
            >Reset Password</LoadingButton>
    </form>
    </div>
     </div>
    </div>
    </div>
    </div>

  );
}
