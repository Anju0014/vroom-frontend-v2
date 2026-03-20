
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AuthService } from "@/services/customer/authService";
import { OwnerAuthService } from "@/services/carOwner/authService";
import { emailSchema } from '@/lib/validation';
import Image from 'next/image';
import InputField from "./InputField";
import AuthSideBanner from "./AuthSideBanner";


const ForgotPassword = () => {

  const router = useRouter();
      const [email, setEmail] = useState('');
      const [role, setRole] = useState<"customer" | "carOwner" | null>(null);
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!role) {
          toast.error("Role not found. Please log in again.");
          router.push('/login');
          return;
        }
    
        const result = emailSchema.safeParse(email);
        if (!result.success) {
          toast.error("Invalid email format");
          return;
        }
    
        try {
          if (role === "customer") {
            await AuthService.forgotPasswordCustomer({ email });
          } else {
            await OwnerAuthService.forgotPasswordCarOwner({ email });
          }
          toast.success('Reset link sent! Check your inbox.');

        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to send reset link.";
          toast.error(errorMessage);
        } finally{
          router.push('/login')
        }
      };
    
    
      useEffect(() => {
        if (typeof window !== "undefined") {
          const storedRole = sessionStorage.getItem("userRole") as "customer" | "carOwner" | null;
          if (storedRole) {
            setRole(storedRole);
          } else {
            toast.error("Role not found. Please log in again.");
          }
        }
      }, []);
  return (
    
         <div className="flex min-h-screen"> 
                 <AuthSideBanner
  subText="From booking to driving, we make it smooth."
  bottomText="A fresh start is just one reset away."
/>

          <div className="w-full  md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
            <div className="max-w-md w-full space-y-8">
               <div className="flex justify-center items-center ">
       <div className="bg-red-50 p-6 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
      Forgot Your Password?
    </h2>
    <p className="text-sm text-gray-600 mb-5 text-center">
      Enter the email associated with your account and we’ll send you a reset link.
    </p>
         
         <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
       <InputField
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="your.email@example.com"
            />
      <button type="submit" className="w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 transition-all flex justify-center items-center">Send Reset Link</button>
    </form>

        
      </div>
    </div>
           </div>
          </div>
    </div>

 

  );
}

export default ForgotPassword;