
export type NotificationSeverity =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR';

export type NotificationIconKey =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_REQUEST'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_CREDITED'
  | 'TRIP_REMINDER'
  | 'CAR_APPROVED'
  | 'CAR_REJECTED'
  | 'CAR_APPROVAL_PENDING'
  | 'CAR_OWNER_APPROVAL'
  | 'DISPUTE_REPORTED'
  | 'ALERT';

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;

  // backend-driven
  type: string;
  severity: NotificationSeverity;
  iconKey: NotificationIconKey;

  metadata?: Record<string, any>;
}
