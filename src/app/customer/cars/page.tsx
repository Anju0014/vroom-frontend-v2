'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { Car } from '@/types/authTypes';
import { AuthService } from '@/services/customer/authService'; 
import { getReverseGeocode } from '@/services/common/mapService'
import Pagination from '@/components/pagination';
import { useSearchParams } from 'next/navigation';
import LoadingButton from '@/components/common/LoadingButton';

const AllCarsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [totalCars, setTotalCars] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: Infinity });
  const [carType,setCarType]=useState<string>('')
  const [location, setLocation] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const itemsPerPage = 5; 
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  useEffect(() => {
    const loc = searchParams.get('location') || '';
    const start = searchParams.get('startDate') || '';
    const end = searchParams.get('endDate') || '';

    setLocation(loc);
    setStartDate(start);
    setEndDate(end);
    setFiltersLoaded(true)
  }, [searchParams]);

  useEffect(() => {
     if (!filtersLoaded) return;
    const fetchCars = async () => {
      try {
        setLoading(true);
        console.log("sending details", searchTerm,carType,location)
        const response = await AuthService.getAllCars(currentPage, itemsPerPage, {
          search: searchTerm,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          carType,
          location,
          startDate,
          endDate,
          
        //   latitude: coordinates?.lat,
        //   longitude: coordinates?.lng,
        });
        console.log('All cars response:', response);
        // const verifiedCars = response.data
        //   .filter((car: Car) => car.verifyStatus === 1 && !car.isDeleted)
        //   .map((car: Car) => ({
        //     ...car,
        //     location: { address: car.location?.address || 'No address' },
        //   }));
        setCars(response.data);
        setTotalCars(response.total || 0);
      } catch (error) {
        console.error('Error fetching cars:', error);
        setError('Failed to load cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [currentPage, searchTerm, priceRange,carType,location,startDate,endDate,filtersLoaded]);

  const today = new Date().toISOString().split("T")[0];

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalCars / itemsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  const viewDetailsNow = (carId: string) => {
    router.push(`/cars/${carId}`);
  };

  const handlePriceFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({
      ...prev,
      [name]: value === '' ? (name === 'min' ? 0 : Infinity) : Number(value),
    }));
    setCurrentPage(1);
  };


  return (
    <>
      <Head>
        <title>All Cars | Car Management System</title>
        <meta name="description" content="Browse all available cars for rent" />
      </Head>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-semibold mb-6">All Available Cars</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="pl-10 pr-4 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by car name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-4">
              <input
                type="number"
                name="min"
                className="px-4 py-2 border rounded w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min price"
                value={priceRange.min === 0 ? '' : priceRange.min}
                onChange={handlePriceFilterChange}
              />
              <input
                type="number"
                name="max"
                className="px-4 py-2 border rounded w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max price"
                value={priceRange.max === Infinity ? '' : priceRange.max}
                onChange={handlePriceFilterChange}
              />
            </div>

            <div className="flex gap-4">
  {/* Car Type Dropdown */}
  <select
    value={carType}
    onChange={(e) => {
      setCarType(e.target.value);
      setCurrentPage(1);
    }}
    className="px-4 py-2 border rounded w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">All Types</option>
    <option value="Sedan">Sedan</option>
    <option value="SUV">SUV</option>
    <option value="Hatchback">Hatchback</option>
    <option value="VAN/MPV">VAN/MPV</option>
  </select>


  <input
    type="text"
    placeholder="Search by location..."
    value={location}
    onChange={(e) => {
      setLocation(e.target.value);
      setCurrentPage(1);
    }}
    className="px-4 py-2 border rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

<div className="flex gap-4">
  <input
    type="date"
    min={today}
    className="px-4 py-2 border rounded w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={startDate}
    onChange={(e) => {
      setStartDate(e.target.value);
      setCurrentPage(1);
    }}
  />

  <input
    type="date"
    min={startDate||today}
    className="px-4 py-2 border rounded w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={endDate}
    onChange={(e) => {
      setEndDate(e.target.value);
      setCurrentPage(1);
    }}
  />
</div>


            {/* <div className="relative w-full md:w-64">
              <input
                type="text"
                className="pl-4 pr-10 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location..."
                value={location}
                onChange={handleLocationChange}
                disabled={loadingLocation}
              />
              {loadingLocation && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div> */}
          </div>
          {loading ? (
            <div className="text-center py-10">
               <div className="flex items-center justify-center h-20">
      <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
              <p>Loading cars...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.length > 0 ? (
                  cars.map((car) => (
                    <div key={car._id || car.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-48 bg-gray-200 relative">
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
                        <LoadingButton
                          onClick={() => viewDetailsNow(car._id || car.id!)}
                          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </LoadingButton>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    No cars found matching your criteria.
                  </div>
                )}
              </div>
             {cars.length > 0 && (
  <div className="mt-6 flex justify-center">
    <Pagination
      currentPage={currentPage}
      totalPages={Math.ceil(totalCars / itemsPerPage)}
      onPageChange={handlePageChange}
    />
  </div>
)}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AllCarsPage;