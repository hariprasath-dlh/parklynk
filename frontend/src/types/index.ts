export type UserRole = 'vehicle_user' | 'house_owner';

export type VerificationStatus = 'pending' | 'scanning' | 'verified' | 'rejected';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'overstayed' | 'completed' | 'cancelled' | 'paid';

export type VehicleType = 'car' | 'bike' | 'suv' | 'truck';

export type NotificationCategory = 'booking' | 'reminder' | 'payment' | 'overstay' | 'system';

export type PaymentMethod = 'upi' | 'cod';
export type PaymentStatus = 'submitted' | 'verified' | 'awaiting_confirmation' | 'confirmed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  username?: string;
  gender?: string;
  verificationStatus: VerificationStatus;
  licenseVerified?: boolean;
  licenseNumber?: string;
  licenseImage?: string;
  createdAt: string;
}

export interface ParkingSlot {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  title: string;
  images: string[];
  state: string;
  district: string;
  city: string;
  address: string;
  totalSpaces: number;
  availableSpaces: number;
  vehicleTypes: VehicleType[];
  pricePerHour: number;
  isAvailable: boolean;
  rating: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  slotId: string;
  slotTitle: string;
  userId: string;
  userName: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  startTime: string;
  endTime: string;
  totalAmount: number;
  platformFee: number;
  status: BookingStatus;
  gracePeriodEnd?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface MockEmail {
  id: string;
  userId: string;
  subject: string;
  from: string;
  preview: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface Settlement {
  id: string;
  ownerId: string;
  amount: number;
  status: 'pending' | 'paid';
  paidAt?: string;
  createdAt: string;
}

export interface LocationOption {
  state: string;
  districts: {
    name: string;
    cities: string[];
  }[];
}

export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
}
