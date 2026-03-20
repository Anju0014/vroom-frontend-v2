import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bell,
  CreditCard,
  CalendarX,
  UserCheck,
  CalendarClock,
  FileWarning,
} from 'lucide-react';

import { NotificationIconKey , NotificationSeverity} from '@/types/notificationTypes';

export const notificationIconMap: Record<
  NotificationIconKey,
  React.ComponentType<any>
> = {
  BOOKING_CONFIRMED: CheckCircle,
  BOOKING_REJECTED: XCircle,
  BOOKING_REQUEST: CalendarClock,
  BOOKING_CANCELLED: CalendarX,

  PAYMENT_SUCCESS: CreditCard,
  PAYMENT_CREDITED: CreditCard,

  TRIP_REMINDER: CalendarClock,

  CAR_APPROVED: CheckCircle,
  CAR_REJECTED: XCircle,
  CAR_APPROVAL_PENDING: AlertTriangle,
  CAR_OWNER_APPROVAL: UserCheck,

  DISPUTE_REPORTED: FileWarning,
  ALERT: Bell,
};


export const severityStyles: Record<NotificationSeverity, string> = {
  SUCCESS: 'text-green-600 bg-green-50',
  WARNING: 'text-yellow-600 bg-yellow-50',
  ERROR: 'text-red-600 bg-red-50',
  INFO: 'text-blue-600 bg-blue-50',
};