import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  User, Product, Category, Brand, Supplier, Customer, Sale, SaleItem,
  CashSession, StockMovement, PurchaseOrder, Expense, OnlineOrder,
  AuditLog, AppSettings, CartItem, Lang, Theme, Role
} from '../types';

// Seed data
const defaultCategories: Category[] = [
  { id: 'cat1', name: 'Gazlangan ichimliklar', active: true },
  { id: 'cat2', name: 'Gazsiz suv', active: true },
  { id: 'cat3', name: 'Mineral suv', active: true },
  { id: 'cat4', name: 'Sharbatlar', active: true },
  { id: 'cat5', name: 'Energetik ichimliklar', active: true },
  { id: 'cat6', name: 'Muzli choy', active: true },
  { id: 'cat7', name: 'Sport ichimliklari', active: true },
  { id: 'cat8', name: 'Kofe ichimliklari', active: true },
];

const defaultBrands: Brand[] = [
  { id: 'br1', name: 'Coca-Cola', active: true },
  { id: 'br2', name: 'Pepsi', active: true },
  { id: 'br3', name: 'Aquamina', active: true },
  { id: 'br4', name: 'Red Bull', active: true },
  { id: 'br5', name: 'Lipton', active: true },
  { id: 'br6', name: 'Rich', active: true },
];

const defaultProducts: Product[] = [
  { id: 'p1', sku: 'CC-330', barcode: '4600000000001', name: 'Coca-Cola 330ml', categoryId: 'cat1', brandId: 'br1', volume: '0.33L', unit: 'pcs', itemsPerBox: 24, purchasePrice: 4500, salePrice: 7000, wholesalePrice: 6000, retailPrice: 7000, minStock: 48, stock: 240, active: true, supplierId: 's1', createdAt: '2024-01-01' },
  { id: 'p2', sku: 'CC-500', barcode: '4600000000002', name: 'Coca-Cola 500ml', categoryId: 'cat1', brandId: 'br1', volume: '0.5L', unit: 'pcs', itemsPerBox: 20, purchasePrice: 6000, salePrice: 9000, wholesalePrice: 7500, retailPrice: 9000, minStock: 40, stock: 180, active: true, supplierId: 's1', createdAt: '2024-01-01' },
  { id: 'p3', sku: 'CC-1500', barcode: '4600000000003', name: 'Coca-Cola 1.5L', categoryId: 'cat1', brandId: 'br1', volume: '1.5L', unit: 'pcs', itemsPerBox: 6, purchasePrice: 12000, salePrice: 18000, wholesalePrice: 15000, retailPrice: 18000, minStock: 24, stock: 120, active: true, supplierId: 's1', createdAt: '2024-01-01' },
  { id: 'p4', sku: 'PE-330', barcode: '4600000000004', name: 'Pepsi 330ml', categoryId: 'cat1', brandId: 'br2', volume: '0.33L', unit: 'pcs', itemsPerBox: 24, purchasePrice: 4200, salePrice: 6500, wholesalePrice: 5500, retailPrice: 6500, minStock: 48, stock: 192, active: true, supplierId: 's2', createdAt: '2024-01-01' },
  { id: 'p5', sku: 'PE-1500', barcode: '4600000000005', name: 'Pepsi 1.5L', categoryId: 'cat1', brandId: 'br2', volume: '1.5L', unit: 'pcs', itemsPerBox: 6, purchasePrice: 11000, salePrice: 17000, wholesalePrice: 14000, retailPrice: 17000, minStock: 24, stock: 96, active: true, supplierId: 's2', createdAt: '2024-01-01' },
  { id: 'p6', sku: 'AQ-500', barcode: '4600000000006', name: 'Aquamina 0.5L', categoryId: 'cat2', brandId: 'br3', volume: '0.5L', unit: 'pcs', itemsPerBox: 20, purchasePrice: 2000, salePrice: 3500, wholesalePrice: 2800, retailPrice: 3500, minStock: 60, stock: 400, active: true, supplierId: 's3', createdAt: '2024-01-01' },
  { id: 'p7', sku: 'AQ-1500', barcode: '4600000000007', name: 'Aquamina 1.5L', categoryId: 'cat2', brandId: 'br3', volume: '1.5L', unit: 'pcs', itemsPerBox: 6, purchasePrice: 4000, salePrice: 7000, wholesalePrice: 5500, retailPrice: 7000, minStock: 30, stock: 150, active: true, supplierId: 's3', createdAt: '2024-01-01' },
  { id: 'p8', sku: 'RB-250', barcode: '4600000000008', name: 'Red Bull 250ml', categoryId: 'cat5', brandId: 'br4', volume: '0.25L', unit: 'pcs', itemsPerBox: 24, purchasePrice: 18000, salePrice: 28000, wholesalePrice: 24000, retailPrice: 28000, minStock: 24, stock: 72, active: true, supplierId: 's4', createdAt: '2024-01-01' },
  { id: 'p9', sku: 'LP-330', barcode: '4600000000009', name: 'Lipton Lemon 330ml', categoryId: 'cat6', brandId: 'br5', volume: '0.33L', unit: 'pcs', itemsPerBox: 24, purchasePrice: 4000, salePrice: 6500, wholesalePrice: 5500, retailPrice: 6500, minStock: 48, stock: 168, active: true, supplierId: 's5', createdAt: '2024-01-01' },
  { id: 'p10', sku: 'RC-1000', barcode: '4600000000010', name: 'Rich Orange 1L', categoryId: 'cat4', brandId: 'br6', volume: '1L', unit: 'pcs', itemsPerBox: 12, purchasePrice: 8000, salePrice: 13000, wholesalePrice: 11000, retailPrice: 13000, minStock: 24, stock: 96, active: true, supplierId: 's5', createdAt: '2024-01-01' },
  { id: 'p11', sku: 'CC-2000', barcode: '4600000000011', name: 'Coca-Cola 2L', categoryId: 'cat1', brandId: 'br1', volume: '2L', unit: 'pcs', itemsPerBox: 6, purchasePrice: 15000, salePrice: 23000, wholesalePrice: 19000, retailPrice: 23000, minStock: 18, stock: 60, active: true, supplierId: 's1', createdAt: '2024-01-01' },
  { id: 'p12', sku: 'AQ-5000', barcode: '4600000000012', name: 'Aquamina 5L', categoryId: 'cat3', brandId: 'br3', volume: '5L', unit: 'pcs', itemsPerBox: 4, purchasePrice: 8000, salePrice: 14000, wholesalePrice: 11000, retailPrice: 14000, minStock: 12, stock: 48, active: true, supplierId: 's3', createdAt: '2024-01-01' },
];

const defaultSuppliers: Supplier[] = [
  { id: 's1', name: 'Coca-Cola Uzbekistan', phone: '+998 71 123 45 67', email: 'supply@cocacola.uz', address: 'Toshkent, Chilonzor', balance: 0, active: true, createdAt: '2024-01-01' },
  { id: 's2', name: 'PepsiCo Uzbekistan', phone: '+998 71 234 56 78', email: 'supply@pepsi.uz', address: 'Toshkent, Yunusobod', balance: 0, active: true, createdAt: '2024-01-01' },
  { id: 's3', name: 'Aquamina LLC', phone: '+998 71 345 67 89', email: 'info@aquamina.uz', address: 'Toshkent, Mirzo Ulugbek', balance: 0, active: true, createdAt: '2024-01-01' },
  { id: 's4', name: 'Red Bull Distribution', phone: '+998 71 456 78 90', email: 'order@redbull.uz', address: 'Toshkent, Shayxontohur', balance: 0, active: true, createdAt: '2024-01-01' },
  { id: 's5', name: 'BevMax Distributor', phone: '+998 71 567 89 01', email: 'sales@bevmax.uz', address: 'Toshkent, Bektemir', balance: 0, active: true, createdAt: '2024-01-01' },
];

const defaultCustomers: Customer[] = [
  { id: 'c1', name: 'Walk-in Customer', phone: '', isWholesale: false, discount: 0, bonusPoints: 0, debt: 0, createdAt: '2024-01-01' },
  { id: 'c2', name: 'Olim Karimov', phone: '+998 90 123 45 67', email: 'olim@mail.uz', address: 'Toshkent, Yakkasaroy', isWholesale: false, discount: 5, bonusPoints: 150, debt: 0, createdAt: '2024-01-15' },
  { id: 'c3', name: 'Cafe "Bahor"', phone: '+998 91 234 56 78', address: 'Toshkent, Mirabad', isWholesale: true, discount: 15, bonusPoints: 0, debt: 250000, createdAt: '2024-02-01' },
];

const defaultUsers: User[] = [
  { id: 'u1', username: 'admin', password: 'admin123', fullName: 'CEO Administrator', role: 'ceo', phone: '+998 90 000 00 00', active: true, createdAt: '2024-01-01' },
  { id: 'u2', username: 'kassir', password: 'kassir123', fullName: 'Aziza Kassir', role: 'cashier', phone: '+998 90 111 11 11', active: true, createdAt: '2024-01-01' },
  { id: 'u3', username: 'ombor', password: 'ombor123', fullName: 'Javohir Omborchi', role: 'warehouse', phone: '+998 90 222 22 22', active: true, createdAt: '2024-01-01' },
];

const defaultSettings: AppSettings = {
  storeName: 'DrinkMarket Pro',
  storeAddress: 'Toshkent sh., Amir Temur ko\'chasi 100',
  storePhone: '+998 71 200 00 00',
  currency: 'UZS',
  currencySymbol: 'so\'m',
  taxRate: 0,
  receiptFormat: '80mm',
  lowStockAlert: true,
  expiryAlert: true,
  expiryAlertDays: 30,
};

interface AppState {
  // Auth
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // UI
  lang: Lang;
  theme: Theme;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;

  // Data
  users: User[];
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  customers: Customer[];
  sales: Sale[];
  cashSessions: CashSession[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  expenses: Expense[];
  onlineOrders: OnlineOrder[];
  auditLogs: AuditLog[];
  settings: AppSettings;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;

  // Current session
  currentSession: CashSession | null;
  openSession: (openingBalance: number) => void;
  closeSession: () => void;

  // Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string) => void;
  addBrand: (name: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'balance'>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'bonusPoints' | 'debt'>) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;

  // Sales
  completeSale: (paymentMethod: 'cash' | 'card' | 'mixed', cashReceived?: number, cardAmount?: number, customerId?: string, discount?: number) => Sale | null;
  refundSale: (saleId: string) => void;

  // Inventory
  addStock: (productId: string, quantity: number, reason: string) => void;
  removeStock: (productId: string, quantity: number, reason: string) => void;
  receivePurchase: (orderId: string) => void;

  // Purchases
  createPurchaseOrder: (supplierId: string, items: { productId: string; quantity: number; purchasePrice: number }[], invoiceNumber: string) => void;

  // Expenses
  addExpense: (category: string, description: string, amount: number) => void;

  // Online Orders
  createOnlineOrder: (order: Omit<OnlineOrder, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>) => string;
  updateOrderStatus: (orderId: string, status: OnlineOrder['status']) => void;

  // Settings
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Audit
  addAuditLog: (action: string, entity: string, entityId: string, details: string) => void;

  // Helpers
  getProductByBarcode: (barcode: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getSalesByDate: (from: string, to: string) => Sale[];
  getExpensesByDate: (from: string, to: string) => Expense[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      lang: 'uz' as Lang,
      theme: 'light' as Theme,
      users: defaultUsers,
      products: defaultProducts,
      categories: defaultCategories,
      brands: defaultBrands,
      suppliers: defaultSuppliers,
      customers: defaultCustomers,
      sales: [],
      cashSessions: [],
      stockMovements: [],
      purchaseOrders: [],
      expenses: [],
      onlineOrders: [],
      auditLogs: [],
      settings: defaultSettings,
      cart: [],
      currentSession: null,

      // Auth
      login: (username, password) => {
        const user = get().users.find(u => u.username === username && u.password === password && u.active);
        if (user) {
          set({ currentUser: user });
          get().addAuditLog('login', 'user', user.id, `${user.fullName} tizimga kirdi`);
          return true;
        }
        return false;
      },
      logout: () => {
        const user = get().currentUser;
        if (user) get().addAuditLog('logout', 'user', user.id, `${user.fullName} tizimdan chiqdi`);
        set({ currentUser: null, cart: [], currentSession: null });
      },

      // UI
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      // Cart
      addToCart: (product, qty = 1) => {
        const cart = [...get().cart];
        const existing = cart.find(i => i.product.id === product.id);
        if (existing) {
          existing.quantity += qty;
        } else {
          cart.push({ product, quantity: qty, discount: 0 });
        }
        set({ cart });
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter(i => i.product.id !== productId) });
      },
      updateCartQty: (productId, qty) => {
        const cart = get().cart.map(i => i.product.id === productId ? { ...i, quantity: Math.max(1, qty) } : i);
        set({ cart });
      },
      clearCart: () => set({ cart: [] }),

      // Session
      openSession: (openingBalance) => {
        const user = get().currentUser!;
        const session: CashSession = {
          id: uuidv4(),
          cashierId: user.id,
          cashierName: user.fullName,
          openingBalance,
          totalSales: 0,
          totalReturns: 0,
          totalCash: 0,
          totalCard: 0,
          status: 'open',
          openedAt: new Date().toISOString(),
        };
        set({ currentSession: session, cashSessions: [...get().cashSessions, session] });
        get().addAuditLog('open_session', 'cash_session', session.id, `Smena ochildi. Boshlang'ich: ${openingBalance}`);
      },
      closeSession: () => {
        const session = get().currentSession;
        if (!session) return;
        const closedSession = {
          ...session,
          status: 'closed' as const,
          closingBalance: session.openingBalance + session.totalCash - session.totalReturns,
          closedAt: new Date().toISOString(),
        };
        set({
          currentSession: null,
          cashSessions: get().cashSessions.map(s => s.id === session.id ? closedSession : s),
        });
        get().addAuditLog('close_session', 'cash_session', session.id, `Smena yopildi. Yakuniy: ${closedSession.closingBalance}`);
      },

      // Products
      addProduct: (product) => {
        const newProduct: Product = { ...product, id: uuidv4(), createdAt: new Date().toISOString() };
        set({ products: [...get().products, newProduct] });
        get().addAuditLog('create', 'product', newProduct.id, `${newProduct.name} yaratildi`);
      },
      updateProduct: (id, data) => {
        set({ products: get().products.map(p => p.id === id ? { ...p, ...data } : p) });
        get().addAuditLog('update', 'product', id, `Mahsulot tahrirlandi: ${JSON.stringify(data)}`);
      },
      deleteProduct: (id) => {
        set({ products: get().products.filter(p => p.id !== id) });
        get().addAuditLog('delete', 'product', id, 'Mahsulot o\'chirildi');
      },
      addCategory: (name) => {
        set({ categories: [...get().categories, { id: uuidv4(), name, active: true }] });
      },
      addBrand: (name) => {
        set({ brands: [...get().brands, { id: uuidv4(), name, active: true }] });
      },

      // Suppliers & Customers
      addSupplier: (supplier) => {
        const newSupplier: Supplier = { ...supplier, id: uuidv4(), balance: 0, createdAt: new Date().toISOString() };
        set({ suppliers: [...get().suppliers, newSupplier] });
      },
      addCustomer: (customer) => {
        const newCustomer: Customer = { ...customer, id: uuidv4(), bonusPoints: 0, debt: 0, createdAt: new Date().toISOString() };
        set({ customers: [...get().customers, newCustomer] });
      },
      updateCustomer: (id, data) => {
        set({ customers: get().customers.map(c => c.id === id ? { ...c, ...data } : c) });
      },
      addUser: (user) => {
        const newUser: User = { ...user, id: uuidv4(), createdAt: new Date().toISOString() };
        set({ users: [...get().users, newUser] });
        get().addAuditLog('create', 'user', newUser.id, `${newUser.fullName} yaratildi`);
      },
      updateUser: (id, data) => {
        set({ users: get().users.map(u => u.id === id ? { ...u, ...data } : u) });
      },

      // Sales
      completeSale: (paymentMethod, cashReceived, cardAmount, customerId, discount = 0) => {
        const state = get();
        const { cart, currentUser, currentSession } = state;
        if (!currentUser || !currentSession || cart.length === 0) return null;

        const subtotal = cart.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0);
        const discountAmount = subtotal * (discount / 100);
        const total = subtotal - discountAmount;

        const items: SaleItem[] = cart.map(item => ({
          id: uuidv4(),
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.salePrice,
          discount: item.discount,
          total: item.product.salePrice * item.quantity - item.discount,
          barcode: item.product.barcode,
        }));

        const sale: Sale = {
          id: uuidv4(),
          receiptNumber: `R-${Date.now().toString(36).toUpperCase()}`,
          items,
          subtotal,
          discount: discountAmount,
          total,
          paymentMethod,
          cashReceived: paymentMethod === 'cash' || paymentMethod === 'mixed' ? cashReceived : undefined,
          change: paymentMethod === 'cash' && cashReceived ? cashReceived - total : undefined,
          cardAmount: paymentMethod === 'card' ? total : (paymentMethod === 'mixed' ? cardAmount : undefined),
          cashAmount: paymentMethod === 'cash' ? total : (paymentMethod === 'mixed' ? (cashReceived || total) : undefined),
          customerId,
          cashierId: currentUser.id,
          cashierName: currentUser.fullName,
          sessionId: currentSession.id,
          status: 'completed',
          createdAt: new Date().toISOString(),
        };

        // Update stock
        const updatedProducts = [...state.products];
        const movements: StockMovement[] = [];
        items.forEach(item => {
          const idx = updatedProducts.findIndex(p => p.id === item.productId);
          if (idx >= 0) {
            const prev = updatedProducts[idx].stock;
            updatedProducts[idx] = { ...updatedProducts[idx], stock: prev - item.quantity };
            movements.push({
              id: uuidv4(),
              productId: item.productId,
              productName: item.productName,
              type: 'out',
              quantity: item.quantity,
              previousStock: prev,
              newStock: prev - item.quantity,
              reason: `Savdo: ${sale.receiptNumber}`,
              referenceId: sale.id,
              userId: currentUser.id,
              userName: currentUser.fullName,
              createdAt: new Date().toISOString(),
            });
          }
        });

        // Update session
        const updatedSession = { ...currentSession };
        if (paymentMethod === 'cash' || paymentMethod === 'mixed') {
          updatedSession.totalCash += (sale.cashAmount || 0);
        }
        if (paymentMethod === 'card' || paymentMethod === 'mixed') {
          updatedSession.totalCard += (sale.cardAmount || 0);
        }
        updatedSession.totalSales += total;

        set({
          sales: [...state.sales, sale],
          products: updatedProducts,
          stockMovements: [...state.stockMovements, ...movements],
          cashSessions: state.cashSessions.map(s => s.id === currentSession.id ? updatedSession : s),
          currentSession: updatedSession,
          cart: [],
        });

        get().addAuditLog('sale', 'sale', sale.id, `Savdo: ${sale.receiptNumber}, summa: ${total}`);
        return sale;
      },

      refundSale: (saleId) => {
        const state = get();
        const sale = state.sales.find(s => s.id === saleId);
        if (!sale || sale.status !== 'completed') return;

        // Restore stock
        const updatedProducts = [...state.products];
        sale.items.forEach(item => {
          const idx = updatedProducts.findIndex(p => p.id === item.productId);
          if (idx >= 0) {
            const prev = updatedProducts[idx].stock;
            updatedProducts[idx] = { ...updatedProducts[idx], stock: prev + item.quantity };
          }
        });

        set({
          sales: state.sales.map(s => s.id === saleId ? { ...s, status: 'refunded' as const } : s),
          products: updatedProducts,
        });
        get().addAuditLog('refund', 'sale', saleId, `Qaytarish: ${sale.receiptNumber}`);
      },

      // Inventory
      addStock: (productId, quantity, reason) => {
        const state = get();
        const product = state.products.find(p => p.id === productId);
        if (!product) return;
        const newStock = product.stock + quantity;
        const movement: StockMovement = {
          id: uuidv4(),
          productId,
          productName: product.name,
          type: 'in',
          quantity,
          previousStock: product.stock,
          newStock,
          reason,
          userId: state.currentUser?.id || '',
          userName: state.currentUser?.fullName || '',
          createdAt: new Date().toISOString(),
        };
        set({
          products: state.products.map(p => p.id === productId ? { ...p, stock: newStock } : p),
          stockMovements: [...state.stockMovements, movement],
        });
      },
      removeStock: (productId, quantity, reason) => {
        const state = get();
        const product = state.products.find(p => p.id === productId);
        if (!product) return;
        const newStock = Math.max(0, product.stock - quantity);
        const movement: StockMovement = {
          id: uuidv4(),
          productId,
          productName: product.name,
          type: 'out',
          quantity,
          previousStock: product.stock,
          newStock,
          reason,
          userId: state.currentUser?.id || '',
          userName: state.currentUser?.fullName || '',
          createdAt: new Date().toISOString(),
        };
        set({
          products: state.products.map(p => p.id === productId ? { ...p, stock: newStock } : p),
          stockMovements: [...state.stockMovements, movement],
        });
      },

      // Purchases
      createPurchaseOrder: (supplierId, items, invoiceNumber) => {
        const state = get();
        const supplier = state.suppliers.find(s => s.id === supplierId);
        const poItems = items.map(item => {
          const product = state.products.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            productName: product?.name || '',
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            total: item.quantity * item.purchasePrice,
          };
        });
        const order: PurchaseOrder = {
          id: uuidv4(),
          supplierId,
          supplierName: supplier?.name || '',
          items: poItems,
          total: poItems.reduce((s, i) => s + i.total, 0),
          invoiceNumber,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set({ purchaseOrders: [...state.purchaseOrders, order] });
        get().addAuditLog('create', 'purchase_order', order.id, `Xarid buyurtmasi: ${invoiceNumber}`);
      },
      receivePurchase: (orderId) => {
        const state = get();
        const order = state.purchaseOrders.find(o => o.id === orderId);
        if (!order || order.status === 'received') return;

        const updatedProducts = [...state.products];
        const movements: StockMovement[] = [];
        order.items.forEach(item => {
          const idx = updatedProducts.findIndex(p => p.id === item.productId);
          if (idx >= 0) {
            const prev = updatedProducts[idx].stock;
            updatedProducts[idx] = { ...updatedProducts[idx], stock: prev + item.quantity, purchasePrice: item.purchasePrice };
            movements.push({
              id: uuidv4(),
              productId: item.productId,
              productName: item.productName,
              type: 'in',
              quantity: item.quantity,
              previousStock: prev,
              newStock: prev + item.quantity,
              reason: `Xarid: ${order.invoiceNumber}`,
              referenceId: orderId,
              userId: state.currentUser?.id || '',
              userName: state.currentUser?.fullName || '',
              createdAt: new Date().toISOString(),
            });
          }
        });

        set({
          products: updatedProducts,
          stockMovements: [...state.stockMovements, ...movements],
          purchaseOrders: state.purchaseOrders.map(o => o.id === orderId ? { ...o, status: 'received' as const, receivedAt: new Date().toISOString() } : o),
          suppliers: state.suppliers.map(s => s.id === order.supplierId ? { ...s, balance: s.balance + order.total } : s),
        });
        get().addAuditLog('receive', 'purchase_order', orderId, `Qabul qilindi: ${order.invoiceNumber}`);
      },

      // Expenses
      addExpense: (category, description, amount) => {
        const user = get().currentUser!;
        const expense: Expense = {
          id: uuidv4(),
          category,
          description,
          amount,
          userId: user.id,
          userName: user.fullName,
          createdAt: new Date().toISOString(),
        };
        set({ expenses: [...get().expenses, expense] });
        get().addAuditLog('create', 'expense', expense.id, `Xarajat: ${description} - ${amount}`);
      },

      // Online Orders
      createOnlineOrder: (orderData) => {
        const state = get();
        // Check stock availability
        for (const item of orderData.items) {
          const product = state.products.find(p => p.id === item.productId);
          if (!product || product.stock < item.quantity) {
            return '';
          }
        }
        const order: OnlineOrder = {
          ...orderData,
          id: uuidv4(),
          orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
          status: 'new',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ onlineOrders: [...state.onlineOrders, order] });
        get().addAuditLog('create', 'order', order.id, `Onlayn buyurtma: ${order.orderNumber}`);
        return order.orderNumber;
      },
      updateOrderStatus: (orderId, status) => {
        set({
          onlineOrders: get().onlineOrders.map(o =>
            o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
          ),
        });
        get().addAuditLog('update_status', 'order', orderId, `Holat: ${status}`);
      },

      // Settings
      updateSettings: (newSettings) => {
        set({ settings: { ...get().settings, ...newSettings } });
      },

      // Audit
      addAuditLog: (action, entity, entityId, details) => {
        const user = get().currentUser;
        const log: AuditLog = {
          id: uuidv4(),
          userId: user?.id || 'system',
          userName: user?.fullName || 'System',
          action,
          entity,
          entityId,
          details,
          createdAt: new Date().toISOString(),
        };
        set({ auditLogs: [log, ...get().auditLogs].slice(0, 1000) });
      },

      // Helpers
      getProductByBarcode: (barcode) => get().products.find(p => p.barcode === barcode),
      getProductById: (id) => get().products.find(p => p.id === id),
      getSalesByDate: (from, to) => {
        return get().sales.filter(s => {
          const d = s.createdAt.split('T')[0];
          return d >= from && d <= to && s.status === 'completed';
        });
      },
      getExpensesByDate: (from, to) => {
        return get().expenses.filter(e => {
          const d = e.createdAt.split('T')[0];
          return d >= from && d <= to;
        });
      },
    }),
    {
      name: 'drinkmarket-pro-storage',
      partialize: (state) => ({
        users: state.users,
        products: state.products,
        categories: state.categories,
        brands: state.brands,
        suppliers: state.suppliers,
        customers: state.customers,
        sales: state.sales,
        cashSessions: state.cashSessions,
        stockMovements: state.stockMovements,
        purchaseOrders: state.purchaseOrders,
        expenses: state.expenses,
        onlineOrders: state.onlineOrders,
        auditLogs: state.auditLogs,
        settings: state.settings,
        lang: state.lang,
        theme: state.theme,
      }),
    }
  )
);
