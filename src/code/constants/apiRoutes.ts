
export const API_ROUTES = {
  auth: {
    customer: {
      signup: "/sign-up",
      verifyOtp: "/verify-otp",
      resendOtp: "/resend-otp",
      login: "/login",
      forgotPassword: "/forgot-password",
      resetPassword: "/reset-password",
      logout: "/auth/logout",
      googleSignIn: "/auth/google",
    },
    admin: {
      login: "/admin/auth/login",
      logout: "/admin/auth/logout",
    },
    owner: {
      signup: "/owner/sign-up",
      verifyOtp: "/owner/verify-otp",
      resendOtp: "/owner/resend-otp",
      login: "/owner/login",
      forgotPassword: "/owner/forgot-password",
      resetPassword: "/reset-password",
      logout: "/owner/logout",
      googleSignIn: "/owner/auth/google",
      completeRegistration: "/owner/complete-registration",
    },
  },
  profile: {
    customer: {
      getProfile: "/me",
      updateProfile: "/me",
      updateIdProof: "/me/id-proof",
      changePassword: "/me/password",
    },
    admin: {
      getProfile: "/owner/getAdminProfile", // Note: Possible typo in your original code
    },
    owner: {
      getProfile: "/owner/me",
      updateProfile: "/owner/me",
      updateIdProof: "/owner/me/id-proof",
      changePassword: "/owner/me/password",
    },
  },
  admin: {
    getAllCustomers: "/admin/customers",
    getAllOwners: "/admin/owners",
    getAllPendingOwners: "/admin/ownerpending",
    toggleBlockCustomer: (customerId: string) => `/customers/${customerId}/toggle-block`,
    toggleBlockOwner: (ownerId: string) => `/owner/${ownerId}/toggle-block`,
    updateBlockStatus: (userId: string, userType: "customer" | "owner") =>
      userType === "customer"
        ? `/admin/customers/block-status/${userId}`
        : `/admin/owners/block-status/${userId}`,
    updateCarBlockStatus: (carId: string) => `/admin/cars/block-status/${carId}`,
    updateUserStatus: (userId: string, userType: "customer" | "owner") =>
      userType === "customer"
        ? `/admin/customers/updatestatus/${userId}`
        : `/admin/owners/updatestatus/${userId}`,
    updateVerifyStatus: (userId: string, userType: "customer" | "owner") =>
      userType === "customer"
        ? `/admin/customers/verify-status/${userId}`
        : `/admin/owners/verify-status/${userId}`,
    getAllUnverifiedCars: "/admin/pendingcars",
    getAllVerifiedCars: "/admin/verifiedcars",
    getAllBookings: "/admin/bookings",
    updateCarVerifyStatus: (carId: string) => `/admin/cars/verify-status/${carId}`,
    getAllComplaints: "/complaints/admin",
    updateComplaint: (id: string) => `/complaints/admin/${id}`,
    getStats:"/admin/getStats",
    getAllOwnerWallets:"/admin/owner-wallets",
    processOwnerPayout:"/admin/owner-payout",

  },
  owner: {
    addCar: "/owner/car",
    getCars: "/owner/cars",
    updateCar: (carId: string) => `/owner/cars/${carId}`,
    deleteCar: (carId: string) => `/owner/cars/${carId}`,
    getBookingList: "/owner/bookings",
    getBookingsForCar: (carId: string) => `/owner/cars/${carId}/bookings`,
    updateCarAvailability: (carId: string) => `/owner/cars/${carId}/availability`,
    getActiveBookingForCar: (carId: string) => `/owner/activebooking/${carId}`,
    cancelBooking: (bookingId: string) => `/bookings/${bookingId}/cancel`,
    receiptUrlBooking: (bookingId: string) => `/owner/booking/${bookingId}/receipt-url`,
    markCarReturned:(bookingId: string) => `/owner/bookings/${bookingId}/markCarReturned`,
    getOwnerStats:"/owner/getStats",
    findOwnerWalletDetails: "/owner/me/wallet",
  },
  customer: {
    nearByCars: "/car/nearby",
    getAllCars: "/cars",
    featuredCarList: "/car/featured",
    findCarDetails: (carId: string) => `/car/car-details/${carId}`,
    findBookingDetails: (carId: string) => `/car/booking-details/${carId}`,
    checkBookingAvailability:"/bookings/availability",
    findCustomerBookingDetails: "/me/bookings",
    findCustomerWalletDetails: "/me/wallet",
    updatePendingBooking:(bookingId:string)=>`/bookings/${bookingId}/pendingBooking`,
    createPendingBooking: "/bookings/create",
    confirmBooking: (bookingId: string) => `/bookings/${bookingId}/confirm`,
    failBooking: (bookingId: string) => `/bookings/${bookingId}/fail`,
    cancelBooking: (bookingId: string) => `/bookings/${bookingId}/cancel`,
    
  },
  chat: {
    ownerChats: "/chats/owner-chats",
    chatHistory: (roomId: string) => `/chats/room/${roomId}`,
  },
  stripe: {
    createPaymentIntent: "api/stripe/create-payment-intent",
    createConnectAccount:"/owner/create-account"
  },
  tracking: {
    updateLocation: "tracking/update",
  },
  notification:{
   getNotification: "notifications",          
    getUnreadCount: "notifications/unread-count", 
    markAllAsRead: "notifications/mark-all-read", 
    markAsRead: "notifications/mark-read", 
  },
  s3: {
    generatePresignedUrl: "api/s3/generatePresignedUrl",
      presignedUpload: "api/s3/generate-upload-url",
  presignedView: "api/s3/generate-view-url",
  },
//   s3: {
//   presignedUpload: "api/s3/generate-upload-url",
//   presignedView: "api/s3/generate-view-url",
// }
};
