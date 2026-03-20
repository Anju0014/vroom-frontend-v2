import React, { memo } from 'react';
// import { Booking } from '@/app/customer/dashboard/bookings/page';
import { useRouter } from 'next/navigation';
import LoadingButton from '@/components/common/LoadingButton';
import { BookingDetail } from '@/types/bookTypes';
interface BookingCardProps {
  booking: BookingDetail;
  onViewDetails: (booking: BookingDetail) => void;
}

const getBookingStatus = (startDate: string, endDate: string, status: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (status === "cancelled") return { label: "Cancelled", color: "red" };
  if (status === 'pending') return { label: "Pending", color: "yellow" };
  if (status === "failed") return { label: "Payment Failed", color: "red" };
  if (end < now) return { label: "Completed", color: "gray" };
  if (start <= now && end >= now) return { label: "Ongoing", color: "blue" };
  if (start > now) return { label: "Upcoming", color: "green" };
  return { label: status, color: "gray" };
};

const isPickupToday = (startDate: string) => {
  const today = new Date();
  const start = new Date(startDate);

  return (
    start.getDate() === today.getDate() &&
    start.getMonth() === today.getMonth() &&
    start.getFullYear() === today.getFullYear()
  );
};


const statusStyles = {
  red: "bg-red-100 text-red-700 border-red-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  gray: "bg-gray-100 text-gray-700 border-gray-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
};

const BookingCard: React.FC<BookingCardProps> = memo(({ booking, onViewDetails }) => {
  const router=useRouter()
  const { label, color } = getBookingStatus(booking.startDate, booking.endDate, booking.status);
  // const isTodayPickup =
  // (label === "Upcoming" || label === "Ongoing") &&
  // isPickupToday(booking.startDate);
  //  && !booking.pickupVerified;
  const isTodayPickup = 
  isPickupToday(booking.startDate) &&
   booking.status === 'confirmed';

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 group">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-4">
  
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-2xl">🚗</span>
              </div>
              

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 truncate">
                    {booking.carName}
                  </h3>
                  {booking.brand && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                      {booking.brand}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                  {booking.bookingId && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">ID:</span>
                      <span className="font-mono">{booking.bookingId}</span>
                    </span>
                  )}
                  {booking.carNumber && (
                    <span className="flex items-center gap-1">
                      <span>🚘</span>
                      <span className="font-semibold">{booking.carNumber}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>


          <div className="flex-1 border-l border-slate-200 pl-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 w-20">From:</span>
                <span className="font-semibold text-slate-900">
                  {new Date(booking.startDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 w-20">To:</span>
                <span className="font-semibold text-slate-900">
                  {new Date(booking.endDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {isTodayPickup && (
  <button
    onClick={() => router.push(`/customer/pickup/${booking.bookingId}`)}
    className="px-5 py-2 bg-green-600 text-white rounded-lg
               hover:bg-green-700 transition-all font-medium text-sm
               shadow-md hover:shadow-lg"
  >
    Start Pickup
  </button>
)}



          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                ₹{booking.totalPrice.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-500">Total Amount</div>
            </div>
            
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${statusStyles[color as keyof typeof statusStyles]}`}>
              {label}
            </span>
            
            <LoadingButton
              onClick={() => onViewDetails(booking)}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105"
            >
              View Details 
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
});

BookingCard.displayName = 'BookingCard';

export default BookingCard;