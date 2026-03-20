"use client";

import React, { useEffect, useState, Suspense, lazy } from "react";
import { AuthService } from "@/services/customer/authService";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/customer/authStore";
import Pagination from '@/components/pagination';
import BookingCard from '@/components/customer/dashboard/BookingCard';
import BookingSkeleton from '@/components/skeleton/BookingSkeleton';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingButton from "@/components/common/LoadingButton";
import { BookingDetail } from "@/types/bookTypes";

const BookingDetailsModal = lazy(() => import('@/components/customer/dashboard/BookingDetailsModal'));



const BookingsPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<BookingDetail[]>([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        const data = await AuthService.findCustomerBookingDetails(currentPage, itemsPerPage);
        console.log("data",data)
        setBookingData(data.bookings || []);
        console.log(bookingData)
        setTotalBookings(data.total || 0);
        setError("");
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to load bookings. Please try again later.");
        setBookingData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [currentPage]);

  const handleViewDetails = (booking: BookingDetail) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await AuthService.cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      setBookingData((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
      );

      if (selectedBooking?._id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: "cancelled" });
      }
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error("Failed to cancel booking");
      throw err;
    }
  };

  const handleContactOwner = (ownerId: string | undefined, ownerName: string | undefined) => {
    if (!ownerId || !ownerName) {
      toast.error("Owner information not available");
      return;
    }
    router.push(`/customer/dashboard/chats/${ownerId}/${encodeURIComponent(ownerName)}`);
  };

  const totalPages = Math.ceil(totalBookings / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Authentication Required</h2>
          <p className="text-slate-600">Please log in to view your bookings</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Bookings</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <LoadingButton
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </LoadingButton>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
     <div className="bg-gradient-to-b from-blue-200 to-yellow-200  p-10 min-h-screen">
        <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl mb-6">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              My Bookings
            </h1>
            <p className="text-white">Manage and track all your car rentals</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <BookingSkeleton key={i} />
              ))}
            </div>
          ) : bookingData.length > 0 ? (
            <>

              <div className="space-y-4 mb-8">
                {bookingData.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>


              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (

            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="text-8xl mb-6">🚗</div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">No Bookings Yet</h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Start your journey by booking your first car rental
              </p>
              <LoadingButton
                onClick={() => router.push('/cars')}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg font-semibold"
              >
                Browse Available Cars
              </LoadingButton>
            </div>
          )}

    
          {showDetailsModal && selectedBooking && (
            <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
            </div>}>
              <BookingDetailsModal
                booking={selectedBooking}
                onClose={handleCloseModal}
                onCancel={handleCancelBooking}
                onContactOwner={handleContactOwner}
              />
            </Suspense>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BookingsPage;