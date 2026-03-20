
"use client";

import React, { ReactNode, useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import { AuthService } from "@/services/customer/authService";
import { useAuthStore } from "@/store/customer/authStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { user, accessToken, setAuth, logout } = useAuthStore();
  const router = useRouter();

  // fetch user from API and normalise id
  const fetchUser = useCallback(async () => {
    if (!accessToken) {
      toast.error("No access token available");
      setLoading(false);
      return;
    }

    try {
      const { customer } = await AuthService.getCustomerProfile();

      // normalise _id → id
      const normalisedCustomer = {
        ...customer,
        id: customer.id ?? customer._id,
      };

      if (normalisedCustomer.blockStatus === 1) {
        logout();
        toast.error("You have been blocked by the admin.");
        router.push("/login");
        return;
      }

      setAuth(normalisedCustomer, accessToken);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken, setAuth, logout, router]);

  useEffect(() => {
    // on mount or when accessToken changes
    if (!user) {
      fetchUser();
    } else if (user.blockStatus === 1) {
      logout();
      toast.error("You have been blocked by the admin.");
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [user, fetchUser, logout, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;
