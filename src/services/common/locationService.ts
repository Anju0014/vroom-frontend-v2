// import axios from "axios"; 

// const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/'

// export const LocationService= {
//    async updateLocation(data: {
//     bookingId: string;
//     token: string;
//     lat: number;
//     lng: number;
//   }) {
//     const response=axios.post(`${API_URL}tracking/update`, data);
//     return response
//   }
// }



// import { axiosCustomer } from "@/code/axiosCustomer";
import { API_ROUTES } from "@/code/constants/apiRoutes";
// import { plainAxios } from "@/code/plainAxios";
import api from "@/code/axiosInstance";


export const LocationService = {
  async updateLocation(data: {
    bookingId: string;
    token: string;
    lat: number;
    lng: number;
  }) {
    const response = await api.post(API_ROUTES.tracking.updateLocation, data);
    return response;
  },
};
