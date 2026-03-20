

"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { getReverseGeocode } from "@/services/common/mapService";
import { LocationPickerProps } from "@/types/locationTypes";

const LocationPicker: React.FC<LocationPickerProps> = ({
  onSelectLocation,
  initialCoordinates,
}) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialCoordinates || null
  );

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const data = await getReverseGeocode(lat, lng);
      const place = data.features[0];
      const address = place?.place_name || "";
      const landmark = place?.text || "";

      onSelectLocation(lat, lng, address, landmark);
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      onSelectLocation(lat, lng);
    }
  };

  useEffect(() => {
    if (initialCoordinates) {
      reverseGeocode(initialCoordinates.lat, initialCoordinates.lng);
    }
  }, [initialCoordinates]);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        reverseGeocode(lat, lng);
      },
    });

    return position ? (
      <Marker
        position={position}
        icon={L.icon({
          iconUrl: "/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      />
    ) : null;
  };

  const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => {
      if (lat && lng) {
        map.setView([lat, lng], 14); 
      }
    }, [lat, lng, map]);
    return null;
  };

  return (
    <MapContainer
      center={
        initialCoordinates
          ? [initialCoordinates.lat, initialCoordinates.lng]
          : [20.5937, 78.9629]
      }
      zoom={initialCoordinates ? 14 : 5}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`}
        attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
      />
      {position && <RecenterMap lat={position.lat} lng={position.lng} />}
      <LocationMarker />
    </MapContainer>
  );
};

export default LocationPicker;
