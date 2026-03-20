// components/RegistrationForm.tsx
"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import InputField from "@/components/InputField";
import { signupSchema } from "@/lib/validation";
import { SignupData } from "@/types/authTypes";
import { AuthService } from "@/services/customer/authService";
import { OwnerAuthService } from "@/services/carOwner/authService";
import { signIn } from "next-auth/react";
import LoadingButton from "./common/LoadingButton";

interface RegistrationFormProps {
  role: "customer" | "carOwner";
  onSuccess?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ role, onSuccess }) => {
  const [formData, setFormData] = useState<SignupData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setStorageItem = (storage: Storage, key: string, value: string) => {
    if (typeof window !== "undefined") {
      storage.setItem(key, value);
    }
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message).join(", ");
      toast.error(errorMessages);
      setLoading(false);
      return;
    }

    try {
      let response;
      if (role === "customer") {
        response = await AuthService.registerCustomer(formData);
      } else {
        response = await OwnerAuthService.registerCarOwner(formData);
      }

      toast.success("Signup Successful!");
      console.log(response.data.data.email);
      setStorageItem(sessionStorage, "userEmail", response.data.data.email);
      setStorageItem(sessionStorage, "userRole", role);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signIn("google", { redirect: false });
    } catch (error) {
      console.error("Google Signup Failed:", error);
      toast.error("Google Signup Failed");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <InputField 
          label="Full Name" 
          name="fullName" 
          type="text" 
          onChange={handleChange} 
          placeholder="Enter your full name"
          // required 
          suppressHydrationWarning
        />
        <InputField 
          label="Email" 
          name="email" 
          type="email" 
          onChange={handleChange} 
          placeholder="Enter your email"
          // required 
          suppressHydrationWarning
        />
        <InputField 
          label="Password" 
          name="password" 
          type="password" 
          onChange={handleChange} 
          placeholder="Enter your password"
          // required 
          suppressHydrationWarning
        />
        <InputField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          onChange={handleChange}
          placeholder="Re-enter your password"
          // required
          suppressHydrationWarning
        />
        <InputField 
          label="Phone Number" 
          name="phoneNumber" 
          type="text" 
          onChange={handleChange} 
          placeholder="Enter your phone number"
          // required 
          suppressHydrationWarning
        />

        <LoadingButton
          type="submit"
          className="w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 transition-all flex justify-center items-center"
          disabled={loading}
          suppressHydrationWarning
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing Up...
            </>
          ) : (
            "Sign Up"
          )}
        </LoadingButton>
      </form>

      <LoadingButton
        type="button"
        onClick={handleGoogleSignup}
        className="w-full py-3 text-white font-semibold rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 transition-all"
        suppressHydrationWarning
      >
        Sign up with Google
      </LoadingButton>
    </>
  );
};

export default RegistrationForm;