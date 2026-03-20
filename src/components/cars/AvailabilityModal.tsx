
import React, { useState, useEffect } from 'react';
import { X, Calendar, Info, CheckCircle, XCircle } from 'lucide-react';
import { Car,Booking,AvailabilityModalProps } from '@/types/miniTypes';
import LoadingButton from '../common/LoadingButton';


const AvailabilityModal: React.FC<AvailabilityModalProps> = ({ 
  isOpen, 
  car, 
  bookings, 
  onClose, 
  onUpdate 
}) => {
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  
  const toLocalDateString = (date: string | Date): string => {
    const d = new Date(date);
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };


  const createLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); 
  };


  useEffect(() => {
    if (isOpen) {
      const localUnavailableDates = (car.unavailableDates || []).map(date => toLocalDateString(date));
      setUnavailableDates(localUnavailableDates);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, car.unavailableDates]);

  const bookedDatesSet = new Set<string>();
  bookings.forEach(booking => {
    if (booking.status === 'confirmed') {
      const startDate = toLocalDateString(booking.startDate);
      const endDate = toLocalDateString(booking.endDate);
      
      let current = createLocalDate(startDate);
      const end = createLocalDate(endDate);
      
  
      while (current <= end) {
        bookedDatesSet.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    }
  });

  const handleDateClick = (dateStr: string) => {
    if (bookedDatesSet.has(dateStr)) {
      setError('Cannot modify availability for dates with confirmed bookings.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setError(null);
    setSuccess(null);

    if (unavailableDates.includes(dateStr)) {
      setUnavailableDates(prev => prev.filter(d => d !== dateStr));
    } else {
      setUnavailableDates(prev => [...prev, dateStr]);
    }
  };

  const getDayStatus = (dateStr: string) => {
    if (bookedDatesSet.has(dateStr)) return 'booked';
    if (unavailableDates.includes(dateStr)) return 'unavailable';
    return 'available';
  };

  const getDayClassName = (dateStr: string) => {
    const status = getDayStatus(dateStr);
    const baseClasses = 'w-8 h-8 flex items-center justify-center text-sm rounded cursor-pointer transition-colors';
    
    switch (status) {
      case 'booked':
        return `${baseClasses} bg-red-500 text-white cursor-not-allowed`;
      case 'unavailable':
        return `${baseClasses} bg-orange-500 text-white hover:bg-orange-600`;
      case 'available':
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`;
      default:
        return baseClasses;
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

  
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isPast = date < today;

      days.push(
        <div
          key={day}
          className={`${getDayClassName(dateStr)} ${isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !isPast && handleDateClick(dateStr)}
          title={
            isPast 
              ? 'Past date' 
              : bookedDatesSet.has(dateStr) 
                ? 'Booked - cannot modify' 
                : unavailableDates.includes(dateStr) 
                  ? 'Click to make available' 
                  : 'Click to make unavailable'
          }
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert local date strings to ISO strings for storage
      const isoUnavailableDates = unavailableDates.map(dateStr => 
        new Date(dateStr + 'T00:00:00').toISOString()
      );
      
      await onUpdate(isoUnavailableDates.sort());
      setSuccess('Availability updated successfully!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to update availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Manage Availability</h2>
            <p className="text-sm text-gray-600 mt-1">{car.carName}</p>
          </div>
          <LoadingButton
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </LoadingButton>
        </div>

      
        <div className="p-6">
  
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span>Booked</span>
              </div>
            </div>
          </div>

        
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <XCircle size={16} className="text-red-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}

          {/* Calendar */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <LoadingButton
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isLoading}
              >
                ←
              </LoadingButton>
              <h3 className="font-medium">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <LoadingButton
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isLoading}
              >
                →
              </LoadingButton>
            </div>


            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>


            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>


          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div>Unavailable days: {unavailableDates.length}</div>
            </div>
          </div>
        </div>


        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <LoadingButton
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal