export interface Car {
  id: string;
  carName: string;
  brand: string;
  year?: string;
  fuelType?: string;
  rcBookNo?: string;
  expectedWage: string;

  location: {
    coordinates: {
        lat: number;
        lng: number;
      };
      address: string;
      landmark?: string;
  };
  make?: string;
  carModel?: string;
  verifyStatus: number;
  blockStatus:number;
  images: string[];
  videos?: string[];
  owner:{
    fullName:string,
    id:string,
    email:string,
    phoneNumber?:string,
  };
  available: boolean;
  createdAt: Date;
  rcBookProof?:string;
  insuranceProof?:string;
  unavailableDates?:string[];
}

export interface CarVerifyProps {
  carType?: string;
}

export interface Booking {
  id: string;
  bookingId: string;
  carId: string;
  userId: string;
  carOwnerId: string;
  startDate: string; 
  endDate: string;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'failed';
  paymentIntentId?: string;
  paymentMethod?: 'stripe' | 'wallet';
  cancellationFee?: number;
  refundedAmount?: number;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  currentLocation?:{
    lat:number,
    lng:number,
  };
}

export interface AgreeementCar {
  _id: string;
  carName: string;
  brand: string;
  expectedWage: string;
}


export interface PaymentCar {
  _id: string;
  carName: string;
  brand: string;
  expectedWage: string;
  ownerId: string;
}


export interface Location {
  address?: string;
  city?: string;
  state?: string;
  coordinates?:{
    type?:string,
    coordinates?:[number,number]
  };
}

export interface CarDetail {
  _id: string;
  carName: string;
  brand: string;
  year: string;
  fuelType: string;
  rcBookNo: string;
  expectedWage: string;
  location: Location;
  verifyStatus: number;
  images: string[];
  videos: string[];
  owner: string;
  available: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDetail {
  _id?: string;
  carId: string;
  userId?: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string;
  createdAt?: Date;
}
