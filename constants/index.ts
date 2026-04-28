// ── API Routes ────────────────────────────────────────────
export const API_ROUTES = {
  AUTH: {
    LOGIN:    '/auth/login',
    REGISTER: '/auth/register',
  },
  DASHBOARD:     '/dashboard',
  PRODUCTS:      '/products',
  CATEGORIES:    '/categories',
  BRANDS:        '/brands',
  ORDERS:        '/orders',
  PRESCRIPTIONS: '/prescriptions',
  USERS:         '/users',
  NOTIFICATIONS: '/notifications',
} as const;

// ── Order statuses ────────────────────────────────────────
export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Returned',
] as const;

// ── Prescription statuses ─────────────────────────────────
export const PRESCRIPTION_STATUSES = [
  'Pending',
  'UnderReview',
  'Approved',
  'Rejected',
  'NeedClarification',
  'Quoted',
  'Ordered',
  'Completed',
] as const;

// ── Payment statuses ──────────────────────────────────────
export const PAYMENT_STATUSES = [
  'Unpaid',
  'Pending',
  'Paid',
  'Failed',
  'Refunded',
] as const;

// ── Dosage forms ──────────────────────────────────────────
export const DOSAGE_FORMS = [
  'Syrup',
  'Tablet',
  'Capsule',
  'Injection',
  'Cream',
  'Drops',
  'Inhaler',
  'Powder',
  'Suspension',
  'Ointment',
] as const;

// ── Status colors ─────────────────────────────────────────
export const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending:    'bg-yellow-100 text-yellow-800',
  Confirmed:  'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Packed:     'bg-indigo-100 text-indigo-800',
  Shipped:    'bg-cyan-100 text-cyan-800',
  Delivered:  'bg-green-100 text-green-800',
  Cancelled:  'bg-red-100 text-red-800',
  Returned:   'bg-gray-100 text-gray-800',
};

export const PRESCRIPTION_STATUS_COLORS: Record<string, string> = {
  Pending:           'bg-yellow-100 text-yellow-800',
  UnderReview:       'bg-blue-100 text-blue-800',
  Approved:          'bg-green-100 text-green-800',
  Rejected:          'bg-red-100 text-red-800',
  NeedClarification: 'bg-orange-100 text-orange-800',
  Quoted:            'bg-purple-100 text-purple-800',
  Ordered:           'bg-indigo-100 text-indigo-800',
  Completed:         'bg-gray-100 text-gray-800',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Unpaid:   'bg-red-100 text-red-800',
  Pending:  'bg-yellow-100 text-yellow-800',
  Paid:     'bg-green-100 text-green-800',
  Failed:   'bg-red-100 text-red-800',
  Refunded: 'bg-gray-100 text-gray-800',
};