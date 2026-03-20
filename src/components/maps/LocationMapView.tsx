"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { LocationMapViewProps } from "@/types/locationTypes";


const LocationMapView: React.FC<LocationMapViewProps> = ({ lat, lng }) => {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={true}
      zoomControl={false}
      style={{ height: "250px", width: "100%" }}
    >
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`}
        attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
      />
      <Marker
        position={[lat, lng]}
        icon={L.icon({
          iconUrl: "/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      />
    </MapContainer>
  );
};

export default LocationMapView;
