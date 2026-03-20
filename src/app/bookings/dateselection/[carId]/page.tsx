
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Modal from '@/components/common/Modal';
import { AuthService } from '@/services/customer/authService';
import { format, isWithinInterval, differenceInCalendarDays, addDays, isSameDay } from 'date-fns';
import { CarFront } from 'lucide-react';
import { useAuthStore } from '@/store/customer/authStore';
import { Location, Car, Booking, DateRange } from '@/types/bookTypes';
import InputField from '@/components/InputField';
import Stepper from '@/components/common/StepperBooking';
import LoadingButton from '@/components/common/LoadingButton';

const DateSelectionPage = () => {
  const router = useRouter();
  const params = useParams();
  const carId = params?.carId as string;
  const { data: session, status } = useSession();
  const { user, accessToken } = useAuthStore();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingDays, setBookingDays] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [unavailableDates, setUnAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!carId || carId === 'null') {
          setError('Invalid car ID. Please select a car first.');
          setLoading(false);
          return;
        }

        const carData = await AuthService.findCarDetails(carId);
        if (!carData) {
          setError('Car not found.');
          setLoading(false);
          return;
        }
        setCar(carData);
        setUnAvailableDates(carData.unavailableDates.map((date: string) => new Date(date)));

        const bookingData = await AuthService.findBookingDetails(carId);
        if (Array.isArray(bookingData.data)) {
          const formattedBookings = bookingData.data.map((booking: any) => ({
            ...booking,
            startDate: new Date(booking.start),
            endDate: new Date(booking.end),
          }));
          setExistingBookings(formattedBookings);
        } else {
          setExistingBookings([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [carId]);


  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const formatDateForInput = (date: Date | null) => {
    return date ? date.toISOString().split('T')[0] : '';
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setValidationError(null);
    const date = value ? new Date(value) : null;

    if (date && !isNaN(date.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isSameDay(date, today) || date < today) {
        setValidationError(`${field === 'startDate' ? 'Start' : 'End'} date cannot be today or in the past.`);
        return;
      }

      const newRange = { ...dateRange };

      if (field === 'startDate') {
        newRange.startDate = date;
        if (newRange.endDate && newRange.endDate < date) {
          newRange.endDate = null;
          setValidationError('End date must be after start date. Please select a new end date.');
        }
      } else if (field === 'endDate') {
        if (!newRange.startDate) {
          setValidationError('Please select a start date first.');
          return;
        }
        if (date < newRange.startDate) {
          setValidationError('End date cannot be before start date.');
          return;
        }
        newRange.endDate = date;
      }

      setDateRange(newRange);

      if (newRange.startDate && newRange.endDate) {
        const days = differenceInCalendarDays(newRange.endDate, newRange.startDate) + 1;
        setBookingDays(days > 0 ? days : 0);
        setTotalPrice(car ? days * parseInt(car.expectedWage || '0') : 0);
      } else {
        setBookingDays(0);
        setTotalPrice(0);
      }
    }
  };
const isDateRangeUnavailable = (startDate: Date, endDate: Date): boolean => {
  if (!car) return true;
  const now = new Date();

  for (let currentDay = new Date(startDate); currentDay <= endDate; currentDay = addDays(currentDay, 1)) {
    const booked = existingBookings.some((booking) => {
      // locked = pending booking with still-active lock
      const locked =
        booking.status === 'pending' &&
        booking.lockedUntil &&
        new Date(booking.lockedUntil) > now;
      const confirmed = booking.status === 'confirmed';

      const overlap = isWithinInterval(currentDay, {
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });

      return (locked || confirmed) && overlap;
    });

    const blocked = unavailableDates.some((unavDate) => isSameDay(unavDate, currentDay));

    if (booked || blocked) {
      return true;
    }
  }

  return false;
};

  const checkAvailability = async () => {
  setValidationError(null);

  // All your existing validations stay the same
  if (!dateRange.startDate || !dateRange.endDate) {
    setValidationError('Please select both start and end dates');
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (
    isSameDay(dateRange.startDate, today) || dateRange.startDate < today ||
    isSameDay(dateRange.endDate, today) || dateRange.endDate < today
  ) {
    setValidationError('Both start and end dates must be after today');
    return false;
  }

  if (dateRange.endDate < dateRange.startDate) {
    setValidationError('End date must be after start date');
    return false;
  }

  const daysDiff = differenceInCalendarDays(dateRange.endDate, dateRange.startDate) + 1;
  if (daysDiff !== bookingDays) {
    setValidationError('Please select consecutive dates only');
    return false;
  }


  if (isDateRangeUnavailable(dateRange.startDate, dateRange.endDate)) {
    setValidationError('One or more selected dates are unavailable');
    return false;
  }

  
  try {
    console.log("sending tt request")
   const response = await AuthService.checkBookingAvailability(
  carId,
  dateRange.startDate!.toISOString(),
  dateRange.endDate!.toISOString()
);

    if (!response.available) {
      setValidationError('Sorry, this car is temporarily locked or already booked for selected dates.');
      return false;
    }
  } catch (error) {
    console.log('Availability check error:', error);
    setValidationError('Failed to check availability. Please try again.');
    return false;
  }

  // Passed all checks
  setCurrentStep(2);
  return true;
};

  const handleProceed = async () => {
    const isAuthenticated = status === 'authenticated' || (!!user && !!accessToken);
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!user) {
    console.error("User is null");
    return;
  }
  if (!car) {
    console.error("Car is null");
    return;
  }
  if (!car?.owner) {
  console.error("Car owner id is missing");
  return;
}

  if (!dateRange.startDate || !dateRange.endDate) {
    console.error("Missing dates");
    return;
  }


 const ok = await checkAvailability();
    if (ok) {
     const bookingData = {
      carId,
      userId: session?.user?.id || user.id,
      carOwnerId: car.owner, 
      startDate: dateRange.startDate?.toISOString(),
      endDate: dateRange.endDate?.toISOString(),
      totalPrice,
    };

    const bookingResponse = await AuthService.createPendingBooking(bookingData);
     router.push(
      `/bookings/agreement/${carId}?startDate=${dateRange.startDate?.toISOString()}&endDate=${dateRange.endDate?.toISOString()}&totalPrice=${totalPrice}&bookingId=${bookingResponse.bookingId}`
    );
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    router.push('/login');
  };

  if (loading) return <div className="flex justify-center items-center h-screen"> 
  <div className="flex items-center justify-center h-20">
      <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
    </div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!car) return <div className="text-center p-8">Car not found</div>;

  const steps = ['Check Availability', 'Select Dates', 'Agreement', 'Payment'];

  return (
    <div className="bg-gradient-to-b from-blue-200 to-yellow-200 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Stepper steps={steps} currentStep={currentStep} />
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6">Select Booking Dates for {car.carName}</h2>

          {validationError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{validationError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="space-y-4">
                <InputField
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={formatDateForInput(dateRange.startDate)}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  min={formatDateForInput(getTomorrow())}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">Select a date after today</p>

                <InputField
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={formatDateForInput(dateRange.endDate)}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  min={dateRange.startDate ? formatDateForInput(dateRange.startDate) : formatDateForInput(getTomorrow())}
                  disabled={!dateRange.startDate}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">Select a date after the start date</p>

                <div className="pt-4">
                  <button
                    onClick={checkAvailability}
                    className="w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-indigo-500 text-white hover:bg-indigo-600 shadow-md"
                  >
                    Check Availability and book the ride
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-700 mb-4">Booking Summary</h3>
              <p><strong>Car:</strong> {car.carName}</p>
              <p><strong>Brand:</strong> {car.brand}</p>
              <p><strong>Daily Rate:</strong> ₹{car.expectedWage}</p>
              <p><strong>Location:</strong> {car.location?.address || 'Not specified'}</p>
              {dateRange.startDate && dateRange.endDate && (
                <>
                  <p><strong>Start Date:</strong> {format(dateRange.startDate, 'MMM dd, yyyy')}</p>
                  <p><strong>End Date:</strong> {format(dateRange.endDate, 'MMM dd, yyyy')}</p>
                  <p><strong>Duration:</strong> {bookingDays} day{bookingDays > 1 ? 's' : ''}</p>
                  <p><strong>Total Price:</strong> ₹{totalPrice}</p>
                </>
              )}
              <LoadingButton
                onClick={handleProceed}
                disabled={currentStep < 2}
                className={`w-full mt-4 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  currentStep >= 2
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed to Agreement
              </LoadingButton>
              {currentStep < 2 && (
                <p className="text-xs text-gray-500 text-center mt-2">Please check availability first</p>
              )}
            </div>
          </div>
        </div>

        <Modal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onAgree={handleLoginRedirect}
          title="Authentication Required"
        >
          <p className="text-gray-700">
            You must be signed in to proceed with booking. Please log in or sign up.
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default DateSelectionPage;