// utils/transformCoordinates.ts
export const transformGeoCoordinates = (geoCar: any) => {
  
  const lng = geoCar?.location?.coordinates?.coordinates?.[0] ?? null;
  const lat = geoCar?.location?.coordinates?.coordinates?.[1] ?? null;
    console.log("reachf",lat,lng)
  
    return {
      ...geoCar,
      location: {
        ...geoCar.location,
        coordinates: {
          lat,
          lng,
        }
      }
    };
  };
  