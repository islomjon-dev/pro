import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from './store';
import { t } from './i18n';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { POSPage } from './pages/POS';
import { ProductsPage } from './pages/Products';
import { InventoryPage } from './pages/Inventory';
import { CustomersPage } from './pages/Customers';
import { SuppliersPage } from './pages/Suppliers';
import { OrdersPage } from './pages/Orders';
import { FinancePage } from './pages/Finance';
import { StorePage } from './pages/Store';
import { EmployeesPage } from './pages/Employees';
import { SettingsPage } from './pages/Settings';
import { PurchasesPage } from './pages/Purchases';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(currentUser.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppContent() {
  const { currentUser, theme } = useStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (!currentUser) return <LoginPage />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/pos" element={<ProtectedRoute roles={['ceo', 'cashier']}><POSPage /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute roles={['ceo', 'warehouse', 'cashier']}><ProductsPage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute roles={['ceo', 'warehouse']}><InventoryPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute roles={['ceo', 'cashier']}><CustomersPage /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute roles={['ceo', 'warehouse']}><SuppliersPage /></ProtectedRoute>} />
        <Route path="/purchases" element={<ProtectedRoute roles={['ceo', 'warehouse']}><PurchasesPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['ceo', 'warehouse', 'cashier']}><OrdersPage /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute roles={['ceo']}><FinancePage /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute roles={['ceo']}><EmployeesPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute roles={['ceo']}><SettingsPage /></ProtectedRoute>} />
        <Route path="/store" element={<StorePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
