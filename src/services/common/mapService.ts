import axios from 'axios';

const token = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

export const getReverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`,
      {
        params: {
          access_token: token,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Mapbox Reverse Geocode Error:", error);
    throw error;
  }
};
