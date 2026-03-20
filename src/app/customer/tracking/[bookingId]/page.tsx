"use client";
import { useEffect } from "react";
import { LocationService } from "@/services/common/locationService";
import { useParams, useSearchParams } from "next/navigation";

export default function TrackingPage() {
 
  const params = useParams();
  const searchParams = useSearchParams();

  const bookingId = params.bookingId as string; 
  const token = searchParams.get("token"); 

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    if (!token) {
  console.error("Tracking token missing!");
  return;
}

    const watcher = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
            console.log(pos.coords.latitude, pos.coords.longitude)
          await LocationService.updateLocation({
            bookingId,
            token,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        } catch (err) {
          console.error("Error sending location:", err);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [bookingId, token]);

  return  <div className="flex items-center justify-center h-20">
         Sharing your live location...
    </div>;
}
