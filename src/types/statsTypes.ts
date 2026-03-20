export interface StatsData {
  totalCars: number;
  totalCustomers?: number;
  totalCarOwners?: number;
  totalBookings: number;
    totalRevenue?: number;

  // enable later
  // totalRevenue?: number;
  activeRentals?: number;
  // monthlyRevenue?: { month: string; revenue: number }[];
    earnings: {
    date: string;
    amount: number;
  }[];

  carStats: {
    available: number;
    verified:number
    booked: number;
    maintenance: number;
  };

}

export interface RecentBooking {
  id: string;
  bookingId: string;
  car: { carName: string; brand: string };
  carOwner: { fullName: string };
  customer: { fullName: string };
  status: string;
  totalPrice: number;
  createdAt: string;
}