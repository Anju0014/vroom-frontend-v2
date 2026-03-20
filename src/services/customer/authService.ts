// 

// import { axiosCustomer } from "@/code/axiosCustomer";
import customerApi from "@/code/axiosInstance";
import { API_ROUTES } from "@/code/constants/apiRoutes";
import {
  SignupData,
  GoogleSignInData,
  Address,
  ChangePasswordData,
} from "@/types/authTypes";
import {
  BookingData,
  CancelBookingResponse,
  BookingResponse,
  ConfirmBookingResponse,
} from "@/types/workTypes";
import axios from "axios";

// const customerApi = axiosCustomer;

export const AuthService = {
  registerCustomer: async (userData: SignupData) => {
    return await customerApi.post(API_ROUTES.auth.customer.signup, userData);
  },

  verifyotpCustomer: async ({ email, otp }: { email: string; otp: string }) => {
    return await customerApi.post(API_ROUTES.auth.customer.verifyOtp, { email, otp });
  },

  resendotpCustomer: async ({ email }: { email: string }) => {
    return await customerApi.post(API_ROUTES.auth.customer.resendOtp, { email });
  },

  loginCustomer: async ({ email, password }: { email: string; password: string }) => {
    return await customerApi.post(API_ROUTES.auth.customer.login, { email, password });
  },

  forgotPasswordCustomer: async ({ email }: { email: string }) => {
    return await customerApi.post(API_ROUTES.auth.customer.forgotPassword, { email });
  },

  resetPasswordCustomer: async ({
    token,
    newPassword,
  }: { token: string | null; newPassword: string }) => {
    return await customerApi.post(API_ROUTES.auth.customer.resetPassword, {
      token,
      newPassword,
    });
  },

  logoutCustomer: async () => {
    return await customerApi.post(API_ROUTES.auth.customer.logout, {}, { withCredentials: true });
  },

  googlesigninCustomer: async (data: GoogleSignInData) => {
    return await customerApi.post(API_ROUTES.auth.customer.googleSignIn, data);
  },

  getCustomerProfile: async () => {
    const response = await customerApi.get(API_ROUTES.profile.customer.getProfile);
    if (response.status !== 200) throw new Error("Failed to fetch profile");
    return response.data;
  },

  updateCustomerProfile: async (payload: {
    phoneNumber: string;
    address: Address;
    profileImage: string;
  }) => {
    const response = await customerApi.put(API_ROUTES.profile.customer.updateProfile, payload);
    console.log(response.data);
    return response.data;
  },

  updateCustomerIdProof: async ({ idProof }: { idProof: string }) => {
    const response = await customerApi.put(API_ROUTES.profile.customer.updateIdProof, { idProof });
    console.log(response.data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await customerApi.post(API_ROUTES.profile.customer.changePassword, data);
    return response.data;
  },

  nearByCars: async (latitude: number, longitude: number) => {
    console.log("sending");
    const response = await customerApi.get(API_ROUTES.customer.nearByCars, {
      params: { lat: latitude, lng: longitude, maxDistance: 50 },
    });
    console.log("have came back");
    return response.data;
  },

  getAllCars: async (
    page: number,
    limit: number,
    filters: {
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      carType?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    try {
      const response = await customerApi.get(API_ROUTES.customer.getAllCars, {
        params: {
          page,
          limit,
          search: filters.search,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          carType: filters.carType,
          location: filters.location,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      });
      console.log("getAllCars response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching all cars:", error);
      throw error;
    }
  },

  featuredCarList: async () => {
    const response = await customerApi.get(API_ROUTES.customer.featuredCarList);
    return response.data;
  },

  findCarDetails: async (carId: string) => {
    const response = await customerApi.get(API_ROUTES.customer.findCarDetails(carId));
    return response.data.data;
  },

  findBookingDetails: async (carId: string) => {
    console.log("sending to enquire booking details");
    const response = await customerApi.get(API_ROUTES.customer.findBookingDetails(carId));
    return response.data;
  },

  findCustomerBookingDetails: async (page = 1, limit = 5) => {
    console.log("sending request for user booking");
    const response = await customerApi.get(API_ROUTES.customer.findCustomerBookingDetails, {
      params: { page, limit },
    });
    console.log("getBookings response:", response.data);
    return response.data;
  },

    findCustomerWalletDetails: async (page = 1, limit = 5) => {
    console.log("sending request for user wallet");
    const response = await customerApi.get(API_ROUTES.customer.findCustomerWalletDetails, {
      params: { page, limit },
    });
    console.log("getWallets response:", response.data);
    return response.data;
  },
  
  checkBookingAvailability: async (carId: string,startDate: string,endDate: string) => {
  const response = await customerApi.get(
    API_ROUTES.customer.checkBookingAvailability,
    {
      params: { carId, startDate, endDate },
    }
  );
  return response.data;
},

  createPendingBooking: async (data: BookingData): Promise<BookingResponse> => {
    try {
      console.log("Sending booking data to:", API_ROUTES.customer.createPendingBooking, data);
      const response = await customerApi.post<BookingResponse>(
        API_ROUTES.customer.createPendingBooking,
        data
      );
      console.log("Booking created:", response.data);
      if (!response.data.bookingId) {
        throw new Error("Invalid response: bookingId not found");
      }
      return response.data;
    } catch (error: any) {
      console.error("Booking API error:", error.response?.data || error.message);
      throw new Error(
        `Failed to create booking: ${error.response?.data?.error || error.message}`
      );
    }
  },
   updatePendingBooking: async (bookingId: string, data: { status: string }) => {
  const response = await customerApi.patch(
    API_ROUTES.customer.updatePendingBooking(bookingId),
    data
  );
  return response.data.data;
},

  confirmBooking: async (
    bookingId: string,
    transactionId: string,
    paymentMethod:string,
  ): Promise<ConfirmBookingResponse> => {
    try {
      console.log("Confirming booking:", { bookingId, transactionId,paymentMethod });
      const response = await customerApi.patch<ConfirmBookingResponse>(
        API_ROUTES.customer.confirmBooking(bookingId),
        { transactionId,paymentMethod  }
      );
      console.log("Booking confirmed:", response.data);
      if (!response.data.success || !response.data.bookingId) {
        throw new Error("Invalid response: success or bookingId not found");
      }
      return response.data;
    } catch (error: any) {
      console.error("Confirm booking API error:", error.response?.data || error.message);
      throw new Error(
        `Failed to confirm booking: ${error.response?.data?.error || error.message}`
      );
    }
  },

  failBooking: async (bookingId: string): Promise<CancelBookingResponse> => {
    try {
      console.log("Cancelling booking:", bookingId);
      const response = await customerApi.patch<CancelBookingResponse>(
        API_ROUTES.customer.failBooking(bookingId)
      );
      console.log("Booking cancelled:", response.data);
      if (!response.data.success) {
        throw new Error("Invalid response: success not found");
      }
      return response.data;
    } catch (error: any) {
      console.error("Cancel booking API error:", error.response?.data || error.message);
      throw new Error(
        `Failed to cancel booking: ${error.response?.data?.error || error.message}`
      );
    }
  },

  cancelBooking: async (bookingId: string): Promise<CancelBookingResponse> => {
    try {
      console.log("Cancelling booking:", bookingId);
      const response = await customerApi.patch<CancelBookingResponse>(
        API_ROUTES.customer.cancelBooking(bookingId)
      );
      console.log("Booking cancelled:", response.data);
      if (!response.data.success) {
        throw new Error("Invalid response: success not found");
      }
      return response.data;
    } catch (error: any) {
      console.error("Cancel booking API error:", error.response?.data || error.message);
      throw new Error(
        `Failed to cancel booking: ${error.response?.data?.error || error.message}`
      );
    }
  },
  getBookingById: async (bookingId: string) => {
  const response = await customerApi.get(`/bookings/${bookingId}`);
  return response.data.data;
},

requestPickupOTP: async (bookingId: string) => {
  const response = await customerApi.post(
    `/bookings/${bookingId}/request-pickup-otp`
  );
  return response.data;
},

verifyPickupOTP: async (bookingId: string, otp: string) => {
  const response = await customerApi.post(
    `/bookings/${bookingId}/verify-pickup-otp`,
    { otp }
  );
  return response.data;
},

payWithWallet: async (data: { bookingId: string; amount: number }) => {
  return customerApi.post(`/bookings/payWithWalletBalance`, data);
},

getWalletBalance: async () => {
  console.log("show wallet");

  try {
    const response = await customerApi.get(`/test`);
    console.log("response", response);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching wallet balance:", error.response?.data || error.message);
    throw error; 
  }
}


};
