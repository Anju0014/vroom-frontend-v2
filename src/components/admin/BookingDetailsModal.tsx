import React from 'react';
import { XCircle, User, Car, Calendar, DollarSign, Clock } from 'lucide-react';
import LoadingButton from '../common/LoadingButton';

interface BookingModalProps {
  booking: any;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingModalProps> = ({ booking, onClose }) => {
  
  const formatDateWithTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (e) {
      return "Invalid date";
    }
  };
  
  const calculateDuration = () => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getBookingTimeStatus = () => {
    const now = new Date();
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);

    if (now < start) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    } else if (now > end) {
      return { status: 'completed', color: 'bg-green-100 text-green-700 border-gray-200' };
    } else {
      return { status: 'ongoing', color: 'bg-yellow-100 text-yellow-700 border-green-200' };
    }
  };

  const timeStatus = getBookingTimeStatus();

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4
                bg-black/30 backdrop-blur-md">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <p className="text-blue-100 text-sm mt-1">Complete information about the booking</p>
            </div>
            <LoadingButton
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <XCircle size={24} />
            </LoadingButton>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Booking ID</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{booking.bookingId}</p>
            </div>
            <div>
              {booking.status.toLowerCase() === 'cancelled' ? (
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold border border-red-200 text-sm">
                  Cancelled
                </span>
              ) : (
                <span className={`px-4 py-2 rounded-full font-semibold border text-sm ${timeStatus.color}`}>
                  {timeStatus.status.charAt(0).toUpperCase() + timeStatus.status.slice(1)}
                </span>
              )}
            </div>
          </div>


          <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Car className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Vehicle</h3>
                <p className="text-xl font-bold text-gray-800 mt-1">{booking.car.carName}</p>
                <p className="text-gray-600 mt-1">{booking.car.brand} • {booking.car.model}</p>
                {/* <p className="text-xs text-gray-400 mt-2 font-mono">ID: {booking.car.id}</p> */}
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</h3>
                  <p className="font-bold text-gray-800 mt-2">{booking.customer.fullName}</p>
                  <p className="text-sm text-gray-600 mt-1">{booking.customer.email}</p>
                  {/* <p className="text-xs text-gray-400 mt-2 font-mono">ID: {booking.customer.id}</p> */}
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <User className="text-green-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Car Owner</h3>
                  <p className="font-bold text-gray-800 mt-2">{booking.carOwner.fullName}</p>
                  <p className="text-sm text-gray-600 mt-1">{booking.carOwner.email}</p>
                  {/* <p className="text-xs text-gray-400 mt-2 font-mono">ID: {booking.carOwner.id}</p> */}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Calendar className="text-purple-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rental Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-semibold">START DATE</p>
                    <p className="font-bold text-gray-800 mt-1">{formatDateWithTime(booking.startDate)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-semibold">END DATE</p>
                    <p className="font-bold text-gray-800 mt-1">{formatDateWithTime(booking.endDate)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <Clock size={16} className="text-blue-600" />
                  <p className="text-sm text-gray-700">
                    Total Duration: <span className="font-bold text-blue-600">{calculateDuration()} days</span>
                  </p>
                </div>
              </div>
            </div>
          </div>


          <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <DollarSign className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">₹{booking.totalPrice}</p>
                <p className="text-sm text-gray-600 mt-1">Total amount paid</p>
              </div>
            </div>
          </div>


          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Clock className="text-gray-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Booking Created</h3>
                <p className="font-bold text-gray-800 mt-2">{formatDateWithTime(booking.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>


        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-3">
          <LoadingButton
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-blue-400 text-gray-700 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Close
          </LoadingButton>
         
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;