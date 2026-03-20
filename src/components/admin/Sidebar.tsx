"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname,useRouter } from "next/navigation";
import { useAuthStoreAdmin } from "@/store/admin/authStore";
import { AdminAuthService } from "@/services/admin/adminService";
import toast from "react-hot-toast";

import {
  User,
  Car,
  BarChart2,
  DollarSign,
  Users,
  Home,
  LogOut,
  CheckCircleIcon,
  CreditCard,
  Pen,
  Wallet
} from "lucide-react";
import LoadingButton from "../common/LoadingButton";

const Sidebar: React.FC = () => {
  const { user,logout } = useAuthStoreAdmin();
  const pathname = usePathname();
  const router =useRouter();

  const handleLogout= async ()=>{
    try{
      await AdminAuthService.logoutAdmin();
      // if(!response){
      //   throw new Error("Logout Failed")
      // }
      logout();
      router.replace('/admin/login');

    }catch(error){
      toast.error("Logout Failed.Please try Again")
      logout();
      router.replace('/admin/login');
    }
  }


  const navItems = [
    { 
      name: "Dashboard", 
      path: "/admin/dashboard", 
      icon: <Home size={18} /> 
    },
    { 
      name: "Customers", 
      path: "/admin/dashboard/customers", 
      icon: <Users size={18} /> 
    },
    { 
      name: "Car Owners", 
      path: "/admin/dashboard/carOwners", 
      icon: <User size={18} /> 
    },
    { 
      name: "Car Owner Verification ", 
      path: "/admin/dashboard/ownerVerification", 
      icon: <CheckCircleIcon size={18} /> 
    },
    { 
      name: "Car Verification ", 
      path: "/admin/dashboard/carVerification", 
      icon: <CheckCircleIcon size={18} /> 
    },
    { 
      name: "Cars", 
      path: "/admin/dashboard/cars", 
      icon: <Car size={18} /> 
    },
    { 
      name: "Bookings", 
      path: "/admin/dashboard/bookings", 
      icon: <CreditCard size={18} /> 
    },
     { 
      name: "Complaints", 
      path: "/admin/dashboard/complaints", 
      icon: <Pen size={18} /> 
    },
    { 
      name: "Payments", 
      path: "/admin/dashboard/payments", 
      icon: <Wallet size={18} /> 
    },
    
    { 
      name: "Sales", 
      path: "/admin/sales", 
      icon: <CreditCard size={18} /> 
    },
     { 
      name: "Revenue", 
      path: "/admin/revenue", 
      icon: <DollarSign size={18} /> 
    },
    { 
      name: "Analytics", 
      path: "/admin/analytics", 
      icon: <BarChart2 size={18} /> 
    },
  ];

  return (
    <div className="w-64 min-h-screen bg-blue-200 text-gray-800 p-4">
      <div className="flex flex-col items-center mb-8 pt-4">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 relative">
          <Image
            src={"/images/logo.png"}
            alt="vroom logo"
            width={80}
            height={80}
            style={{ objectFit: "cover" }}
          />
        </div>
        
        <h2 className="text-lg font-semibold">Vroom</h2>
      </div>

      <nav>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
  href={item.path}
  className={`flex items-center py-2 px-3 rounded-md border-l-4 ${
    pathname===item.path
      ? "bg-blue-300 border-blue-600 text-blue-800 font-bold"
      : "hover:bg-blue-300 border-transparent"
  } transition-colors duration-200`}
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