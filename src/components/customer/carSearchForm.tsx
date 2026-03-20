"use client"
import {useRef, useState} from 'react'
import toast from "react-hot-toast";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";

interface CarSearchFormProps{
    location:string;
    setLocation:(val:string)=>void;
    startDate:string;
    setStartDate:(val:string)=>void;
    endDate:string;
    setEndDate:(val:string)=>void;
    loadingLocation?:boolean;
    onSearch:()=>void;
}

export const CarSearchForm=({
    location,
    setLocation,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loadingLocation,
    onSearch,
}: CarSearchFormProps)=>{
//     const libraries: ("places")[] = ["places"];
//       const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

//       const { isLoaded } = useLoadScript({
//     googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
//     libraries,
//   });

//   const handlePlaceSelect = () => {
//     const place = autocompleteRef.current?.getPlace();
//     if (!place) return;

//     // You can customize this
//     setLocation(place.formatted_address || place.name || "");
//   };
      const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast.error("Select a location");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Dates have to be selected");
      return;
    }

    onSearch();
  };
  return(
     <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">

        {/* Location */}
        {/* <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location {loadingLocation && (
              <span className="text-xs text-blue-500">(detecting...)</span>
            )}
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="Enter or wait for auto-detect"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div> */}
         <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location {loadingLocation && (
              <span className="text-xs text-blue-500">(detecting...)</span>
            )}
          </label>

          {/* <Autocomplete
            onLoad={(auto) => (autocompleteRef.current = auto)}
            onPlaceChanged={handlePlaceSelect}
          > */}
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="Search city, area, place"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          {/* </Autocomplete> */}
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Date
          </label>
          <input
            type="date"
            className="w-full p-2 border rounded-md"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

  
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            className="w-full p-2 border rounded-md"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split("T")[0]}
          />
        </div>
      </form>

      <button
        type="submit"
        onClick={handleSubmit}
        className="mt-3 w-full py-3 bg-gray-900 text-white font-semibold rounded-md hover:bg-gray-800 transition-all"
      >
        Search Available Cars
      </button>
    </div>
  )

}