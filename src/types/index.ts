export type { BookingStatus, ConsultationMode, OrderStatus, PaymentStatus, ProductCategory, Role, SkinType, BlogStatus } from "@prisma/client";

export interface NavItem {
  label: string;
  href: string;
}

export interface Testimonial {
  id: string;
  name: string;
  skinConcern: string;
  quote: string;
  rating: number;
  image?: string;
  beforeImage?: string;
  afterImage?: string;
}

export interface TimeSlot {
  value: string;
  label: string;
  available: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  totalOrders: number;
  revenue: number;
  totalCustomers: number;
  lowStockItems: number;
}
