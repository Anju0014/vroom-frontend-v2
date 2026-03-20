
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname ,useRouter} from "next/navigation";
import { useAuthStore } from "@/store/customer/authStore";
import { AuthService } from "@/services/customer/authService";
import { signOut,useSession } from "next-auth/react";
import { 
  User, 
  Car, 
  Calendar, 
  FileText, 
  CreditCard, 
  Home, 
  MessageSquare, 
  AlertTriangle, 
  DollarSign, 
  Settings, 
  LogOut, 
  WalletIcon
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingButton from "@/components/common/LoadingButton";

const Sidebar: React.FC = () => {
    const {user,logout} =useAuthStore();
     const router=useRouter()
    console.log("user",user);
     const [isGoogleUser, setIsGoogleUser] = useState(false);
  const pathname = usePathname();
      useEffect(() => {
        // setHydrated(true);
        setIsGoogleUser(sessionStorage.getItem("provider") === "google");
      }, []);
   const handleLogout= async ()=>{
      try{
        const response=await AuthService.logoutCustomer();

        if(!response){
          throw new Error("Logout Failed")
        }
         if (isGoogleUser) {
                  await signOut({ callbackUrl: "/" });
                 }
        logout();
         router.replace('/login');

      }catch(error){
        toast.error("Logout Failed.Please try Again")
      }
    }

  const navItems = [
    // { name: "DashBoard", path: "/customer/dashboard/profile", icon: <CreditCard size={18} /> },
    { name: "My Profile", path: "/customer/dashboard/profile", icon: <User size={18} /> },
    // { name: "Your Cars", path: "/dashboard/cars", icon: <Car size={18} /> },
    { name: "Bookings", path: "/customer/dashboard/bookings", icon: <Calendar size={18} /> },
    { name: "Report & Complaint", path: "/customer/dashboard/complaints", icon: <AlertTriangle size={18} /> },
    { name: "Wallet", path: "/customer/dashboard/wallets", icon: <WalletIcon size={18} /> },
    // { name: "Revenue", path: "/dashboard/revenue", icon: <DollarSign size={18} /> },
    { name: "Chat", path: "/customer/dashboard/chats", icon: <MessageSquare size={18} /> },
    // { name: "Settings", path: "/dashboard/settings", icon: <Settings size={18} /> },
    
  ];

  return (
    <div className="w-64 min-h-screen bg-blue-200 text-gray-800 p-4">
  
      <div className="flex flex-col items-center mb-8 pt-4">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 relative">
          <Image
            src={user?.profileImage ?? "/images/user.png"}
            alt="userImage"
            width={80}
            height={80}
            style={{ objectFit: "cover" }}
          />
        </div>

        <h2 className="text-lg font-semibold">{user?.fullName}</h2>
        <p className="text-gray-600 text-sm">{user?.email}</p>
      </div>

      
      <nav>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`flex items-center py-2 px-3 rounded-md  border-l-4 ${
                  pathname === item.path 
                    ? "bg-blue-300  border-blue-600 text-blue-800 font-bold" 
                    : "hover:bg-blue-300 border-transparent"
                  } transition-colors duration-200`
                }
              >
                <span className="mr-3 text-blue-700">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </Link>
            </li>
          ))}
          <li>
                      <LoadingButton
                        onClick={handleLogout}
                        className="w-full flex items-center py-2 px-3 rounded-md hover:bg-blue-300 transition-colors duration-200 "
                      >
                        <LogOut size={18} className="mr-3 text-blue-700" />
                        <span className="text-sm">Logout</span>
                      </LoadingButton>
                    </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;