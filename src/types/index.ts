// ============ TYPES ============
export type Role = 'ceo' | 'cashier' | 'warehouse' | 'customer';
export type Lang = 'uz' | 'ru' | 'en';
export type Theme = 'light' | 'dark';
export type PaymentMethod = 'cash' | 'card' | 'mixed';
export type OrderStatus = 'new' | 'confirmed' | 'picking' | 'ready' | 'delivering' | 'completed' | 'cancelled';
export type StockMovementType = 'in' | 'out' | 'adjustment' | 'damage' | 'transfer';
export type SaleStatus = 'completed' | 'refunded' | 'voided';

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: Role;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  active: boolean;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  categoryId: string;
  brandId?: string;
  image?: string;
  volume: string;
  unit: 'pcs' | 'box' | 'pack';
  itemsPerBox: number;
  purchasePrice: number;
  salePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  minStock: number;
  stock: number;
  description?: string;
  active: boolean;
  expiryDate?: string;
  supplierId?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number;
  active: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isWholesale: boolean;
  discount: number;
  bonusPoints: number;
  debt: number;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  barcode: string;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
  cardAmount?: number;
  cashAmount?: number;
  customerId?: string;
  cashierId: string;
  cashierName: string;
  sessionId: string;
  status: SaleStatus;
  createdAt: string;
}

export interface CashSession {
  id: string;
  cashierId: string;
  cashierName: string;
  openingBalance: number;
  closingBalance?: number;
  totalSales: number;
  totalReturns: number;
  totalCash: number;
  totalCard: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceId?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  total: number;
  invoiceNumber: string;
  status: 'pending' | 'received' | 'partial';
  receivedAt?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  total: number;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  deliveryType: 'delivery' | 'pickup';
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface AppSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  receiptFormat: '58mm' | '80mm';
  lowStockAlert: boolean;
  expiryAlert: boolean;
  expiryAlertDays: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}
