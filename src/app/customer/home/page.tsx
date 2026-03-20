
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/HeaderCustomer';
import VroomFooter from '@/components/Footer';
import { getReverseGeocode } from "@/services/common/mapService";
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/customer/authService';
import { useAuthStore } from '@/store/customer/authStore';
import toast from 'react-hot-toast';
import { CarSearchForm } from '@/components/customer/carSearchForm';
import LoadingButton from '@/components/common/LoadingButton';
import { Car,Location} from '@/types/locationTypes';
import { useHasHydrated } from '@/hooks/useHasHydrated';

const LandingPage = () => {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // const [hydrated, setHydrated] = useState(false);
  const hydrated = useHasHydrated();
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [nearbyCars, setNearbyCars] = useState<Car[]>([]);
  const [loadingFeaturedCars, setLoadingFeaturedCars] = useState(true);
  const [loadingNearbyCars, setLoadingNearbyCars] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
      if (!hydrated) return;
    if (!user || !accessToken) {
      console.log('Unauthenticated customer, redirecting to /login');
      router.replace('/login');
    } else {
      console.log('Authenticated customer, replacing history with /customer/home');
      window.history.replaceState(null, '', '/customer/home');
      setIsAuthenticated(true);
    }
  }, [hydrated,user, accessToken, router]);

  
  // useEffect(() => {
  //   setHydrated(true);
  // }, []);

  // Function to calculate distance between two coordinates (in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  useEffect(() => {
    const fetchFeaturedCars = async () => {
      if (!hydrated || !isAuthenticated) return;
      
      try {
        setLoadingFeaturedCars(true);
        let response = await AuthService.featuredCarList();
        let data = response.data;
        // const verifiedCars = data.filter((car: Car) => 
        //   car.verifyStatus === 1 && !car.isDeleted
        // );
        
        setFeaturedCars(data);
      } catch (error) {
        console.error('Error fetching featured cars:', error);
      } finally {
        setLoadingFeaturedCars(false);
      }
    };

    fetchFeaturedCars();
  }, [hydrated, isAuthenticated]);


  const fetchNearbyCars = async (latitude: number, longitude: number) => {
    if (!hydrated || !isAuthenticated) return;
    
    try {
      setLoadingNearbyCars(true);
      
      const response = await AuthService.nearByCars(latitude, longitude);
      let data = response.data;
      
      const verifiedCars = data
        .filter((car: Car) => car.verifyStatus === 1 && !car.isDeleted)
        .map((car: Car) => {
          const carCoords = car.location.coordinates;
          console.log("carCoords",carCoords)
          console.log(car.location.coordinates)
          const distance = calculateDistance(
            latitude, 
            longitude, 
            carCoords[1], 
            carCoords[0] 
          );
          return { ...car, distance };
        })
        .sort((a: Car, b: Car) => (a.distance || 0) - (b.distance || 0)); // Sort by proximity
      
      setNearbyCars(verifiedCars);
    } catch (error) {
      console.error('Error fetching nearby cars:', error);
    } finally {
      setLoadingNearbyCars(false);
    }
  };

  useEffect(() => {
    if (hydrated && !manualOverride && isAuthenticated && typeof window !== 'undefined') {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoordinates({ lat: latitude, lng: longitude });
         
          try {
            const data = await getReverseGeocode(latitude, longitude);
            const locality = data.features.find((f: any) =>
  f.place_type.includes("locality")
);

const place = data.features.find((f: any) =>
  f.place_type.includes("place")
);

const location = [
  locality?.text,
  place?.text
].filter(Boolean).join(", ");

            const address = formatShortAddress( data?.features?.[0]?.place_name || "")

setLocation(location || address);

            // setLocation(address);
          } catch (error) {
            console.error("Error getting address:", error);
          } finally {
            setLoadingLocation(false);
          }
          
          fetchNearbyCars(latitude, longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoadingLocation(false);
        }
      );
    }
  }, [manualOverride, hydrated, isAuthenticated]);

  const formatShortAddress = (address: string): string => {
    const parts = address.split(',');
    if (parts.length >= 3) {
      return `${parts[parts.length - 3].trim()}, ${parts[parts.length - 2].trim()}`;
    }
    return address;
  };

  // Handle book now function
  // const handleBookNow = (carId: string) => {
   
  //   router.push(`/cars/${carId}?startDate=${startDate}&endDate=${endDate}`);
  // };
  
  // View details function
  const viewDetailsPage = (carId: string) => {
    console.log("carI",carId);
    router.push(`/cars/${carId}`);
  };

  // Search function
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
     if(!startDate && !endDate){
      toast.error('Dates has to be selected')
    }else{
      router.push(
    `/customer/cars?location=${encodeURIComponent(location)}&startDate=${startDate}&endDate=${endDate}`);
    }
  };

  if (!hydrated || !isAuthenticated) {
    return (
      <div style={{ visibility: 'hidden' }}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-grow flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
          <VroomFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="relative h-[500px] w-full">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/desert-background.png" 
            alt="Desert with SUV" 
            fill  
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-16 bg-black/20">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              Find Your Perfect Ride – <br />
              Anytime, Anywhere!
            </h1>
            <p className="text-white text-lg mb-8">
              Book from our wide selection of vehicles for any occasion at the best prices.
            </p>

<CarSearchForm
  location={location}
  setLocation={setLocation}
  startDate={startDate}
  setStartDate={setStartDate}
  endDate={endDate}
  setEndDate={setEndDate}
  loadingLocation={loadingLocation}
  onSearch={() => {
    router.push(
      `/customer/cars?location=${encodeURIComponent(location)}&startDate=${startDate}&endDate=${endDate}`
    );
  }}
/>

          </div>
        </div>
      </div>

      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Featured Cars</h2>
          <p className="text-gray-600 text-center mb-12">Check out our most popular rental options</p>
          
          {loadingFeaturedCars ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : featuredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCars.slice(0, 4).map(car => (
                <div key={car.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-xl">
                  <div className="relative h-48 w-full">
                    <Image 
                      src={car.images[0]} 
                      alt={car.carName}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg">{car.carName}</h3>
                      <span className="text-lg font-semibold text-orange-600">₹{car.expectedWage}/day</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <span className="mr-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        {car.brand}
                      </span>
                      <span className="mr-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {car.year}
                      </span>
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {car.fuelType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 truncate">{formatShortAddress(car.location.address)}</p>
                    <LoadingButton
                      className="w-full py-2 bg-gray-900 text-white font-semibold rounded-md hover:bg-gray-800 transition-all"
                      onClick={() => viewDetailsPage(car.id)}
                    >
                      View Details
                    </LoadingButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-white p-8 rounded-lg shadow">
              <p className="text-gray-600">No featured cars available at the moment.</p>
            </div>
          )}
          
          {featuredCars.length > 4 && (
            <div className="text-center mt-8">
              <LoadingButton
                className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-all"
                onClick={() => router.push('/customer/cars')}
              >
                View All Cars
              </LoadingButton>
            </div>
          )}
        </div>
      </section>

      {coordinates && (
        <section className="py-16 px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-3">Cars Near You</h2>
            <p className="text-gray-600 text-center mb-12">
              {loadingNearbyCars 
                ? "Looking for nearby cars..." 
                : nearbyCars.length > 0 
                  ? "Available for immediate rental in your area" 
                  : "No cars available in your area at the moment"}
            </p>
            
            {loadingNearbyCars ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : nearbyCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {nearbyCars.slice(0, 3).map(car => (
                  <div key={car.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-xl">
                    <div className="relative h-48 w-full">
                      <Image 
                        src={car.images[0]} 
                        alt={car.carName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 rounded-br-lg">
                        {car.distance?.toFixed(1)} km away
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg">{car.carName}</h3>
                        <span className="text-lg font-semibold text-orange-600">₹{car.expectedWage}/day</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <span className="mr-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                          </svg>
                          {car.brand}
                        </span>
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          {car.fuelType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">{car.location.landmark}</p>
                      <LoadingButton
                        className="w-full py-2 bg-gray-900 text-white font-semibold rounded-md hover:bg-gray-800 transition-all"
                        onClick={() => viewDetailsPage(car.id)}
                      >
                        View Details
                      </LoadingButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white p-8 rounded-lg shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold mb-2">No Cars Available Nearby</h3>
                <p className="text-gray-600">Try expanding your search area or check back later!</p>
              </div>
            )}
            
            {nearbyCars.length > 3 && (
              <div className="text-center mt-8">
                <LoadingButton
                  className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-all"
                  onClick={() => router.push(`/cars/nearby?lat=${coordinates.lat}&lng=${coordinates.lng}`)}
                >
                  View All Nearby Cars
                </LoadingButton>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Why Choose Vroom</h2>
          <p className="text-gray-600 text-center mb-12">We offer the best car rental experience with premium service and satisfaction, always.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Wide Car Selection</h3>
              <p className="text-gray-600 text-center text-sm">From economy to luxury, we've got you covered.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Secure & Verified</h3>
              <p className="text-gray-600 text-center text-sm">All vehicles are verified for your safety.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Easy Payments</h3>
              <p className="text-gray-600 text-center text-sm">Secure online payments with PayPal.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Real-Time Availability</h3>
              <p className="text-gray-600 text-center text-sm">Always know what cars are awaiting.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">How It Works</h2>
          <p className="text-gray-600 text-center mb-12">Renting a car never been easier. Follow these simple steps.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-6">1</div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-800 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Browse & Select a Car</h3>
              <p className="text-gray-600 text-center">Check our inventory by location, date, and car type to find your perfect match.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-6">2</div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-800 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Book & Make Payment</h3>
              <p className="text-gray-600 text-center">Reserve your car instantly with our secure payment system.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-6">3</div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-800 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Pick Up & Drive</h3>
              <p className="text-gray-600 text-center">Collect your keys and enjoy your journey with peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      <VroomFooter />
    </div>
  );
};

export default LandingPage;