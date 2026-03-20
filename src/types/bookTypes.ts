export interface Location {
    address?: string;
    city?: string;
    state?: string;
    coordinates?: [number, number];
  }
  
  export interface Car {
    _id: string;
    carName: string;
    owner?:string
    brand: string;
    expectedWage: string;
    location: Location;
  }
  
  export interface Booking {
    _id?: string;
    carId: string;
    startDate: Date;
    endDate: Date;
    status:string;
    lockedUntil:Date;

  }
  
  export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
  }

  
  

export interface IBooking {
  _id: string;
  bookingId:string;
  customer: {
    _id: string;
    fullName: string;
    email: string;
  };
  carOwner: {
    _id: string;
    fullName: string;
    email: string;
  };
  car: {
    _id: string;
    carName: string;
    brand: string;
    model: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}
  

export interface BookingType {
  id: string; // Unique identifier for the booking
  carId: string; // Reference to the car being booked
  userId: string; // Reference to the user who made the booking
  startDate: string; // ISO date string, e.g., "2025-08-20"
  endDate: string; // ISO date string, e.g., "2025-08-22"
  status: 'confirmed' | 'pending' | 'cancelled'; // Booking status
  createdAt: string; // ISO date string for when booking was made
  updatedAt?: string; // ISO date string for last update
}

// export interface IBookingPopulated extends IBooking {
//   customer?: {
//     _id: string;
//     fullName: string;
//     email: string;
//   };
//   carOwner?: {
//     _id: string;
//     fullName: string;
//     email: string;
//   };
//   car?: {
//     _id: string;
//     carName: string;
//     brand: string;
//     model: string;
//   };
// }

export interface BookingDetail {
  _id?: string;
  bookingId?: string;
  carId: string;
  userId?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt?: string;
  carName: string;
  ownerName: string;
  ownerContact: string;
  carOwnerId?: string;
  pickupLocation?: string;
  pickupCoordinates: [number, number];
  carNumber?: string;
  brand?: string;
  receiptUrl?: string;
  pickupVerified?:boolean;
}