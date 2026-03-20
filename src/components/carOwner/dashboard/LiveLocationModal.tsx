
'use client';
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from 'leaflet'
import socket from "@/services/common/socketService";
import LoadingButton from "@/components/common/LoadingButton";

interface LiveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  defaultLocation?: { lat: number; lng: number }; // optional now
}

export default function LiveLocationModal({
  isOpen,
  onClose,
  bookingId,
  defaultLocation
}: LiveLocationModalProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!isOpen || !bookingId) return;


    // if (defaultLocation){ console.log("deafult",defaultLocation)
    //     setLocation(defaultLocation);}

    // const socket: Socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, { withCredentials: true });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinBookingRoom", bookingId);
      console.log("Joined room:", `booking_${bookingId}`);
    });

    socket.on("location:update", (data: { lat: number; lng: number }) => {
      console.log("Received live location:", data);
      setLocation(data);
    });

    socket.on("connect_error", (err) => console.log("Socket connection error:", err));

    return () => {
      socket.off("location:update");
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, [isOpen, bookingId, defaultLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-4/5 h-4/5 p-4 relative">
        <LoadingButton onClick={onClose} className="absolute top-2 right-2 p-2">X</LoadingButton>
        <h2 className="text-xl font-semibold mb-2">Live Location</h2>

        {location ? (
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={14}
            style={{ width: "100%", height: "90%" }}
          >
            <TileLayer
              url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`}
              id="mapbox/streets-v11"
              tileSize={512}
              zoomOffset={-1}
            />
            <Marker
             position={[location.lat, location.lng]}
       
     icon={L.icon({
              iconUrl: "/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
>
              <Popup>Car is here 📍</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <p className="text-center mt-4">Waiting for location...</p>
        )}
      </div>
    </div>
  );
}
