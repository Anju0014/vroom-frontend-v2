"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Modal from '@/components/common/Modal';
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { AuthService } from '@/services/customer/authService';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/customer/authStore';
import LocationMapView from '@/components/maps/LocationMapView';
import LoadingButton from '@/components/common/LoadingButton';
import { BookingDetail, CarDetail } from '@/types/carTypes';


const CarBookingPage = () => {
  const router = useRouter();
  const params = useParams();
  const carId = params?.carId as string;
  const { user, accessToken } = useAuthStore();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [existingBookings, setExistingBookings] = useState<BookingDetail[]>([]);
 const [showLoginModal, setShowLoginModal] = useState(false);
  const { data: session, status } = useSession();
  const [carUnavailableDates, setCarUnavailableDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        setLoading(true);
        if (!carId || carId === 'null') {
          setError('Invalid car ID');
          setLoading(false);
          return;
        }
        const carData = await AuthService.findCarDetails(carId);
        setCar(carData);

        if (Array.isArray(carData.unavailableDates)) {
        const normalized = carData.unavailableDates.map(
          (d: string) => startOfDay(new Date(d))
        );
        setCarUnavailableDates(normalized);
      } else {
        setCarUnavailableDates([]);
      }
        console.log("unavailable",carData.unavailableDates)
        setLoading(false);
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError('Failed to load car data. Please try again later.');
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        if (!carId || carId === 'null') {
          setExistingBookings([]);
          return;
        }

        const bookingData = await AuthService.findBookingDetails(carId);
        console.log("BOOKINGdAT", bookingData);

        if (Array.isArray(bookingData.data)) {
          const formattedBookings = bookingData.data.map((booking: any) => {
            const startDate = new Date(booking.start);
            const endDate = new Date(booking.end);
            return {
              ...booking,
              startDate: startOfDay(startDate),
              endDate: startOfDay(endDate),
            };
          });
          setExistingBookings(formattedBookings);
          console.log("Formatted Bookings:", formattedBookings);
        } else {
          setExistingBookings([]);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setExistingBookings([]);
      } 
    };

    fetchCarData();
    fetchBookings();
  }, [carId]);


  

  const isDateUnavailable = (date: Date): boolean => {
    if (!car || !car.available) return true;

    const normalizedDate = startOfDay(date);
    
    if (carUnavailableDates.some((d) => isSameDay(normalizedDate, d))) {
    return true;
  }

    return existingBookings.some(booking => {
      const start = startOfDay(booking.startDate);
      const end = endOfDay(booking.endDate);

      const isUnavailable =
        isSameDay(normalizedDate, start) ||
        isSameDay(normalizedDate, end) ||
        (normalizedDate >= start && normalizedDate <= end);

      if (['2025-04-25', '2025-04-26', '2025-05-01'].includes(format(normalizedDate, 'yyyy-MM-dd'))) {
        console.log(`Checking ${format(normalizedDate, 'yyyy-MM-dd')}:`, {
          bookingStart: start,
          bookingEnd: end,
          isUnavailable,
        });
      }

      return isUnavailable;
    });
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    if (date < new Date()) return 'unavailable-date';
    if (isDateUnavailable(date)) return 'unavailable-date';
    return 'available-date';
  };

  const handleCheckAvailability = () => {
    if (!carId || carId === 'null') {
      alert('Invalid car ID');
      return;
    }
    const isNextAuthUser = status === 'authenticated';
    const isZustandUser = !!user && !!accessToken;
    const isAuthenticated = isNextAuthUser || isZustandUser;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    router.push(`/bookings/dateselection/${carId}`);
  };

  const handleModalClose = () => {
    setShowLoginModal(false);
  };

  const handleImageChange = (index: number) => {
    setActiveImageIndex(index);
    setShowVideo(false);
  };

  const handleVideoToggle = () => {
    setShowVideo(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    router.push('/login');
  };

const coordinates = car?.location?.coordinates?.coordinates;

const lat = coordinates?.[1];
const lng = coordinates?.[0];


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-8 font-semibold">{error}</div>;
  if (!car) return <div className="text-center p-8 font-semibold">Car not found</div>;

  return (
    <div className="bg-gradient-to-b from-blue-100 to-yellow-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">{car.carName}</h1>
          <div className="flex flex-wrap gap-3 mb-2">
            <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-medium">{car.brand}</span>
            <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-medium">{car.year}</span>
            <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-medium">{car.fuelType}</span>
            {car.location?.city && (
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 inline-block mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {car.location.city}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden h-96 relative">
            {showVideo && car.videos && car.videos.length > 0 ? (
              <video src={car.videos[0]} controls className="w-full h-full object-contain" />
            ) : car.images && car.images.length > 0 ? (
              <div className="relative w-full h-full">
                <Image
                  src={car.images[activeImageIndex] || '/placeholder.jpg'}
                  alt={car.carName}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>No images available</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              {car.images &&
                car.images.map((image, index) => (
                  <div
                    key={index}
                    className={`h-24 cursor-pointer rounded-lg overflow-hidden ${
                      index === activeImageIndex && !showVideo ? 'ring-4 ring-blue-600' : 'ring-2 ring-blue-50'
                    }`}
                    onClick={() => handleImageChange(index)}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={image}
                        alt={`${car.carName} view ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 33vw, 100px"
                        className="object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                ))}
            </div>

            {car.videos && car.videos.length > 0 && (
              <div>
                <div
                  className={`h-24 cursor-pointer rounded-lg overflow-hidden relative ${
                    showVideo ? 'ring-4 ring-blue-600' : 'ring-2 ring-blue-50'
                  }`}
                  onClick={handleVideoToggle}
                >
                  <div className="relative w-full h-full bg-blue-50">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-600 to-yellow-400 text-white p-6 rounded-xl shadow-md mt-auto">
              <h3 className="text-lg font-medium mb-1">Daily Rate</h3>
              <p className="text-3xl font-bold">
                ₹{car.expectedWage}
                <span className="text-sm opacity-80 font-normal">/day</span>
              </p>
            </div>
          </div>
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-6 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Car Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="text-sm text-blue-600 font-medium">Brand</h3>
                  <p className="font-semibold text-lg text-gray-800">{car.brand}</p>
                </div>
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="text-sm text-blue-600 font-medium">Year</h3>
                  <p className="font-semibold text-lg text-gray-800">{car.year}</p>
                </div>
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="text-sm text-blue-600 font-medium">Fuel Type</h3>
                  <p className="font-semibold text-lg text-gray-800">{car.fuelType}</p>
                </div>
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="text-sm text-blue-600 font-medium">RC Book Number</h3>
                  <p className="font-semibold text-lg text-gray-800">{car.rcBookNo}</p>
                </div>
              </div>


              {car.location?.coordinates && (
  <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-6">
    <h3 className="text-sm text-blue-600 font-medium mb-2">
      Pickup Location
    </h3>

    <p className="font-semibold text-gray-800 mb-3">
      {car.location.address}
      {car.location.city && `, ${car.location.city}`}
      {car.location.state && `, ${car.location.state}`}
   
    </p>

    <div className="h-64 w-full rounded-lg overflow-hidden border">
      
      {typeof lat === "number" && typeof lng === "number" && (
        
  <LocationMapView lat={lat} lng={lng} />
)}

    </div>
  </div>
)}


              <div
                className={`p-5 rounded-xl flex items-center ${
                  car.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                {car.available ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-500 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-green-800">Currently Available</h3>
                      <p className="text-green-600 text-sm">This car is ready to book</p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-red-500 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-red-800">Not Available</h3>
                      <p className="text-red-600 text-sm">This car cannot be booked at the moment</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl  shadow-md p-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Availability Calendar
            </h2>

            <div className="mb-6">
              <Calendar
  onChange={() => {}}
  value={null}
  minDate={new Date()}
  tileClassName={tileClassName}
  tileDisabled={({ view }) => view === "month"} 
/>

              <style jsx global>{`
                .react-calendar {
                  font-family: system-ui, -apple-system, sans-serif;
                  border: none;
                  border-radius: 0.75rem;
                  overflow: hidden;
                }
                .react-calendar__navigation {
                  background-color: #1e40af;
                  color: white;
                  margin-bottom: 0;
                  height: 48px;
                }
                .react-calendar__navigation button {
                  color: white;
                  font-weight: 600;
                  font-size: 1rem;
                }
                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                  background-color: rgba(255, 255, 255, 0.1);
                }
                .react-calendar__month-view__weekdays {
                  background-color: #e0f2ff;
                  font-weight: 600;
                  color: #1e40af;
                  text-transform: uppercase;
                  font-size: 0.75rem;
                }
                .react-calendar__tile {
                  padding: 0.75rem 0.5rem;
                  font-weight: 500;
                  border-radius: 0.375rem;
                  cursor: default;
                }
                .react-calendar__tile--now {
                  background-color: #e0f7ff;
                  color: #007bff;
                }
                .react-calendar__tile--now:enabled:hover,
                .react-calendar__tile--now:enabled:focus {
                  background-color: #cceeff;
                }
                .available-date {
                  background-color: #f0fdf4 !important;
                  color: #166534 !important;
                }
                .unavailable-date {
                  background-color: #fef2f2 !important;
                  color: #dc2626 !important;
                }
                .react-calendar__tile--active,
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                  background-color: transparent;
                  color: inherit;
                }
                .react-calendar__navigation button:disabled {
                    background-color: #1e3a8a; 
                    color: #c7d2fe;           
                    opacity: 1;               
                    cursor: not-allowed;
                  }

              `}</style>
            </div>

            <LoadingButton
              onClick={handleCheckAvailability}
              className="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-brand-orange to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 shadow-lg hover:shadow-xl"
            >
              Book Your Ride
            </LoadingButton>
          </div>
        </div>
        

        <Modal
          isOpen={showLoginModal}
          onClose={handleModalClose}
          onAgree={handleLoginRedirect}
          title="Authentication Required"
        >
          <p className="text-gray-700">You must be signed in to proceed with booking. Please log in or sign up.</p>
        </Modal>
      </div>
    </div>
  );
};

export default CarBookingPage;

