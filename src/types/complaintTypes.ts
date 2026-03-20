export type ComplaintStatus = "open" | "in_review" | "resolved" | "rejected";
export type ComplaintCategory = "car" | "payment" | "app" | "behavior" | "other";
export type ComplaintPriority = "low" | "medium" | "high";
export type UserRole = "customer" | "owner";

export interface Complaint {
  _id: string;
  bookingId: string;
  carId: string;

  raisedBy: string;
  raisedByRole: UserRole;

  title: string;
  description: string;
  category: ComplaintCategory;

  status: ComplaintStatus;
  priority: ComplaintPriority;

  adminResponse?: string;
  complaintProof?:string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintDTO {
  bookingId: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  complaintProof:string;
}


export type RaisedByRole = "customer" | "carOwner";

export interface RaisedByUserDTO {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: RaisedByRole;
}

export interface ComplaintAdminResponseDTO {
  _id: string;
  bookingId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  adminResponse?: string;
  resolvedAt?: string | null;
  createdAt: string;
  raisedByRole: RaisedByRole;
  complaintPoof?:string;
  raisedByUser: RaisedByUserDTO | null;
}




export interface UpdateComplaintModalProps {
  complaint: {
    _id: string;
    title: string;
    category: string;
    status: string;  // Changed from ComplaintStatus to string
    priority: string;  // Changed from ComplaintPriority to string
    createdAt: string;
    description?: string;
    adminResponse?: string;
    raisedByUser?: {
      _id?: string;
      fullName: string;
      email: string;
      phoneNumber?: string;
      role?: string;
    } | null;
    bookingId?: string;
    resolvedAt?: string | null;
    complaintProof?:string;
    raisedByRole?: string;
  };
  onClose: () => void;
  onUpdated: () => void;
}


export interface UpdateComplaintPayload {
  status: ComplaintStatus;
  priority: ComplaintPriority;
  adminResponse?: string;
}
