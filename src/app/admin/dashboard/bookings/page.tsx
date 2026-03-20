'use client';

import React, { useEffect, useState, useCallback } from "react";
import { TableColumn, Table } from "@/components/admin/Table";
import { AdminAuthService } from "@/services/admin/adminService";
import BookingDetailsModal from "@/components/admin/BookingDetailsModal";
import { IBooking } from "@/types/bookTypes";
import Pagination from "@/components/pagination";
import { useDebounce } from "@/hooks/useDebounce";

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [clickLocked, setClickLocked] = useState(false);
  const itemsPerPage = 5;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);


  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const fetchBookings = useCallback(async (page: number, search: string) => {
    try {
      setIsLoading(true);
      const response = await AdminAuthService.getAllBookings(
        page, 
        itemsPerPage, 
        { search: search.trim() }
      );
      
      const bookingsData = response.data || [];
      console.log("Bookings from backend", bookingsData);
      
      if (bookingsData) {
        const transformedBookings = bookingsData.map((booking: IBooking) => ({
          ...booking, 
          bookingIdDisplay: booking.bookingId,
          carNameDisplay: booking.car?.carName || 'N/A',
          customerDisplay: booking.customer?.fullName || 'N/A',
          ownerDisplay: booking.carOwner?.fullName || 'N/A',
          amountDisplay: `₹${booking.totalPrice}`,
          statusDisplay: getStatusBadgeText(booking.status, booking.startDate, booking.endDate),
        }));
        
        setBookings(transformedBookings);
        setTotalBookings(response.total || 0);
        setError(null);
      } else {
        setBookings([]);
        setTotalBookings(0);
        setError('No booking data found');
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError('Failed to fetch data. Please try again later.');
      setBookings([]);
      setTotalBookings(0);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  
  useEffect(() => {
    fetchBookings(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchBookings]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= Math.ceil(totalBookings / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getBookingTimeStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'upcoming';
    } else if (now > end) {
      return 'completed';
    } else {
      return 'ongoing';
    }
  };

  const getStatusBadge = (status: string, startDate: string, endDate: string) => {
    const timeStatus = getBookingTimeStatus(startDate, endDate);
    let badgeClass = "px-2 py-1 rounded-full text-xs font-medium ";
    let statusText = "";
    
    if (status.toLowerCase() === 'cancelled') {
      badgeClass += "bg-red-100 text-red-800";
      statusText = "Cancelled";
    } else {
      switch (timeStatus) {
        case 'ongoing':
          badgeClass += "bg-green-100 text-green-800";
          statusText = "Ongoing";
          break;
        case 'upcoming':
          badgeClass += "bg-blue-100 text-blue-800";
          statusText = "Upcoming";
          break;
        case 'completed':
          badgeClass += "bg-green-100 text-gray-800";
          statusText = "Completed";
          break;
        default:
          badgeClass += "bg-yellow-100 text-yellow-800";
          statusText = status;
      }
    }
    
    return <span className={badgeClass}>{statusText}</span>;
  };
  
  const getStatusBadgeText = (status: string, startDate: string, endDate: string) => {
    const timeStatus = getBookingTimeStatus(startDate, endDate);
    
    if (status.toLowerCase() === 'cancelled') {
      return 'Cancelled';
    }
    
    switch (timeStatus) {
      case 'ongoing':
        return 'Ongoing';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const tableData = bookings.map(booking => ({
    bookingIdDisplay: booking.bookingIdDisplay,
    carNameDisplay: booking.carNameDisplay,
    customerDisplay: booking.customerDisplay,
    ownerDisplay: booking.ownerDisplay,
    amountDisplay: booking.amountDisplay,
    statusDisplay: getStatusBadge(booking.status, booking.startDate, booking.endDate),
    _booking: booking,
  }));

  const columns: TableColumn[] = [
    { header: "Vroom BookingID", key: "bookingIdDisplay" },
    { header: "Car", key: "carNameDisplay" },
    { header: "Customer", key: "customerDisplay" },
    { header: "Owner", key: "ownerDisplay" },
    { header: "Amount", key: "amountDisplay" },
    { header: "Status", key: "statusDisplay" },
  ];

  const handleViewBooking = (rowData: any) => {
     if (clickLocked) return; 
     setClickLocked(true);
     setSelectedBooking(rowData._booking);
     setTimeout(() => setClickLocked(false), 500);
  };

  const totalPages = Math.ceil(totalBookings / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Bookings Management
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by booking ID, car, customer, or owner..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {isLoading && searchTerm ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        {!isLoading && (
          <>
            {searchTerm ? (
              <>Showing {bookings.length} results{totalBookings > itemsPerPage && ` (page ${currentPage} of ${totalPages})`} for "{searchTerm}"</>
            ) : (
              <>Total bookings: {totalBookings}{totalBookings > itemsPerPage && ` (page ${currentPage} of ${totalPages})`}</>
            )}
          </>
        )}
      </div>

      <Table
        columns={columns}
        data={tableData}
        showViewButton={true}
        onView={handleViewBooking}
        isLoading={isLoading}
      />

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default BookingsPage;