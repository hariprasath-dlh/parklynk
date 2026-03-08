import axios from 'axios';
import { Booking, BookingStatus, Notification, ParkingSlot, User, UserRole, VehicleType } from '@/types';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('parklynk-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (import.meta.env.DEV) {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data ?? config.params);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('API Response:', response.data);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Error:', error?.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

const normalizeRole = (role?: string): UserRole =>
  role === 'owner' ? 'house_owner' : 'vehicle_user';

const mapFrontendRoleToBackend = (role: UserRole) =>
  role === 'house_owner' ? 'owner' : 'user';

const mapUser = (raw: any): User => ({
  id: raw?._id || raw?.id,
  name: raw?.name || '',
  email: raw?.email || '',
  phone: raw?.phone || '',
  role: normalizeRole(raw?.role),
  avatar: raw?.avatar,
  username: raw?.username,
  gender: raw?.gender,
  verificationStatus: raw?.isVerified ? 'verified' : raw?.verificationStatus || 'pending',
  licenseVerified: raw?.licenseVerified ?? raw?.isVerified ?? false,
  licenseNumber: raw?.licenseNumber || undefined,
  licenseImage: raw?.licenseImage,
  createdAt: raw?.createdAt || new Date().toISOString(),
});

const mapVehicleTypesFromBackend = (vehicleType?: string): VehicleType[] => {
  if (vehicleType === '2W') return ['bike'];
  if (vehicleType === '4W') return ['car', 'suv', 'truck'];
  return ['bike', 'car', 'suv', 'truck'];
};

const mapVehicleTypeToBackend = (types: VehicleType[]): '2W' | '4W' | 'BOTH' => {
  const has2W = types.includes('bike');
  const has4W = types.some((type) => ['car', 'suv', 'truck'].includes(type));
  if (has2W && has4W) return 'BOTH';
  if (has2W) return '2W';
  return '4W';
};

const mapSlot = (raw: any): ParkingSlot => ({
  id: raw?._id || raw?.id,
  ownerId: raw?.owner?._id || raw?.owner || raw?.ownerId || '',
  ownerName: raw?.owner?.name || raw?.ownerName || '',
  ownerPhone: raw?.owner?.phone || raw?.ownerPhone || '',
  title: raw?.title || '',
  images: raw?.images || [],
  state: raw?.state || '',
  district: raw?.district || '',
  city: raw?.location?.city || raw?.city || '',
  address: raw?.location?.address || raw?.address || '',
  totalSpaces: raw?.totalSpaces || 1,
  availableSpaces: raw?.availableSpaces || 1,
  vehicleTypes: raw?.vehicleTypes || mapVehicleTypesFromBackend(raw?.vehicleType),
  pricePerHour: raw?.pricePerHour || raw?.pricing?.baseHourly || 0,
  isAvailable: raw?.isAvailable ?? raw?.isActive ?? true,
  rating: raw?.rating || 0,
  createdAt: raw?.createdAt || new Date().toISOString(),
});

const mapBookingStatus = (status?: string): BookingStatus => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'approved') return 'approved';
  if (normalized === 'rejected') return 'rejected';
  if (normalized === 'active') return 'active';
  if (normalized === 'overstayed') return 'overstayed';
  if (normalized === 'completed') return 'completed';
  if (normalized === 'cancelled') return 'cancelled';
  if (normalized === 'paid') return 'paid';
  return 'pending';
};

const mapBooking = (raw: any): Booking => ({
  id: raw?._id || raw?.id,
  slotId: raw?.slot?._id || raw?.slot || raw?.slotId || '',
  slotTitle: raw?.slot?.title || raw?.slotTitle || 'Parking Slot',
  userId: raw?.user?._id || raw?.user || raw?.userId || '',
  userName: raw?.user?.name || raw?.userName || '',
  vehicleNumber: raw?.vehicleNumber || '',
  vehicleType: raw?.vehicleType || 'car',
  startTime: raw?.startTime,
  endTime: raw?.endTime,
  totalAmount: raw?.totalAmount || 0,
  platformFee: raw?.platformFee || 0,
  status: mapBookingStatus(raw?.status),
  gracePeriodEnd: raw?.gracePeriodEnd,
  paymentMethod: raw?.paymentMethod,
  paymentStatus: raw?.paymentStatus
    ? String(raw.paymentStatus).toLowerCase() === 'paid'
      ? 'confirmed'
      : 'submitted'
    : undefined,
  createdAt: raw?.createdAt || new Date().toISOString(),
});

const mapNotification = (raw: any): Notification => ({
  id: raw?._id || raw?.id,
  userId: raw?.user?._id || raw?.user || raw?.userId || '',
  category: raw?.category || 'system',
  title: raw?.title || '',
  message: raw?.message || '',
  isRead: Boolean(raw?.isRead),
  createdAt: raw?.createdAt || new Date().toISOString(),
});

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const payload = res.data?.data;
      const user = mapUser(payload);
      return { success: true, user, token: payload?.token };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Login failed') };
    }
  },

  signup: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    licenseImage?: string;
  }) => {
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: mapFrontendRoleToBackend(data.role),
      });
      const payload = res.data?.data;
      const user = mapUser(payload);
      return { success: true, user, token: payload?.token };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Signup failed') };
    }
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return { success: true, user: mapUser(res.data?.data) };
  },

  verifyLicense: async (imageData: string) => {
    const res = await api.post('/auth/verify-license', { imageData });
    return { success: Boolean(res.data?.success), user: mapUser(res.data?.data) };
  },

  updateProfile: async () => {
    return { success: false, error: 'Profile update API is not available on the backend yet.' };
  },

  deleteAccount: async () => {
    try {
      const res = await api.delete('/auth/delete-account');
      return { success: Boolean(res.data?.success), message: res.data?.message };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Failed to delete account') };
    }
  },
};

export const slotsAPI = {
  getAll: async (filters?: {
    state?: string;
    district?: string;
    city?: string;
    query?: string;
    ownerId?: string;
    includeInactive?: boolean;
  }) => {
    const res = await api.get('/slots', {
      params: {
        city: filters?.city || undefined,
        ownerId: filters?.ownerId || undefined,
        includeInactive: filters?.includeInactive ? 'true' : undefined,
      },
    });
    let slots = (res.data?.data || []).map(mapSlot);
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      slots = slots.filter(
        (slot) =>
          slot.title.toLowerCase().includes(q) ||
          slot.city.toLowerCase().includes(q) ||
          slot.address.toLowerCase().includes(q)
      );
    }
    if (filters?.state) {
      slots = slots.filter((slot) => !slot.state || slot.state === filters.state);
    }
    if (filters?.district) {
      slots = slots.filter((slot) => !slot.district || slot.district === filters.district);
    }
    return { success: true, slots };
  },

  getById: async (id: string) => {
    const res = await api.get(`/slots/${id}`);
    return { success: true, slot: mapSlot(res.data?.data), raw: res.data?.data };
  },

  create: async (data: {
    title: string;
    description: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    pricePerHour: number;
    images?: string[];
    vehicleTypes: VehicleType[];
  }) => {
    const payload = {
      title: data.title,
      description: data.description,
      vehicleType: mapVehicleTypeToBackend(data.vehicleTypes),
      location: {
        address: data.address,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      pricing: {
        baseHourly: data.pricePerHour,
        baseDaily: data.pricePerHour * 8,
        baseMonthly: data.pricePerHour * 8 * 30,
        peakMultiplier: 1,
        weekendMultiplier: 1,
      },
      images: data.images || [],
    };
    const res = await api.post('/slots', payload);
    return { success: Boolean(res.data?.success), slot: mapSlot(res.data?.data) };
  },

  toggleAvailability: async (id: string, available: boolean) => {
    const res = await api.put(`/slots/${id}`, { isActive: available });
    return { success: Boolean(res.data?.success), slot: mapSlot(res.data?.data) };
  },

  getOwnerSlots: async (ownerId: string) => {
    const res = await api.get('/slots', {
      params: { ownerId, includeInactive: 'true' },
    });
    return { success: true, slots: (res.data?.data || []).map(mapSlot) };
  },
};

export const bookingsAPI = {
  getUserBookings: async () => {
    const res = await api.get('/bookings/user');
    return { success: true, bookings: (res.data?.data || []).map(mapBooking) };
  },

  getOwnerBookings: async () => {
    const res = await api.get('/bookings/owner');
    return { success: true, bookings: (res.data?.data || []).map(mapBooking) };
  },

  create: async (data: {
    slotId: string;
    vehicleNumber: string;
    vehicleType: VehicleType;
    startTime: string;
    endTime: string;
  }) => {
    const res = await api.post('/bookings', {
      slotId: data.slotId,
      vehicleNumber: data.vehicleNumber,
      startTime: data.startTime,
      endTime: data.endTime,
    });
    return { success: Boolean(res.data?.success), booking: mapBooking(res.data?.data) };
  },

  updateStatus: async (id: string, status: BookingStatus) => {
    const backendStatus =
      status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : status;
    const res = await api.patch(`/bookings/${id}/status`, { status: backendStatus });
    return { success: Boolean(res.data?.success), booking: mapBooking(res.data?.data) };
  },

  cancel: async () => {
    return { success: false, error: 'Cancel booking API is not available on the backend yet.' };
  },
};

export const paymentsAPI = {
  submitPayment: async (bookingId: string, method: 'upi' | 'cod') => {
    if (method === 'cod') {
      return { success: false, error: 'COD is not supported by the backend payment flow.' };
    }

    const orderRes = await api.post('/payment/create-order', { bookingId });
    const verifyPayload = orderRes.data?.simulatedVerifyPayload;

    if (!verifyPayload) {
      return { success: false, error: 'Payment order created but no verification payload was returned.' };
    }

    const verifyRes = await api.post('/payment/verify', verifyPayload);
    return {
      success: Boolean(verifyRes.data?.success),
      payment: {
        id: verifyPayload.razorpay_payment_id,
        bookingId,
        method,
        status: 'confirmed',
        transactionId: verifyPayload.razorpay_payment_id,
        createdAt: new Date().toISOString(),
      },
    };
  },
};

export const notificationsAPI = {
  getAll: async () => {
    const res = await api.get('/notifications');
    return { success: true, notifications: (res.data?.data || []).map(mapNotification) };
  },
  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return { success: true, count: Number(res.data?.count || 0) };
  },
  markRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return { success: Boolean(res.data?.success) };
  },
  markAllRead: async () => {
    const res = await api.patch('/notifications/mark-all-read');
    return { success: Boolean(res.data?.success) };
  },
  delete: async (id: string) => {
    const res = await api.delete(`/notifications/${id}`);
    return { success: Boolean(res.data?.success) };
  },
};

export const settlementsAPI = {
  getAll: async () => {
    const profileRes = await api.get('/auth/profile');
    const user = profileRes.data?.data || {};
    const history = Array.isArray(user.settlementHistory) ? user.settlementHistory : [];

    return {
      success: true,
      pendingDues: Number(user.pendingDues || 0),
      settlements: history.map((entry: any, index: number) => ({
        id: String(index + 1),
        amount: Number(entry.amount || 0),
        status: 'paid' as const,
        paidAt: entry.paidAt,
        createdAt: entry.paidAt || new Date().toISOString(),
      })),
    };
  },
  pay: async (amount: number) => {
    const res = await api.post('/settlements/pay', { amount });
    return {
      success: Boolean(res.data?.success),
      pendingDues: Number(res.data?.pendingDues || 0),
    };
  },
};

export const dashboardAPI = {
  getOwner: async () => {
    const res = await api.get('/dashboard/owner');
    return {
      success: Boolean(res.data?.success),
      data: res.data?.data,
    };
  },
};

export default api;
