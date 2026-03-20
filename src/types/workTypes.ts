
  
export interface Car {
    id: string;
    name: string;
    model: string;
    fuelType: string;
    price: number;
    features: string[];
    images: string[];
    videoUrl: string;
    availability: { [date: string]: boolean }; // "2025-04-10": true
  }
  



  export interface BookingData {
    carId: string;
    userId: string;
    carOwnerId: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
  }
  
  export interface BookingResponse {
    bookingId: string;
  }
  
  export interface ConfirmBookingResponse {
    success: boolean;
    bookingId: string;
  }
  
  export interface CancelBookingResponse {
    success: boolean;
  }


  