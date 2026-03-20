
import { API_ROUTES } from "@/code/constants/apiRoutes";
import carOwnerApi from "@/code/axiosInstance";
import {
  SignupData,
  GoogleSignInData,
  Address,
  ChangePasswordData,
  CarFormData,
  RegistrationCarOwner,
} from "@/types/authTypes";
import { Booking } from "@/types/carTypes";
import { StatsData } from "@/types/statsTypes";

// const carOwnerApi = axiosOwner;

export const OwnerAuthService = {
  registerCarOwner: async (userData: SignupData) => {
    return await carOwnerApi.post(API_ROUTES.auth.owner.signup, userData);
  },

  verifyotpCarOwner: async ({ email, otp }: { email: string; otp: string }) => {
    return await carOwnerApi.post(API_ROUTES.auth.owner.verifyOtp, { email, otp });
  },

  resendotpCarOwner: async ({ email }: { email: string }) => {
    return await carOwnerApi.post(API_ROUTES.auth.owner.resendOtp, { email });
  },

  loginCarOwner: async ({ email, password }: { email: string; password: string }) => {
    return await carOwnerApi.post(API_ROUTES.auth.owner.login, { email, password });
  },

  forgotPasswordCarOwner: async ({ email }: { email: string }) => {
    return await carOwnerApi.post(API_ROUTES.auth.owner.forgotPassword, { email });
  },

  resetPasswordCarOwner: async ({
    token,
    newPassword,
  }: { token: string | null; newPassword: string }) => {
    return await carOwnerApi.post(API_ROUTES.auth.owner.resetPassword, { token, newPassword });
  },

  logoutOwner: async () => {
    return await carOwnerApi.post(API_ROUTES.auth.owner.logout, {}, { withCredentials: true });
  },

  googlesigninOwner: async (data: GoogleSignInData) => {
    return await carOwnerApi.post(API_ROUTES.auth.owner.googleSignIn, data);
  },

  getOwnerProfile: async () => {
    const response = await carOwnerApi.get(API_ROUTES.profile.owner.getProfile);
    if (response.status !== 200) throw new Error("Failed to fetch profile");
    return response.data;
  },

  updateOwnerProfile: async (payload: {
    phoneNumber: string;
    address: Address;
    profileImage: string;
  }) => {
    const response = await carOwnerApi.put(API_ROUTES.profile.owner.updateProfile, payload);
    console.log(response.data);
    return response.data;
  },

  updateOwnerIdProof: async ({ idProof }: { idProof: string }) => {
    const response = await carOwnerApi.put(API_ROUTES.profile.owner.updateIdProof, { idProof });
    console.log(response.data);
    return response.data;
  },

  addCar: async (data: CarFormData) => {
    const response = await carOwnerApi.post(API_ROUTES.owner.addCar, data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await carOwnerApi.post(API_ROUTES.profile.owner.changePassword, data);
    return response.data;
  },

  getCars: async (page = 1, limit = 5) => {
    try {
      const response = await carOwnerApi.get(API_ROUTES.owner.getCars, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching cars:", error);
      throw error;
    }
  },

  completeRegistration: async (data: RegistrationCarOwner) => {
    const response = await carOwnerApi.post(
      API_ROUTES.auth.owner.completeRegistration,
      data
    );
    return response.data;
  },

  updateCar: async (carId: string, carData: CarFormData) => {
    const response = await carOwnerApi.put(API_ROUTES.owner.updateCar(carId), carData);
    return response.data;
  },

  deleteCar: async (carId: string) => {
    const response = await carOwnerApi.delete(API_ROUTES.owner.deleteCar(carId));
    return response.data;
  },

  getBookingList: async (page = 1, limit = 9,search?: string,
  status?: string) => {
    const response = await carOwnerApi.get(API_ROUTES.owner.getBookingList, {
      params: { 
        page, 
        limit,
        search: search || "",
        status: status && status !== "all" ? status : "" },
    });
    return response.data;
  },

  getBookingsForCar: async (carId: string): Promise<{ data: Booking[] }> => {
    const response = await carOwnerApi.get(API_ROUTES.owner.getBookingsForCar(carId));
    return {
      data: response.data.data.map((booking: any) => ({
        id: booking._id,
        bookingId: booking.bookingId,
        carId: booking.carId.toString(),
        userId: booking.userId.toString(),
        carOwnerId: booking.carOwnerId.toString(),
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentIntentId: booking.paymentIntentId,
        paymentMethod: booking.paymentMethod,
        cancellationFee: booking.cancellationFee,
        refundedAmount: booking.refundedAmount,
        cancelledAt: booking.cancelledAt,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      })),
    };
  },

  updateCarAvailability: async (carId: string, data: { unavailableDates: string[] }) => {
    console.log("unavailable", data);
    await carOwnerApi.patch(API_ROUTES.owner.updateCarAvailability(carId), data);
  },

  getActiveBookingForCar: async (carId: string): Promise<Booking> => {
    const response = await carOwnerApi.get(API_ROUTES.owner.getActiveBookingForCar(carId));
    console.log("bookings for today?", response.data);
    const bookingData = response.data.booking;
    if (!bookingData) return bookingData;
    return {
      ...bookingData,
      id: bookingData?._id,
    };
  },

   getReceiptUrl:async(bookingId: string):Promise<{url:string}>=> {
    const response = await carOwnerApi.get(API_ROUTES.owner.receiptUrlBooking(bookingId));
  console.log("resres", response)
  return response.data;
  },

   markCarReturned:async(bookingId: string)=> {
    console.log("senidng..)")
    const response = await carOwnerApi.patch(API_ROUTES.owner.markCarReturned(bookingId));
    console.log("resres", response)
  return response.data;
  },
  cancelBooking: async (bookingId: string) => {
    try {
      console.log("Cancelling booking:", bookingId);
      const response = await carOwnerApi.patch(API_ROUTES.owner.cancelBooking(bookingId));
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
  getStatsData: async (range:string): Promise<StatsData>=> {
    try {
      const response = await carOwnerApi.get(`${API_ROUTES.owner.getOwnerStats}?range=${range}`);
      return response.data.data; 
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw new Error("Failed to fetch stats");
    }
  },
   findOwnerWalletDetails: async (page = 1, limit = 5) => {
    console.log("sending request for user wallet");
    const response = await carOwnerApi.get(API_ROUTES.owner.findOwnerWalletDetails, {
      params: { page, limit },
    });
    console.log("getWallets response:", response.data);
    return response.data;
  },
   async createConnectAccount() {
    const res = await carOwnerApi.post(API_ROUTES.stripe.createConnectAccount);
    return res.data;
  },
  
};
