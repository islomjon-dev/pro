import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { t } from '../i18n';
import { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, Users, Truck,
  ClipboardList, DollarSign, Store, UserCog, Settings, LogOut,
  Menu, X, Sun, Moon, Globe, ChevronDown
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'nav.dashboard', roles: ['ceo', 'cashier', 'warehouse'] },
  { path: '/pos', icon: ShoppingCart, label: 'nav.pos', roles: ['ceo', 'cashier'] },
  { path: '/products', icon: Package, label: 'nav.products', roles: ['ceo', 'warehouse', 'cashier'] },
  { path: '/inventory', icon: Warehouse, label: 'nav.inventory', roles: ['ceo', 'warehouse'] },
  { path: '/customers', icon: Users, label: 'nav.customers', roles: ['ceo', 'cashier'] },
  { path: '/suppliers', icon: Truck, label: 'nav.suppliers', roles: ['ceo', 'warehouse'] },
  { path: '/purchases', icon: ClipboardList, label: 'nav.purchases', roles: ['ceo', 'warehouse'] },
  { path: '/orders', icon: ClipboardList, label: 'nav.orders', roles: ['ceo', 'warehouse', 'cashier'] },
  { path: '/finance', icon: DollarSign, label: 'nav.finance', roles: ['ceo'] },
  { path: '/employees', icon: UserCog, label: 'nav.employees', roles: ['ceo'] },
  { path: '/settings', icon: Settings, label: 'nav.settings', roles: ['ceo'] },
  { path: '/store', icon: Store, label: 'nav.store', roles: ['ceo', 'cashier', 'warehouse', 'customer'] },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, lang, setLang, theme, setTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const filteredNav = navItems.filter(item =>
    currentUser && item.roles.includes(currentUser.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥤</span>
            <span className="font-bold text-lg text-sky-600 dark:text-sky-400">DrinkMarket</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-64px-60px)]">
          {filteredNav.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Icon size={18} />
                <span>{t(item.label, lang)}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} />
            <span>{t('nav.logout', lang)}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold hidden sm:block">
              {currentUser?.fullName}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({currentUser?.role === 'ceo' ? 'CEO' : currentUser?.role === 'cashier' ? 'Kassir' : currentUser?.role === 'warehouse' ? 'Omborchi' : 'Mijoz'})
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Globe size={16} />
                <span className="uppercase">{lang}</span>
                <ChevronDown size={14} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1 min-w-[100px]">
                  {(['uz', 'ru', 'en'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${lang === l ? 'text-sky-600 font-medium' : ''}`}
                    >
                      {l === 'uz' ? "O'zbekcha" : l === 'ru' ? 'Русский' : 'English'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
