"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AuthService } from "@/services/customer/authService";
import { OwnerAuthService } from "@/services/carOwner/authService";
import AuthSideBanner from "@/components/AuthSideBanner";
import InputField from "@/components/InputField";
import LoadingButton from "@/components/common/LoadingButton";


const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  // const role=sessionStorage.getItem("role")


  useEffect(() => {
    const storedEmail = sessionStorage.getItem("userEmail");
  console.log("storedEmail",storedEmail)

    setRole(sessionStorage.getItem("userRole"))
    console.log(role)
    if (!storedEmail) {
      setEmailError(true);
      toast.error("Email not found. Please sign up first.");
      setTimeout(() => router.push("/signup"), 2000);
    } else {
      setEmail(storedEmail);
    }
  }, []);


  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setOtp(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (role === "customer") {
       
        console.log("email",email)
        console.log("otp",otp)
                  response = await AuthService.verifyotpCustomer({ email, otp });
          } else {
                  response = await OwnerAuthService.verifyotpCarOwner({ email, otp });
          }
      console.log(response);
      toast.success("OTP Verified! Redirecting...");
      const redirectPath = role === "customer" ? "/login" : "/login";
       setTimeout(() => router.push(redirectPath), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timeLeft > 0) return;
    
    setResending(true);
    try {
      if (role === "customer") {
        await AuthService.resendotpCustomer({ email });
      } else {
      await OwnerAuthService.resendotpCarOwner({ email });
      }
      
      toast.success("OTP Resent!");
      setTimeLeft(300); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  if (emailError) {
    return null;
  }

  return (
    <div>

    
<div className="flex min-h-screen">
    
       <AuthSideBanner
  subText="A quick OTP check, and you’re ready to explore the road with Vroom."
  bottomText="if you didn’t receive the OTP, check your spam folder or request a new code."
/>
        
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
            <div className="max-w-md w-full space-y-8">
             
              
       <div className="bg-red-50 p-6 rounded-xl shadow-md w-96">
         <h2 className="text-2xl font-bold mb-4 text-center ">Enter OTP</h2>
         <p className="text-sm  text-center mb-4">
           We sent a 6-digit OTP to your email. Expires in:{" "}
           <span className={`font-semibold ${timeLeft < 60 ? "text-red-500" : "text-blue-500"}`}>
             {formatTime(timeLeft)}
          </span>
         </p>

        <form onSubmit={handleSubmit} className="space-y-4">
         <InputField
            label=""
            name="otp"
            type="text"
            value={otp}
            onChange={handleChange}
            maxLength={6}
            className="w-full px-4 py-2 border rounded-lg text-center text-xl  focus:ring-red-500 focus:border-red-500 tracking-widest"
            placeholder="123456"
          />
          <LoadingButton
            type="submit"
            className="w-full py-3 text-white font-semibold rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 transition-all flex justify-center items-center"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </LoadingButton>
        </form>

        <p className="text-center text-sm mt-4">
          Didn't receive OTP?{" "}
          <LoadingButton
            type="button"
            disabled={timeLeft > 0 || resending}
            onClick={handleResendOTP}
            className={`${
              timeLeft > 0 || resending
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-500 font-semibold hover:underline"
            }`}
          >
            {resending ? "Resending..." : "Resend OTP"}
          </LoadingButton>
        </p>
      </div>
    </div>
    </div>
    </div>
    </div>

 
    // </div>
  );
};

export default OTPVerification;