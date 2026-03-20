

'use client';

import React, { useCallback, useEffect, useState } from "react";
import { Table, TableColumn } from "@/components/admin/Table"; 
import { AdminAuthService } from "@/services/admin/adminService";
import toast from "react-hot-toast";
import CarVerifyModal from "@/components/admin/CarVerifyModal";
import { Car, CarVerifyProps } from '@/types/carTypes';
import Pagination from "@/components/pagination";
import { useDebounce } from "@/hooks/useDebounce";

const CarVerifyPage: React.FC<CarVerifyProps> = ({ carType }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({});
  const [clickLocked, setClickLocked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
      const [currentPage, setCurrentPage] = useState(1);
      const [totalCars, setTotalCars] = useState(0);
      const itemsPerPage = 5;
const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUnVerifiedCars = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      
      const response = await AdminAuthService.getAllUnVerifiedCars(page, 
        itemsPerPage, 
        { search: search.trim()});

      console.log("response back");
      if (!response || !response.data) throw new Error("Failed to fetch cars");

      setTotalCars(response.total || 0);
      const filteredCars = response.data
        // .filter((car: any) => car.verifyStatus === 0 && !car.isDeleted)
        .map((car: any) => ({
          id: car._id||car.id,
          carName: car.carName,
          brand: car.brand,
          year: car.year,
          fuelType: car.fuelType,
          rcBookNo: car.rcBookNo,
          expectedWage: car.expectedWage,
          location: car.location,
          make: car.make,
          carModel: car.carModel,
          verifyStatus: car.verifyStatus,
          images: car.images,
          videos: car.videos || [],
          rcBookProof: car.rcBookProof,
          insuranceProof: car.insuranceProof,
          owner: car.owner,
          available: car.available,
          createdAt: new Date(car.createdAt),
          locationAddress: car.location?.address ?? "No address",
          statusBadge: getStatusBadge(car.verifyStatus),
          formattedDate: formatDate(new Date(car.createdAt)),
        }));

      setCars(filteredCars);
      setTotalCars(response.total || 0);
    } catch (err) {
      setError("Error fetching cars");
      console.error(err);
    } finally {
      setLoading(false);
    }
  },[itemsPerPage]);

  useEffect(() => {
          setCurrentPage(1);
        }, [debouncedSearchTerm]);
   
    useEffect(() => {
      fetchUnVerifiedCars(currentPage, debouncedSearchTerm);
    }, [currentPage, debouncedSearchTerm, fetchUnVerifiedCars]);

     const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
      };
      const totalPages = Math.ceil(totalCars / itemsPerPage);
    
      const handlePageChange = (page: number) => {
        if (page >= 1 && page <= Math.ceil(totalCars / itemsPerPage)) {
          setCurrentPage(page);
        }
      };
    

  const handleVerifyCar = async (carId: string, reason?: string) => {
    try {
      setIsProcessing((prev) => ({ ...prev, [carId]: true }));
      
      const status = reason ? -1 : 1;
      console.log("reason:", status);
    
      const response = await AdminAuthService.updateCarVerifyStatus(
        carId, 
        status,
        reason
      );
      
      if (response) {
        setCars((prevCars) => 
          prevCars.filter((car) => car.id !== carId)
        );
        
        if (selectedCar && selectedCar.id === carId) {
          setSelectedCar(null);
        }
        
        toast.success(
          status === 1 
            ? "Car verified successfully" 
            : "Car rejected successfully"
        );
        
        fetchUnVerifiedCars(currentPage, debouncedSearchTerm);
      }
    } catch (err) {
      setError(reason ? "Failed to reject car" : "Failed to verify car");
      console.error(err);
    } finally {
      setIsProcessing((prev) => ({ ...prev, [carId]: false }));
    }
  };

  const getStatusBadge = (verifyStatus: number) => {
    if (verifyStatus === 1) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Verified</span>;
    } else {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

 
  const columns: TableColumn[] = [
    { header: "Car Name", key: "carName" },
    { header: "Brand", key: "brand" },
    { header: "Location", key: "locationAddress" },
    { header: "Status", key: "statusBadge" },
    { header: "Price/Day", key: "expectedWage" },
    { header: "Listed On", key: "formattedDate" },
  ];

  const handleViewCar = (car: Car) => {
     if (clickLocked) return; 
     setClickLocked(true);
    setSelectedCar(car);
    setTimeout(() => setClickLocked(false), 500);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Car Verification
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
            placeholder="Search by car name"
            value={searchTerm}
             onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
       <div className="mb-4 text-sm text-gray-600">
          <>
            {searchTerm ? (
              <>Showing {cars.length} results{totalCars > itemsPerPage && ` (page ${currentPage} of ${totalPages})`} for "{searchTerm}"</>
            ) : (
              <>Total bookings: {totalCars}{totalCars > itemsPerPage && ` (page ${currentPage} of ${totalPages})`}</>
            )}
          </>
       
      </div>

   
   <Table
              columns={columns}
              data={cars}
              showViewButton={true}
              onView={handleViewCar}
              isLoading={loading}
            />

 {/* {totalPages > 1 && ( */}
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      {/* )} */}

      {selectedCar && (
        <CarVerifyModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onVerifyCar={handleVerifyCar}
        />
      )}
    </div>
  );
};

export default CarVerifyPage;