"use client"; 
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import LoadingButton from "./common/LoadingButton";

interface InputProps {
  label: string;
  name: string;
  type: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suppressHydrationWarning?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  min?:string
  className?:string;
}

const InputField: React.FC<InputProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  suppressHydrationWarning,
  disabled = false,
  placeholder,
  maxLength,
  min,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-bold text-gray-700 ">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          suppressHydrationWarning={suppressHydrationWarning}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          className={`appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 pr-10 ${
          disabled ? "cursor-not-allowed" : "cursor-text"
          } ${className || "focus:ring-red-500 focus:border-red-500"}`}
        />
        {isPassword && (
          <LoadingButton
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </LoadingButton>
        )}
      </div>
    </div>
  );
};

export default InputField;
