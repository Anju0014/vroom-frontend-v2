export interface User {
  id: string;
  fullName: string;
}

export interface Car {
  _id: string;
  carName: string;
  make?: string;
  model?: string;
  year?: number;
  rcBookNo?: string;
}

export interface Booking {
  _id: string;
  carId: Car;
  userId: User;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  bookingId: string;
  receiptKey?: string;
  isCarReturned?:boolean;
}
