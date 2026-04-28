// ── Auth ──────────────────────────────────────────────────
export interface AuthResponse {
  token:     string;
  name:      string;
  email:     string;
  role:      string;
  expiresAt: string;
}

export interface LoginRequest {
  email:    string;
  password: string;
}

// ── API Response wrapper ──────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T | null;
  errors:  string[];
}

export interface PagedResponse<T> {
  items:           T[];
  totalCount:      number;
  pageNumber:      number;
  pageSize:        number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

// ── Dashboard ─────────────────────────────────────────────
export interface DashboardStats {
  totalOrders:           number;
  todaysOrders:          number;
  pendingOrders:         number;
  processingOrders:      number;
  deliveredOrders:       number;
  cancelledOrders:       number;
  totalRevenue:          number;
  todaysRevenue:         number;
  thisMonthRevenue:      number;
  totalPrescriptions:    number;
  pendingPrescriptions:  number;
  approvedPrescriptions: number;
  rejectedPrescriptions: number;
  totalProducts:         number;
  lowStockProducts:      number;
  outOfStockProducts:    number;
  totalCustomers:        number;
  newCustomersToday:     number;
  topSellingProducts:    TopProduct[];
  recentOrders:          RecentOrder[];
}

export interface TopProduct {
  id:        number;
  name:      string;
  totalSold: number;
  revenue:   number;
}

export interface RecentOrder {
  id:           number;
  customerName: string;
  total:        number;
  status:       string;
  createdAt:    string;
}

// ── Product ───────────────────────────────────────────────
export interface Product {
  id:                   number;
  name:                 string;
  slug:                 string;
  sku:                  string;
  description?:         string;
  shortDescription?:    string;
  price:                number;
  discountPrice?:       number;
  stock:                number;
  isInStock:            boolean;
  isLowStock:           boolean;
  requiresPrescription: boolean;
  dosageForm?:          string;
  strength?:            string;
  packSize?:            string;
  genericName?:         string;
  manufacturer?:        string;
  activeIngredient?:    string;
  indications?:         string;
  sideEffects?:         string;
  warnings?:            string;
  contraindications?:   string;
  storageInfo?:         string;
  pregnancyWarning?:    string;
  childSafetyInfo?:     string;
  isActive:             boolean;
  isFeatured:           boolean;
  averageRating:        number;
  reviewCount:          number;
  category?:            Category;
  brand?:               Brand;
  imageUrls:            string[];
  createdAt:            string;
}

export interface ProductListItem {
  id:                   number;
  name:                 string;
  slug:                 string;
  price:                number;
  discountPrice?:       number;
  stock:                number;
  isInStock:            boolean;
  isLowStock:           boolean;
  requiresPrescription: boolean;
  dosageForm?:          string;
  strength?:            string;
  genericName?:         string;
  primaryImageUrl?:     string;
  categoryName?:        string;
  brandName?:           string;
  averageRating:        number;
  reviewCount:          number;
  isFeatured:           boolean;
}

// ── Category ──────────────────────────────────────────────
export interface Category {
  id:               number;
  name:             string;
  slug:             string;
  imageUrl?:        string;
  description?:     string;
  parentCategoryId?: number;
  sortOrder:        number;
  isActive:         boolean;
  subCategories:    Category[];
}

// ── Brand ─────────────────────────────────────────────────
export interface Brand {
  id:           number;
  name:         string;
  slug:         string;
  logoUrl?:     string;
  description?: string;
  isActive:     boolean;
}

// ── Order ─────────────────────────────────────────────────
export interface Order {
  id:                 number;
  orderStatus:        string;
  paymentMethod:      string;
  paymentStatus:      string;
  subtotal:           number;
  discount:           number;
  deliveryCharge:     number;
  total:              number;
  note?:              string;
  cancellationReason?: string;
  createdAt:          string;
  address:            OrderAddress;
  items:              OrderItem[];
}

export interface OrderItem {
  id:              number;
  productId:       number;
  productName:     string;
  productImageUrl?: string;
  quantity:        number;
  unitPrice:       number;
  totalPrice:      number;
}

export interface OrderAddress {
  fullName:    string;
  phone:       string;
  district:    string;
  area:        string;
  addressLine: string;
  postalCode?: string;
}

// ── Prescription ──────────────────────────────────────────
export interface Prescription {
  id:           number;
  patientName:  string;
  fileUrl:      string;
  message?:     string;
  status:       string;
  adminNote?:   string;
  createdAt:    string;
  reviewedAt?:  string;
  approvedItems: PrescriptionItem[];
}

export interface PrescriptionItem {
  id:          number;
  productId:   number;
  productName: string;
  dosageForm?: string;
  strength?:   string;
  quantity:    number;
  note?:       string;
  isApproved:  boolean;
}

// ── User ──────────────────────────────────────────────────
export interface AdminUser {
  id:              number;
  name:            string;
  email:           string;
  phone:           string;
  role:            string;
  isActive:        boolean;
  profileImageUrl?: string;
  createdAt:       string;
  lastLoginAt?:    string;
  totalOrders:     number;
  totalSpent:      number;
}

// ── Notification ──────────────────────────────────────────
export interface Notification {
  id:           number;
  title:        string;
  message:      string;
  type:         string;
  isRead:       boolean;
  redirectUrl?: string;
  createdAt:    string;
}