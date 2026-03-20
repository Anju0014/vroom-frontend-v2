
'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { FaPlus, FaPencilAlt, FaTrashAlt, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import AddNewCarModal from '@/components/cars/addcar';
import AgreementModal from '@/components/carOwner/dashboard/Agreement Modal';
import AvailabilityModal from '@/components/cars/AvailabilityModal';
import { Car, CarFormData } from '@/types/authTypes';
import { Booking } from '@/types/carTypes';
import { OwnerAuthService } from '@/services/carOwner/authService';
import DeleteCarModal from '@/components/cars/deletecar';
import EditCarModal from '@/components/cars/editcar';
import { transformGeoCoordinates } from '@/utils/transformGeoCoordinates';
import Pagination from '@/components/pagination';
import LiveLocationModal from '@/components/carOwner/dashboard/LiveLocationModal';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import LoadingButton from '@/components/common/LoadingButton';


const YourCarsPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAgreementOpen, setIsAgreementOpen] = useState<boolean>(false);
  const [isAddCarOpen, setIsAddCarOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [bookings, setBookings] = useState<{ [carId: string]: Booking[] }>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCars, setTotalCars] = useState<number>(0);
  const itemsPerPage = 5; // Adjust as needed, e.g., 9 for 3x3 grid
  const [isLiveLocationOpen, setIsLiveLocationOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [defLocation, setDefLocation] = useState<{ lat: number; lng: number } | null>(null);
  const router=useRouter()


  useEffect(() => {
  const fetchCars = async () => 
    {
    try {
      setLoading(true);

      const data = await OwnerAuthService.getCars(currentPage, itemsPerPage);
      const formattedCars = (data.cars || []).map(transformGeoCoordinates);

      const carsWithBookingStatus = await Promise.all(
  formattedCars.map(async (car: Car) => {
    try {
      const carId = car._id ?? car.id;

      if (!carId) {
        return {
          ...car,
          hasBookingToday: false,
        };
      }

      const booking = await OwnerAuthService.getActiveBookingForCar(
        carId.toString()
      );

      return {
        ...car,
        hasBookingToday: !!booking,
      };
    } catch {
      return {
        ...car,
        hasBookingToday: false,
      };
    }
  })
);

    

      setCars(carsWithBookingStatus);
      setTotalCars(data.total || 0);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  fetchCars();
}, [currentPage]);


  const totalPages = Math.ceil(totalCars / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAddCarClick = () => {
    setIsAgreementOpen(true);
  };

  const handleAgree = () => {
    setIsAgreementOpen(false);
    setIsAddCarOpen(true);
  };

  const handleEditCar = (carId: string) => {
    const car = cars.find(car => car._id === carId || car.id === carId);
    if (car) {
      setSelectedCar(car);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteCar = (carId: string) => {
    const car = cars.find(car => car._id === carId || car.id === carId);
    if (car) {
      setSelectedCar(car);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedCar) {
      try {
        const carId = selectedCar._id ?? selectedCar.id;
        if (!carId) throw new Error('Missing car ID');
        await OwnerAuthService.deleteCar(carId);
        setCars(cars.filter(car => (car._id || car.id) !== carId));
        setTotalCars(prev => prev - 1); // Update total after delete
        setIsDeleteModalOpen(false);
        setSelectedCar(null);
      } catch (error) {
        console.error('Error deleting car:', error);
        setError('Failed to delete car');
      }
    }
  };

  const handleUpdateCar = async (updatedCarData: CarFormData) => {
    if (selectedCar) {
      try {
        const carId = selectedCar._id ?? selectedCar.id;
        if (!carId) throw new Error('Missing car ID');
        await OwnerAuthService.updateCar(carId, updatedCarData);
        setCars(cars.map(car => {
          if ((car._id || car.id) === carId) {
            return { ...car, ...updatedCarData, unavailableDates: car.unavailableDates };
          }
          return car;
        }));
        setIsEditModalOpen(false);
        setSelectedCar(null);
      } catch (error) {
        console.error('Error updating car:', error);
        setError('Failed to update car');
      }
    }
  };


const handleUpdateAvailability = async (carId: string | undefined, newUnavailableDates: string[]) => {
  if (!carId) return;
  try {
    
    await OwnerAuthService.updateCarAvailability(carId, { unavailableDates: newUnavailableDates });
    
    setCars(prevCars =>
      prevCars.map(car =>
        (car._id || car.id) === carId ? { ...car, unavailableDates: newUnavailableDates } : car
      )
    );
    setIsAvailabilityModalOpen(false);
    setSelectedCar(null);
  } catch (error) {
    console.error('Error updating availability:', error);
    setError('Failed to update availability');
  }
};

const handleViewLiveLocation = async (carId: string) => {
  try {
    
    const activeBooking = await OwnerAuthService.getActiveBookingForCar(carId);
    if (!activeBooking) {
      toast.error("No active booking for this car right now.");
      return;
    }
    console.log("active",activeBooking)
    setSelectedBookingId(activeBooking.id);
    if (activeBooking.currentLocation) {
      setDefLocation(activeBooking.currentLocation); 
    }
    console.log(selectedBookingId)
    setIsLiveLocationOpen(true);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch booking info.");
  }
};


const handleAvailabilityClick = async (carId: string) => {
  const car = cars.find(car => car._id === carId || car.id === carId);
  if (car) {
    try {
      const bookingsResponse = await OwnerAuthService.getBookingsForCar(carId);
      console.log("bookingsResponse", bookingsResponse)
      
      setBookings(prev => ({
        ...prev,
        [carId]: bookingsResponse.data.map((booking: any) => ({
          id: booking._id,
          bookingId: booking.bookingId,
          carId: booking.carId,
          userId: booking.userId,
          carOwnerId: booking.carOwnerId,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice,
          status: booking.status,
          paymentIntentId: booking.paymentIntentId,
          paymentMethod: booking.paymentMethod,
          cancellationFee: booking.cancellationFee,
          refundedAmount: booking.refundedAmount,
          cancelledAt: booking.cancelledAt,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        })),
      }));
      setSelectedCar(car);
      setIsAvailabilityModalOpen(true);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
    }
  }
};
  return (
    <>
      <Head>
        <title>Your Cars | Car Management System</title>
        <meta name="description" content="Manage your car fleet" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold">Your Cars</h1>
            <div className="flex space-x-4">
              <LoadingButton
                className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center hover:bg-gray-700 transition-colors"
                onClick={handleAddCarClick}
              >
                <FaPlus className="mr-2" /> Add New Car
              </LoadingButton>
            </div>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {loading ? (
            <div className="text-center py-10">
               <div className="flex items-center justify-center h-20">
      <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
              <p>Loading your cars...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.length > 0 ? (
                cars.map((car) => {
                  const carId = car._id || car.id;
                  return (
                    <div key={carId} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-48 bg-gray-200 relative">
                   
                        <div className="absolute top-2 left-2 z-10">
                          {car.verifyStatus === 1 ? (
                            <span className="bg-green-500 text-white text-xs py-1 px-2 rounded-full flex items-center">
                              <FaCheckCircle className="mr-1" /> Verified
                            </span>
                          ) : car.verifyStatus === -1 ? (
                            <span className="bg-red-500 text-white text-xs py-1 px-2 rounded-full flex items-center">
                              <FaTimesCircle className="mr-1" /> Rejected
                            </span>
                          ) : (
                            <span className="bg-yellow-500 text-white text-xs py-1 px-2 rounded-full flex items-center">
                              <FaClock className="mr-1" /> Pending
                            </span>
                          )}
                        </div>

                 
                        <div className="absolute top-2 right-2 z-10 flex space-x-2">
                          {carId && (
                            <>
                              <LoadingButton
                                onClick={() => handleEditCar(carId)}
                                className="bg-white p-2 rounded-full shadow-md hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <FaPencilAlt className="text-blue-600" size={14} />
                              </LoadingButton>
                              <LoadingButton
                                onClick={() => handleAvailabilityClick(carId)}
                                className="bg-white p-2 rounded-full shadow-md hover:bg-green-50 transition-colors"
                                title="Manage Availability"
                              >
                                <Calendar className="text-green-600" size={14} />
                              </LoadingButton>
                              <LoadingButton
                                onClick={() => handleDeleteCar(carId)}
                                className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <FaTrashAlt className="text-red-600" size={14} />
                              </LoadingButton>
                            </>
                          )}
                        </div>

                        {car.images && car.images.length > 0 ? (
                          <Image
                            src={car.images[0]}
                            alt={car.carName}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'cover' }}
                            priority
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            No Image Available
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{car.carName}</h3>
                        <p className="text-gray-600">{car.brand} • {car.year}</p>
                        <div className="mt-2 flex justify-between">
                          <span className="text-sm">{car.fuelType}</span>
                          <span className="font-medium">₹{car.expectedWage}/day</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{car.location.address}</p>

                        {car.verifyStatus === 0 && (
                          <div className="mt-3 flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                            <span className="text-xs text-blue-700 flex items-center">
                              <FaClock className="mr-1" size={12} />
                              Awaiting verification
                            </span>
                            <LoadingButton
                              onClick={() => router.push(`/carOwner/carVerification/${carId}`)}
                              className="text-xs bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors"
                            >
                              Join Call
                            </LoadingButton>
                          </div>
                        )}

                     
                        {car.verifyStatus === -1 && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-xs text-red-700">
                              Verification rejected. Please update car details and resubmit.
                            </p>
                          </div>
                        )}
                        {car.hasBookingToday && (
                        <LoadingButton
                          onClick={() => handleViewLiveLocation(car._id!)}
                          className="mt-3 w-full bg-white border border-gray-300 p-2 rounded hover:bg-gray-50 transition-colors text-sm"
                        >
                           View Live Location
                        </LoadingButton>
)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  No cars added yet. Click "Add New Car" to get started.
                </div>
              )}
               
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>

      <AgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        onAgree={handleAgree}
      />

      <AddNewCarModal
        isOpen={isAddCarOpen}
        onClose={() => setIsAddCarOpen(false)}
        onCarAdded={(newCar: Car) => {
          setCars([newCar, ...cars]);
          setTotalCars(prev => prev + 1); 
        }}
      />

      {selectedBookingId && (
  <LiveLocationModal
    isOpen={isLiveLocationOpen}
    onClose={() => setIsLiveLocationOpen(false)}
    bookingId={selectedBookingId}
    // initialLocation={defLocation}
  />
)}

      {selectedCar && (
        <>
          <DeleteCarModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedCar(null);
            }}
            onConfirm={handleConfirmDelete}
            carName={selectedCar.carName}
          />
          <EditCarModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCar(null);
            }}
            car={selectedCar}
            onUpdateCar={handleUpdateCar}
          />
          <AvailabilityModal
            isOpen={isAvailabilityModalOpen}
            car={selectedCar}
            bookings={bookings[selectedCar._id || selectedCar.id!] || []}
            onClose={() => {
              setIsAvailabilityModalOpen(false);
              setSelectedCar(null);
            }}
            onUpdate={(newUnavailableDates) =>
              handleUpdateAvailability(selectedCar._id || selectedCar.id, newUnavailableDates)
            }
          />

        </>

        
      )}
    </>
  );
};

export default YourCarsPage;

