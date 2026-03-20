
"use client";
import React, { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { AdminAuthService} from "@/services/admin/adminService";
import { useAuthStoreAdmin } from "@/store/admin/authStore";

import toast from "react-hot-toast";
import NotificationBell from "../common/NotificationBell";
interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
 
  const { user, accessTokenAdmin, setAuthAdmin } = useAuthStoreAdmin();
   const [loading, setLoading] = useState(true);
  console.log("check user",user);
  console.log("check access", accessTokenAdmin)
  

  useEffect(() => {

    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

    if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading ...</p>
      </div>
    );
  }
  if (!user) {
    return null
   
  }
  return (
  <div className="flex min-h-screen bg-gray-100">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      {accessTokenAdmin && (
  <div className="w-full h-16 flex items-center justify-end px-6">
    {user?.id && <NotificationBell userId={user.id} />}
  </div>
)}
     
      <main className="flex-1 p-6">{children}</main>
    </div>
  </div>
);
};

export default DashboardLayout;
