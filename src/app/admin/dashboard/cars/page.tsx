'use client';

import React, { useCallback, useEffect, useState } from "react";
import { TableColumn, Table } from "@/components/admin/Table"; 
import { AdminAuthService } from "@/services/admin/adminService";
import CarDetailsModal from "@/components/admin/CarDetailsModal";
import { Car } from '@/types/carTypes';
import Pagination from "@/components/pagination";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";

const VerifiedCarsPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickLocked, setClickLocked] = useState(false);
 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({});
  const itemsPerPage = 5;
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchVerifiedCars = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      
      const response = await AdminAuthService.getAllVerifiedCars(page, 
        itemsPerPage, 
        { search: search.trim()});
      
      if (!response || !response.data) throw new Error("Failed to fetch cars");
      setTotalCars(response.total || 0);
      
      const verifiedCars = response.data
        .map((car: any) => ({
          id: car._id||car.id,
          carName: car.carName,
          brand: car.brand,
          year: car.year,
          fuelType: car.fuelType,
          rcBookNo: car.rcBookNo,
          expectedWage: car.expectedWage,
          location: car.location,
          verifyStatus: car.verifyStatus,
          blockStatus: car.blockStatus || 0, 
          images: car.images,
          videos: car.videos || [],
          owner: car.owner,
          available: car.available,
          createdAt: new Date(car.createdAt),
          
          ownerName: car.owner?.fullName || "Unknown",
          locationAddress: car.location?.address ?? "No address",
          availabilityText: car.available ? "Available" : "Not Available",
          formattedDate: formatDate(new Date(car.createdAt)),
        }));
      
      setCars(verifiedCars);
      setTotalCars(response.total || 0);
    } catch (err) {
      setError("Error fetching verified cars");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchVerifiedCars(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchVerifiedCars]);

  const handleToggleBlock = async (car: Car) => {
    try {
      setIsProcessing((prev) => ({ ...prev, [car.id]: true }));
      
      // If blockStatus is 0 (unblocked), set to 1 (blocked)
      // If blockStatus is 1 (blocked), set to 0 (unblocked)
      const newStatus = car.blockStatus === 0 ? 1 : 0;
      const response = await AdminAuthService.updateCarBlockStatus(car.id, newStatus);
      
      if (response) {
        setCars((prevCars) =>
          prevCars.map((c) =>
            c.id === car.id 
              ? { ...c, blockStatus: response.car.blockStatus }  
              : c
          )
        );
        
        setSelectedCar((prev) =>
          prev && prev.id === car.id
            ? { ...prev, blockStatus: response.car.blockStatus }
            : prev
        );
        
        toast.success(`Car ${newStatus === 1 ? 'blocked' : 'unblocked'} successfully`);
      }
    } catch {
      setError("Failed to update block status");
      toast.error("Failed to update block status");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [car.id]: false }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const totalPages = Math.ceil(totalCars / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= Math.ceil(totalCars / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // const getAvailabilityBadge = (available: boolean) => {
  //   if (available) {
  //     return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Available</span>;
  //   } else {
  //     return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Not Available</span>;
  //   }
  // };

  const getBlockStatusBadge = (blockStatus: number) => {
    if (blockStatus === 1) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Blocked</span>;
    } else {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>;
    }
  };


  const tableData = cars.map(car => ({
    carName: car.carName,
    brand: car.brand,
    ownerName: car.owner?.fullName || "Unknown",
    locationAddress: car.location?.address ?? "No address",
    // availabilityText: getAvailabilityBadge(car.available),
    blockStatusText: getBlockStatusBadge(car.blockStatus),
    expectedWage: `₹${car.expectedWage}`,
    formattedDate: formatDate(new Date(car.createdAt)),
    _car: car,
  }));
    
  const columns: TableColumn[] = [
    { header: "Car Name", key: "carName" },
    { header: "Brand", key: "brand" },
    { header: "Owner", key: "ownerName" },
    { header: "Location", key: "locationAddress" },
    // { header: "Availability", key: "availabilityText" },
    { header: "Status", key: "blockStatusText" },
    { header: "Price/Day", key: "expectedWage" },
    { header: "Listed On", key: "formattedDate" },
  ];

  const handleViewCar = (rowData: any) => {
    if (clickLocked) return; 
    setClickLocked(true);
    setSelectedCar(rowData._car);
    setTimeout(() => setClickLocked(false), 500);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          Verified Cars
        </h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Verified Cars
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
            <>Total cars: {totalCars}{totalCars > itemsPerPage && ` (page ${currentPage} of ${totalPages})`}</>
          )}
        </>
      </div>

      <Table
        columns={columns}
        data={tableData}
        showViewButton={true}
        onView={handleViewCar}
        isLoading={loading}
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
      
      {selectedCar && (
        <CarDetailsModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onToggleBlock={handleToggleBlock}
          isProcessing={isProcessing[selectedCar.id] || false}
        />
      )}
    </div>
  );
};

export default VerifiedCarsPage;