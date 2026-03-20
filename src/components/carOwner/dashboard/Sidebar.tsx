
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStoreOwner } from "@/store/carOwner/authStore";
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
  Wallet
} from "lucide-react";
import toast from "react-hot-toast";
import { OwnerAuthService } from "@/services/carOwner/authService";
import LoadingButton from "@/components/common/LoadingButton";



const Sidebar: React.FC = () => {

  const router=useRouter()
    const { user, logout, accessTokenOwner } = useAuthStoreOwner();

 
    console.log("user",user)
  const pathname = usePathname();
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

  const navItems = [
    { name: "DashBoard", path: "/carOwner/dashboard", icon: <CreditCard size={18} /> },
    { name: "Personal Details", path: "/carOwner/dashboard/profile", icon: <User size={18} /> },
    { name: "Your Cars", path: "/carOwner/dashboard/cars", icon: <Car size={18} /> },
    { name: "Bookings", path: "/carOwner/dashboard/bookings", icon: <Calendar size={18} /> },
    // { name: "Report & Complaint", path: "/carOwner/dashboard/complaints", icon: <AlertTriangle size={18} /> },
    { name: "Revenue", path: "/carOwner/dashboard/revenue", icon: <DollarSign size={18} /> },
    { name: "Wallet", path: "/carOwner/dashboard/wallet", icon: <Wallet size={18} /> },
    { name: "Chats", path: "/carOwner/dashboard/chats", icon: <MessageSquare size={18} /> },
    { name: "Settings", path: "/carOwner/dashboard/settings", icon: <Settings size={18} /> },
    //  { name: "Logout", path: "/logout", icon: <LogOut size={18} /> },
  ];

  return (
    <div className="w-64 min-h-screen bg-blue-100 text-gray-800 p-4">
  
      <div className="flex flex-col items-center mb-8 pt-4">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 relative">
          <Image
            src={user?.profileImage ?? "/images/user.png"}
            alt="userImage"
            width={80}
            height={80}
            style={{ objectFit: "cover" }}
            priority
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
                className={`flex items-center py-2 px-3 rounded-md border-l-4 ${
                  pathname === item.path 
                    ? "bg-blue-200  border-blue-600 text-blue-800 font-bold" 
                    : "hover:bg-blue-200 border-transparent "
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
                className="w-full flex items-center py-2 px-3 rounded-md hover:bg-blue-200 transition-colors duration-200 "
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