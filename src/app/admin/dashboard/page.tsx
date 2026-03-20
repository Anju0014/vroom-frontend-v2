
"use client";

import { useEffect, useState, useCallback } from "react";
import { Car, Users, UserCheck, CalendarDays, Zap } from "lucide-react";
import { AdminAuthService } from "@/services/admin/adminService";
import toast from "react-hot-toast";
import {StatsData,RecentBooking}from '@/types/statsTypes'
import EarningsChart from "@/components/charts/LineChart";
import CarStatusChart from "@/components/charts/PieChart";

const statusStyle: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));

const Page = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"7d" | "30d" | "year">("7d");
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const statsRes = await AdminAuthService.getStatsData(range);
      const bookingsRes = await AdminAuthService.getAllBookings(1, 5, {});

      if (statsRes) setStats(statsRes);
      if (bookingsRes?.data) setRecentBookings(bookingsRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Cars",     value: stats?.totalCars ?? 0,      icon: <Car size={18} className="text-blue-500" /> },
    { label: "Customers",      value: stats?.totalCustomers ?? 0,  icon: <Users size={18} className="text-green-500" /> },
    { label: "Car Owners",     value: stats?.totalCarOwners ?? 0,  icon: <UserCheck size={18} className="text-amber-500" /> },
    { label: "Total Bookings", value: stats?.totalBookings ?? 0,   icon: <CalendarDays size={18} className="text-purple-500" /> },
    { label: "Active Rentals", value: stats?.activeRentals ?? 0,   icon: <Zap size={18} className="text-cyan-500" /> },
    { label: "Revenue",        value: stats?.totalRevenue ?? 0, icon: <span className="text-green-600">₹</span> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to <span className="text-blue-500">Vroom</span> 🚗
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Here's what's happening across your platform today.
        </p>
      </div>

 
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              {card.icon}
              <p className="text-xs text-gray-400">{card.label}</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
          <div className="flex gap-2 mb-6">
        {[
          { label: "7 Days", value: "7d" },
          { label: "30 Days", value: "30d" },
          { label: "1 Year", value: "year" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setRange(item.value as any)}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              range === item.value
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>


      {/* <RevenueChart />
<UserGrowthChart />
<CarApprovalChart /> */}

 
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  <div className="md:col-span-3">
    <EarningsChart data={stats?.earnings || []} />
  </div>
  <div className="md:col-span-1">
    <CarStatusChart
      data={
        stats?.carStats || {
          available: 0,
          verified:0,
          booked: 0,
          maintenance: 0,
        }
      }
    />
  </div>

</div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Recent Bookings</h2>

        {recentBookings.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No recent bookings</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-400 font-medium pb-3">Booking ID</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3">Customer</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3">Car</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3">Owner</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3">Status</th>
                <th className="text-right text-xs text-gray-400 font-medium pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => {
                const status = b.status?.toLowerCase() ?? "pending";
                return (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-xs text-gray-400">{b.bookingId}</td>
                    <td className="py-3 text-sm font-medium text-gray-800">{b.customer?.fullName ?? "—"}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {b.car?.carName} <span className="text-gray-400">({b.car?.brand})</span>
                    </td>
                    <td className="py-3 text-sm text-gray-500">{b.carOwner?.fullName ?? "—"}</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusStyle[status] ?? "bg-gray-100 text-gray-600"}`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-semibold text-gray-800 text-right">
                      ₹{b.totalPrice?.toLocaleString() ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Page;