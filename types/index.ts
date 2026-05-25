
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
  stockQuantity?: number;
  lowStockThreshold?: number;
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

  /** Free-text category (matches backend `category`). */
  category?: string | null;
  /** Brand / trade name (matches backend `brand`). */
  brand?: string | null;

  /** @deprecated Prefer `category` — kept for older API payloads */
  categoryName?: string | null;
  /** @deprecated Prefer `brand` */
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
  stockQuantity?: number;
  lowStockThreshold?: number;
  isInStock?: boolean;
  isLowStock?: boolean;

  requiresPrescription: boolean;
  isPrescriptionApproved?: boolean;

  dosageForm?: string | null;
  strength?: string | null;
  genericName?: string | null;

  primaryImageUrl?: string | null;
  imageUrls?: string[];

  category?: string | null;
  brand?: string | null;

  /** @deprecated Prefer `category` */
  categoryName?: string | null;
  /** @deprecated Prefer `brand` */
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
  primaryImageUrl?: string | null;
  imageUrls?: string[];

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
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
}
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSlug?: string | null;
  primaryImageUrl?: string | null;
  imageUrls?: string[];

  quantity: number;
  unitPrice: number;
  totalPrice: number;

  requiresPrescription?: boolean;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  addressLine: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  addressLine: string;
}

// ── Payment / MFS ─────────────────────────────────────────
export type MfsProvider = "bKash" | "Bkash" | "Nagad" | "Upay";

export interface MfsPaymentRequest {
  orderId: number;
  paymentMethod: MfsProvider;
  transactionId: string;
  senderPhoneNumber: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  message?: string;
  paymentUrl?: string;
  sessionId?: string;
  orderId: number;
  amount: number;
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
  productSlug?: string | null;

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
  primaryImageUrl?: string | null;
  imageUrls?: string[];

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
