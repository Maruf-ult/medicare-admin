
// ── Auth ──────────────────────────────────────────────────
export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}


export type UserRole = "Admin" | "Customer" | string;

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: UserRole;

  // Backend may return either expiresAt or expireAt depending on DTO naming.
  expiresAt?: string;
  expireAt?: string;

  id?: number;
  userId?: number;
  phone?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// ── API Response wrapper ──────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: string[];
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ── Dashboard ─────────────────────────────────────────────
export interface DashboardStats {
  totalOrders: number;
  todaysOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;

  totalRevenue: number;
  todaysRevenue: number;
  thisMonthRevenue: number;

  totalPrescriptions: number;
  pendingPrescriptions: number;
  approvedPrescriptions: number;
  rejectedPrescriptions: number;

  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  totalCustomers: number;
  newCustomersToday: number;

  topSellingProducts?: TopProduct[];
  recentOrders?: RecentOrder[];
}

export interface TopProduct {
  id: number;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface RecentOrder {
  id: number;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

// ── Product ───────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  SKU?: string;

  description?: string | null;
  shortDescription?: string | null;

  price: number;
  discountPrice?: number | null;

  stock: number;
  isInStock?: boolean;
  isLowStock?: boolean;

  requiresPrescription: boolean;
  isPrescriptionApproved?: boolean;

  dosageForm?: string | null;
  strength?: string | null;
  packSize?: string | null;
  genericName?: string | null;
  manufacturer?: string | null;
  activeIngredient?: string | null;
  indications?: string | null;
  sideEffects?: string | null;
  warnings?: string | null;
  contraindications?: string | null;
  storageInfo?: string | null;
  pregnancyWarning?: string | null;
  childSafetyInfo?: string | null;

  isActive: boolean;
  isFeatured: boolean;

  averageRating: number;
  reviewCount: number;

  category?: Category | null;
  brand?: Brand | null;

  categoryName?: string | null;
  brandName?: string | null;

  imageUrls: string[];
  primaryImageUrl?: string | null;

  createdAt: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;

  price: number;
  discountPrice?: number | null;

  stock: number;
  isInStock?: boolean;
  isLowStock?: boolean;

  requiresPrescription: boolean;
  isPrescriptionApproved?: boolean;

  dosageForm?: string | null;
  strength?: string | null;
  genericName?: string | null;

  primaryImageUrl?: string | null;
  imageUrls?: string[];

  categoryName?: string | null;
  brandName?: string | null;

  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
}
// ── Category ──────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  parentCategoryId?: number | null;
  sortOrder: number;
  isActive: boolean;
  subCategories: Category[];
}

// ── Brand ─────────────────────────────────────────────────
export interface Brand {
  id: number;
  name: string;
  slug?: string;

  logoUrl?: string | null;
  description?: string | null;

  isActive?: boolean;
  productCount?: number;
}

// ── Cart ──────────────────────────────────────────────────
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug?: string | null;
  productImageUrl?: string | null;

  brandName?: string | null;
  genericName?: string | null;

  price: number;
  discountPrice?: number | null;

  quantity: number;
  stock: number;

  requiresPrescription: boolean;
  prescriptionApproved?: boolean;

  totalPrice?: number;
}

export interface CartResponse {
  id?: number;
  userId?: number;
  items: CartItem[];
  subtotal?: number;
  deliveryCharge?: number;
  discount?: number;
  total?: number;
}

// ── Order ─────────────────────────────────────────────────
export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | string;

export type PaymentMethod =
  | "CashOnDelivery"
  | "bKash"
  | "Bkash"
  | "Nagad"
  | "Upay"
  | "Card"
  | string;

export type PaymentStatus =
  | "Pending"
  | "Submitted"
  | "Paid"
  | "Failed"
  | "Refunded"
  | string;



export interface Order {
  id: number;
  orderNumber?: string | null;

  orderStatus: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;

  note?: string | null;
  cancellationReason?: string | null;

  createdAt: string;
  updatedAt?: string | null;

  address?: OrderAddress;
  shippingAddress?: ShippingAddress | null;

  items?: OrderItem[];
  orderItems?: OrderItem[];

  transactionId?: string | null;
  senderPhoneNumber?: string | null;
}
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSlug?: string | null;
  productImageUrl?: string | null;

  quantity: number;
  unitPrice: number;
  totalPrice: number;

  requiresPrescription?: boolean;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  district?: string;
  city?: string;
  area: string;
  addressLine?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
}

export interface ShippingAddress {
  fullName?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  area?: string | null;
  postalCode?: string | null;
}

// ── Payment / MFS ─────────────────────────────────────────
export type MfsProvider = "bKash" | "Bkash" | "Nagad" | "Upay";

export interface MfsPaymentRequest {
  orderId: number;
  paymentMethod: MfsProvider;
  transactionId: string;
  senderPhoneNumber: string;
}

export interface MfsPaymentDetails {
  id?: number;
  orderId: number;
  orderNumber?: string | null;
  paymentMethod: MfsProvider;
  transactionId: string;
  senderPhoneNumber: string;
  amount?: number;
  paymentStatus?: PaymentStatus;
  orderStatus?: string;
  isVerified?: boolean;
  submittedAt?: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
}

// ── Prescription ──────────────────────────────────────────
export type PrescriptionStatus =
  | "Pending"
  | "UnderReview"
  | "Approved"
  | "Rejected"
  | "NeedClarification"
  | "Quoted"
  | "Ordered"
  | "Completed"
  | string;

  export interface UpdatePrescriptionRequest {
  patientName?: string;
  message?: string;
  file?: File | null;
}

export interface Prescription {
  id: number;
  patientName: string;
  fileUrl: string;

  message?: string | null;
  status: PrescriptionStatus;
  adminNote?: string | null;

  createdAt: string;
  reviewedAt?: string | null;

  approvedItems?: PrescriptionItem[];
  prescriptionItems?: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: number;
  productId: number;
  productName: string;

  dosageForm?: string | null;
  strength?: string | null;

  quantity: number;
  note?: string | null;
  isApproved: boolean;
}

// ── User ──────────────────────────────────────────────────
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
  role: UserRole;
  isActive: boolean;
  profileImageUrl?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
  totalOrders?: number;
  totalSpent?: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
  createdAt?: string;
}

// ── Review ────────────────────────────────────────────────
export interface Review {
  id: number;
  productId?: number;

  rating: number;
  comment?: string | null;

  customerName?: string | null;
  userName?: string | null;

  createdAt: string;
}

// ── Wishlist ──────────────────────────────────────────────
export interface WishlistItem {
  id?: number;
  productId?: number;

  product?: Product;

  productName?: string;
  productSlug?: string;
  productImageUrl?: string | null;

  price?: number;
  discountPrice?: number | null;
  stock?: number;

  requiresPrescription?: boolean;

  brandName?: string | null;
  genericName?: string | null;
}

// ── Notification ──────────────────────────────────────────
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  redirectUrl?: string | null;
  createdAt: string;
}
