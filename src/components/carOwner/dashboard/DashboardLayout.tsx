

"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { OwnerAuthService } from "@/services/carOwner/authService";
import { useAuthStoreOwner } from "@/store/carOwner/authStore";
import toast from "react-hot-toast";
import { usePathname,useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { user, accessTokenOwner, setAuthOwner, logout } = useAuthStoreOwner();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await OwnerAuthService.getOwnerProfile();
        const owner = {
          ...userData.carOwner,
          id: userData.carOwner._id, // normalise
        };

        if (owner.blockStatus === 1) {
          logout();
          toast.error("You have been blocked by the admin.");
          router.push("/login");
          return;
        }

        if (accessTokenOwner) {
  setAuthOwner(userData.carOwner, accessTokenOwner);
}
        // setAuthOwner(owner, accessTokenOwner);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!accessTokenOwner) {
      setLoading(false);
      return;
    }
    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [accessTokenOwner, setAuthOwner, logout, router]);

  // verify status redirect
  useEffect(() => {
    if (user && (user.verifyStatus !== 1 || user.processStatus !== 2)) {
      router.push("/carOwner/dashboard/profile");
    }
  }, [user, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default DashboardLayout