import React, { useState, useEffect } from 'react';
// import { Booking } from '@/app/customer/dashboard/bookings/page';
import LocationMapView from '@/components/maps/LocationMapView';
import toast from 'react-hot-toast';
import LoadingButton from '@/components/common/LoadingButton';
import { BookingDetail } from '@/types/bookTypes';

interface BookingDetailsModalProps {
  booking: BookingDetail;
  onClose: () => void;
  onCancel: (bookingId: string) => Promise<void>;
  onContactOwner: (ownerId: string | undefined, ownerName: string | undefined) => void;
}

const getBookingStatus = (startDate: string, endDate: string, status: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (status === "cancelled") return { label: "Cancelled", color: "red", icon: "❌" };
  if (status === 'pending') return { label: "Pending", color: "yellow", icon: "⏳" };
  if (status === "failed") return { label: "Payment Failed", color: "red", icon: "⚠️" };
  if (end < now) return { label: "Completed", color: "gray", icon: "✅" };
  if (start <= now && end >= now) return { label: "Ongoing", color: "blue", icon: "🚗" };
  if (start > now) return { label: "Upcoming", color: "green", icon: "📅" };
  return { label: status, color: "gray", icon: "📋" };
};

const canCancelBooking = (startDate: string, status: string) => {
  if (status !== "confirmed") return false;
  const now = new Date();
  const start = new Date(startDate);
  const diffTime = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 1;
};

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
  onCancel,
  onContactOwner,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const { label, color, icon } = getBookingStatus(booking.startDate, booking.endDate, booking.status);
  const isAllowedToCancel = canCancelBooking(booking.startDate, booking.status);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDownloadReceipt = async () => {
    if (!booking.receiptUrl) {
      toast.error("Receipt not available");
      return;
    }

    setIsDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = booking.receiptUrl;
      link.download = `receipt-${booking.bookingId || booking._id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      toast.error("Failed to download receipt");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking._id) return;

    setIsCancelling(true);
    try {
      await onCancel(booking._id);
      setShowCancelConfirm(false);
    } catch (error) {
      // Error already handled in parent
    } finally {
      setIsCancelling(false);
    }
  };

  const statusColors = {
    red: "bg-red-50 border-red-200 text-red-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">
              🚗
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">{booking.carName}</h2>
              {booking.brand && (
                <p className="text-blue-100 text-sm font-medium">{booking.brand}</p>
              )}
            </div>
          </div>
          
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${statusColors[color as keyof typeof statusColors]} font-semibold`}>
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Booking Information Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Booking Details</h3>
                <div className="space-y-3">
                  {booking.bookingId && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Booking ID</span>
                      <span className="font-mono font-semibold text-slate-900">{booking.bookingId}</span>
                    </div>
                  )}
                  {booking.carNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Vehicle Number</span>
                      <span className="font-bold text-slate-900">{booking.carNumber}</span>
                    </div>
                  )}
                  {booking.createdAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Booked On</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Rental Period</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Start Date</span>
                    <span className="font-semibold text-green-700">
                      {new Date(booking.startDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">End Date</span>
                    <span className="font-semibold text-red-700">
                      {new Date(booking.endDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-900 font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        ₹{booking.totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Owner Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {booking.ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{booking.ownerName}</div>
                      {booking.ownerContact && (
                        <div className="text-sm text-slate-600">{booking.ownerContact}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {booking.pickupLocation && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Pickup Location</h3>
                  <div className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">📍</span>
                    <p className="text-slate-900 flex-1">{booking.pickupLocation}</p>
                  </div>
                  
                  {booking.pickupCoordinates && booking.pickupCoordinates.length === 2 && (
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {showMap ? 'Hide Map' : 'View on Map'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Map Section */}
          {showMap && booking.pickupCoordinates && booking.pickupCoordinates.length === 2 && (
            <div className="mb-8 rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
              <LocationMapView
                lat={booking.pickupCoordinates[1]}
                lng={booking.pickupCoordinates[0]}
                // address={booking.pickupLocation || "Pickup Location"}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200">
            {booking.status !== "cancelled" && (
              <LoadingButton
                onClick={() => onContactOwner(booking.carOwnerId, booking.ownerName)}
                className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                 Chat with Owner
              </LoadingButton>
            )}

            {booking.receiptUrl && (
              <button
                onClick={handleDownloadReceipt}
                disabled={isDownloading}
                className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isDownloading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Downloading...
                  </span>
                ) : (
                  '📄 Download Receipt'
                )}
              </button>
            )}

            {isAllowedToCancel && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                ❌ Cancel Booking
              </button>
            )}
          </div>

          {isAllowedToCancel && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              ℹ️ Free cancellation available up to 24 hours before pickup
            </p>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Cancel Booking?</h3>
                <p className="text-slate-600">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <LoadingButton
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isCancelling}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-semibold disabled:opacity-50"
                >
                  Keep Booking
                </LoadingButton>
                <LoadingButton
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Cancelling...
                    </span>
                  ) : (
                    'Yes, Cancel'
                  )}
                </LoadingButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetailsModal;