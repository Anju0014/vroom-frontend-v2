
// import axios from 'axios';

// const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/';

// interface PaymentIntentData {
//   carId: string;
//   startDate: string;
//   endDate: string;
//   totalPrice: number;
//   customerEmail: string;
// }

// export const createPaymentIntent = async (data: PaymentIntentData) => {
//   try {
//     // Validate input data
//     if (!data.carId || !data.startDate || !data.endDate || !data.totalPrice || !data.customerEmail) {
//       throw new Error('Missing required fields for payment intent');
//     }
//     if (isNaN(data.totalPrice) || data.totalPrice <= 0) {
//       throw new Error('Invalid totalPrice: must be a positive number');
//     }

//     console.log('Sending data to:', `${API_URL}api/stripe/create-payment-intent`, data);
//     const response = await axios.post(`${API_URL}api/stripe/create-payment-intent`, data);
//     console.log('Received response:', response.data);

//     if (!response.data.clientSecret) {
//       throw new Error('Invalid response: clientSecret not found');
//     }

//     return response.data;
//   } catch (error: any) {
//     console.error('Stripe API error:', error.response?.data || error.message);
//     throw new Error(`Failed to create payment intent: ${error.response?.data?.error || error.message}`);
//   }
// };


// import axios from 'axios';

// const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/';

// interface PaymentIntentData {
//   carId: string;
//   startDate: string;
//   endDate: string;
//   totalPrice: number;
//   customerEmail: string;
//   bookingId: string; 
// }

// export const createPaymentIntent = async (data: PaymentIntentData) => {
//   try {
    
//     if (
//       !data.carId ||
//       !data.startDate ||
//       !data.endDate ||
//       !data.totalPrice ||
//       !data.customerEmail ||
//       !data.bookingId
//     ) {
//       throw new Error('Missing required fields for payment intent');
//     }
//     if (isNaN(data.totalPrice) || data.totalPrice <= 0) {
//       throw new Error('Invalid totalPrice: must be a positive number');
//     }

//     console.log('Sending data to:', `${API_URL}api/stripe/create-payment-intent`, data);
//     const response = await axios.post(`${API_URL}api/stripe/create-payment-intent`, data);
//     console.log('Received response:', response.data);

//     if (!response.data.clientSecret) {
//       throw new Error('Invalid response: clientSecret not found');
//     }

//     return response.data;
//   } catch (error: any) {
//     console.error('Stripe API error:', error.response?.data || error.message);
//     throw new Error(`Failed to create payment intent: ${error.response?.data?.error || error.message}`);
//   }
// };



// import { axiosCustomer } from "@/code/axiosCustomer";
import { API_ROUTES } from "@/code/constants/apiRoutes";
// import { plainAxios } from "@/code/plainAxios";
import api from "@/code/axiosInstance";
// const commonApi = plainAxios;

interface PaymentIntentData {
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  customerEmail: string;
  bookingId: string;
}

export const StripeService = {
  createPaymentIntent: async (data: PaymentIntentData) => {
    try {
      if (
        !data.carId ||
        !data.startDate ||
        !data.endDate ||
        !data.totalPrice ||
        !data.customerEmail ||
        !data.bookingId
      ) {
        throw new Error("Missing required fields for payment intent");
      }
      if (isNaN(data.totalPrice) || data.totalPrice <= 0) {
        throw new Error("Invalid totalPrice: must be a positive number");
      }

      console.log("Sending data to:", API_ROUTES.stripe.createPaymentIntent, data);
      const response = await api.post(API_ROUTES.stripe.createPaymentIntent, data);
      console.log("Received response:", response.data);

      if (!response.data.clientSecret) {
        throw new Error("Invalid response: clientSecret not found");
      }

      return response.data;
    } catch (error: any) {
      console.error("Stripe API error:", error.response?.data || error.message);
      throw new Error(
        `Failed to create payment intent: ${error.response?.data?.error || error.message}`
      );
    }
  },
   async createConnectAccount() {
    const res = await api.post(API_ROUTES.stripe.createConnectAccount);
    return res.data;
  },
};
