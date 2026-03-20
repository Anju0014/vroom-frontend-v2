export interface Car {
  _id?: string;
  id?: string;
  carName: string;
  unavailableDates?: string[];
}

export interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'pending' | 'cancelled' |'failed';
}

export interface AvailabilityModalProps {
  isOpen: boolean;
  car: Car;
  bookings: Booking[];
  onClose: () => void;
  onUpdate: (newUnavailableDates: string[]) => void;
}