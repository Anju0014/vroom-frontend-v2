"use client"
import { useState, useEffect } from 'react';
import { OwnerAuthService } from '@/services/carOwner/authService';
import Pagination from '@/components/pagination';
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import LoadingButton from '@/components/common/LoadingButton';
import { Booking } from '@/types/ownerTypes';
import { useDebounce } from '@/hooks/useDebounce';


const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export default function CarOwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const itemsPerPage = 10;
  const router = useRouter();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

      const response = await OwnerAuthService.getBookingList(
        currentPage,
        itemsPerPage,
        debouncedSearchTerm.trim(),
        statusFilter
      );
      
        if (response.bookings) {
          setBookings(response.bookings);
          setTotalBookings(response.total || 0);
        } else {
          setError('No booking data found');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError('Failed to fetch data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, debouncedSearchTerm, statusFilter]);

  const totalPages = Math.ceil(totalBookings / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const canMarkCarReturned = (booking: Booking) => {
  const timeStatus = getBookingTimeStatus(booking);
  return timeStatus === "completed" && booking.status === "confirmed" && !booking.isCarReturned;
};

const handleCarReturned = async (bookingId: string) => {
  try {
    console.log("sending data")
    const response=await OwnerAuthService.markCarReturned(bookingId);
    console.log(response)
    console.log("getting")
    toast.success("Booking completed and earnings credited");

    setBookings(prev =>
      prev.map(b =>
        b._id === bookingId ? { ...b, isCarReturned: true, status: "completed" } : b
      )
    );
  } catch (err) {
    console.log(err)
    toast.error("Failed to complete booking");
  }
};


  const handleDownloadReceipt = async (bookingId: string) => {
    try {
      const res = await OwnerAuthService.getReceiptUrl(bookingId);
      const url = res.url;
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Unable to download receipt");
    }
  };

    const handleContactCustomer = (customerId: string | undefined, customerName: string | undefined) => {
      if (!customerId || !customerName) {
        toast.error("Owner information not available");
        return;
      }
      router.push(`/carOwner/dashboard/chats/${customerId}/${encodeURIComponent(customerName)}`);
    };

  const canCancelBooking = (startDate: string, status: string) => {
    if (status !== "confirmed") return false;
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 1;
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await OwnerAuthService.cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
      );
    } catch (err) {
      console.error("Cancel error", err);
      toast.error("Failed to cancel booking");
    }
  };

  const getBookingTimeStatus = (booking: Booking): 'upcoming' | 'ongoing'|'completed' => {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    
    if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  };

  const getStatusBadge = (booking: Booking) => {
    const timeStatus = getBookingTimeStatus(booking);
    
    if (booking.status.toLowerCase() === 'cancelled') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
    } else if (timeStatus === 'ongoing') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Ongoing</span>;
    } else if (timeStatus === 'upcoming') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Upcoming</span>;
    } else {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Completed</span>;
    }
  };

 

  if (isLoading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="bg-white border-2 border-red-200 p-8 rounded-xl shadow-lg">
          <h2 className="text-red-800 text-lg font-bold">Error</h2>
          <p className="text-red-700 mt-2">{error}</p>
          <LoadingButton
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </LoadingButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent mb-2">
            My Car Bookings
          </h1>
          <p className="text-gray-600">Manage and track all your car rental bookings</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Bookings
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by booking ID, car name, or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 font-medium">
            Showing {bookings.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, totalBookings)} of {totalBookings} bookings
          </p>
          {isLoading && (
            <span className="text-sm text-blue-600 flex items-center gap-2 font-medium">
              <div className="w-4 h-4 border-t-2 border-blue-600 border-solid rounded-full animate-spin"></div>
              Updating...
            </span>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="mt-4 text-lg font-bold text-gray-900">No bookings found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : "You don't have any bookings yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Car & Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-50">
                  {bookings.map((booking, index) => {
                    const isAllowedToCancel = canCancelBooking(booking.startDate, booking.status);

                    return (
                      <tr 
                        key={booking._id} 
                        className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50 transition-all ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-blue-700">
                            {booking.bookingId}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {booking.carId.carName || 'Unknown Car'}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">
                              {booking?.userId?.fullName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatDate(booking.startDate)}
                          </div>
                          <div className="text-sm text-gray-600">
                            to {formatDate(booking.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-yellow-600">
                            ₹{booking.totalPrice.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <LoadingButton
                              onClick={() => handleDownloadReceipt(booking._id)}
                              className="inline-flex items-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                              title="Download Receipt"
                            >
                              <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Receipt
                            </LoadingButton>
                            {booking.status.toLowerCase() !== 'cancelled' && (
                              <LoadingButton
                                onClick={() => handleContactCustomer(booking.userId.id,booking.userId.fullName)}
                                className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                                title="Chat with Customer"
                              >
                                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Chat
                              </LoadingButton>
                            )}
                            {canMarkCarReturned(booking) && (
  <LoadingButton
    onClick={() => handleCarReturned(booking.bookingId)}
    className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg"
  >
   Car received safely
  </LoadingButton>
)}

                            {isAllowedToCancel && (
                              <LoadingButton
                                onClick={() => handleCancelBooking(booking._id)}
                                className="inline-flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                                title="Cancel Booking"
                              >
                                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                              </LoadingButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}