"use client";

import { useEffect, useState, useCallback } from "react";
import { Car, CalendarDays, Zap } from "lucide-react";
import { OwnerAuthService } from "@/services/carOwner/authService";
import toast from "react-hot-toast";
import { Booking } from "@/types/ownerTypes";
import { StatsData } from "@/types/statsTypes";
import EarningsChart from "@/components/charts/LineChart";
import CarStatusChart from "@/components/charts/PieChart";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const getBookingTimeStatus = (booking: Booking): "upcoming" | "ongoing" | "completed" => {
  const now = new Date();
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  if (now < startDate) return "upcoming";
  if (now >= startDate && now <= endDate) return "ongoing";
  return "completed";
};

const getStatusBadge = (booking: Booking) => {
  const timeStatus = getBookingTimeStatus(booking);
  if (booking.status.toLowerCase() === "cancelled")
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Cancelled</span>;
  if (timeStatus === "ongoing")
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Ongoing</span>;
  if (timeStatus === "upcoming")
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Upcoming</span>;
  return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Completed</span>;
};

const Page = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"7d" | "30d" | "year">("7d");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [statsRes, bookingsRes] = await Promise.all([
        OwnerAuthService.getStatsData(range),
        OwnerAuthService.getBookingList(1, 5, "", "all"),
      ]);

      if (statsRes) setStats(statsRes);
      if (bookingsRes?.bookings) setRecentBookings(bookingsRes.bookings);
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
    { label: "Total Cars", value: stats?.totalCars ?? 0, icon: <Car size={18} className="text-blue-500" /> },
    { label: "Total Bookings", value: stats?.totalBookings ?? 0, icon: <CalendarDays size={18} className="text-purple-500" /> },
    { label: "Active Rentals", value: stats?.activeRentals ?? 0, icon: <Zap size={18} className="text-cyan-500" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to <span className="text-blue-500">Vroom</span> 🚗
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Here's an overview of your cars and bookings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              {card.icon}
              <p className="text-xs text-gray-400">{card.label}</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
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
{/* 
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      <EarningsChart data={stats?.earnings || []} />

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
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

  {/* 3/4 width */}
  <div className="md:col-span-3">
    <EarningsChart data={stats?.earnings || []} />
  </div>

  {/* 1/4 width */}
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

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
        <h2 className="text-base font-bold text-gray-900 mb-4">Recent Bookings</h2>

        {recentBookings.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No recent bookings</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 pb-3">Booking ID</th>
                  <th className="text-left text-xs text-gray-400 pb-3">Car</th>
                  <th className="text-left text-xs text-gray-400 pb-3">Customer</th>
                  <th className="text-left text-xs text-gray-400 pb-3">Duration</th>
                  <th className="text-left text-xs text-gray-400 pb-3">Status</th>
                  <th className="text-right text-xs text-gray-400 pb-3">Amount</th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-50">
                    <td className="py-3 text-xs text-blue-600 font-semibold">{booking.bookingId}</td>
                    <td className="py-3 text-sm">{booking.carId?.carName ?? "—"}</td>
                    <td className="py-3 text-sm">{booking.userId?.fullName ?? "—"}</td>
                    <td className="py-3 text-sm">
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </td>
                    <td className="py-3">{getStatusBadge(booking)}</td>
                    <td className="py-3 text-sm font-semibold text-right">
                      ₹{booking.totalPrice?.toLocaleString() ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;