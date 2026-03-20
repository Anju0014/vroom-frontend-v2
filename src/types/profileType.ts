export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  address?: Address;
  idProof?: string;
}