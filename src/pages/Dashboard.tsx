import { useStore } from '../store';
import { t } from '../i18n';
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Package, AlertTriangle, Clock, Users } from 'lucide-react';

export function DashboardPage() {
  const { sales, products, expenses, onlineOrders, suppliers, lang, settings } = useStore();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const fromDate = period === 'today' ? today : period === 'week' ? weekAgo : monthAgo;

  const stats = useMemo(() => {
    const filteredSales = sales.filter(s => {
      const d = s.createdAt.split('T')[0];
      return d >= fromDate && d <= today && s.status === 'completed';
    });
    const filteredExpenses = expenses.filter(e => {
      const d = e.createdAt.split('T')[0];
      return d >= fromDate && d <= today;
    });

    const totalRevenue = filteredSales.reduce((s, sale) => s + sale.total, 0);
    const totalCOGS = filteredSales.reduce((sum, sale) => {
      return sum + sale.items.reduce((s, item) => {
        const product = products.find(p => p.id === item.productId);
        return s + (product?.purchasePrice || 0) * item.quantity;
      }, 0);
    }, 0);
    const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const grossProfit = totalRevenue - totalCOGS;
    const netResult = grossProfit - totalExpenses;
    const salesCount = filteredSales.length;
    const avgCheck = salesCount > 0 ? totalRevenue / salesCount : 0;
    const totalItems = filteredSales.reduce((s, sale) => s + sale.items.reduce((sum, i) => sum + i.quantity, 0), 0);
    const cashIncome = filteredSales.filter(s => s.paymentMethod === 'cash' || s.paymentMethod === 'mixed').reduce((s, sale) => s + (sale.cashAmount || 0), 0);
    const cardIncome = filteredSales.filter(s => s.paymentMethod === 'card' || s.paymentMethod === 'mixed').reduce((s, sale) => s + (sale.cardAmount || 0), 0);
    const stockValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
    const lowStockItems = products.filter(p => p.stock <= p.minStock && p.active);
    const supplierDebt = suppliers.reduce((s, sup) => s + sup.balance, 0);
    const pendingOrders = onlineOrders.filter(o => o.status === 'new' || o.status === 'confirmed').length;

    return {
      totalRevenue, totalCOGS, totalExpenses, grossProfit, netResult,
      salesCount, avgCheck, totalItems, cashIncome, cardIncome,
      stockValue, lowStockItems, supplierDebt, pendingOrders
    };
  }, [sales, products, expenses, onlineOrders, suppliers, fromDate, today]);

  // Chart data - last 7 days
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      const daySales = sales.filter(s => s.createdAt.split('T')[0] === date && s.status === 'completed');
      const revenue = daySales.reduce((s, sale) => s + sale.total, 0);
      const count = daySales.length;
      days.push({
        date: date.slice(5),
        revenue: revenue / 1000,
        count,
      });
    }
    return days;
  }, [sales]);

  // Top products
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    const filteredSales = sales.filter(s => {
      const d = s.createdAt.split('T')[0];
      return d >= fromDate && d <= today && s.status === 'completed';
    });
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        productSales[item.productId].qty += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });
    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [sales, fromDate, today]);

  const fmt = (n: number) => n.toLocaleString() + ' ' + settings.currencySymbol;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('nav.dashboard', lang)}</h1>
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              {p === 'today' ? t('common.today', lang) : p === 'week' ? t('common.thisWeek', lang) : t('common.thisMonth', lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign size={20} />} label={t('dash.todaySales', lang)} value={fmt(stats.totalRevenue)} color="bg-green-500" />
        <StatCard icon={<ShoppingCart size={20} />} label={t('dash.salesCount', lang)} value={stats.salesCount.toString()} color="bg-blue-500" />
        <StatCard icon={<TrendingUp size={20} />} label={t('dash.avgCheck', lang)} value={fmt(Math.round(stats.avgCheck))} color="bg-purple-500" />
        <StatCard icon={<Package size={20} />} label={t('dash.grossProfit', lang)} value={fmt(stats.grossProfit)} color="bg-emerald-500" />
        <StatCard icon={<DollarSign size={20} />} label={t('dash.expenses', lang)} value={fmt(stats.totalExpenses)} color="bg-red-500" />
        <StatCard icon={<TrendingUp size={20} />} label={t('dash.netResult', lang)} value={fmt(stats.netResult)} color="bg-teal-500" />
        <StatCard icon={<DollarSign size={20} />} label={t('dash.cashIncome', lang)} value={fmt(stats.cashIncome)} color="bg-amber-500" />
        <StatCard icon={<DollarSign size={20} />} label={t('dash.cardIncome', lang)} value={fmt(stats.cardIncome)} color="bg-indigo-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">{t('dash.salesDynamics', lang)}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString()}K ${settings.currencySymbol}`, t('dash.todaySales', lang)]} />
              <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">{t('dash.topProducts', lang)}</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="text-sm">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{fmt(p.revenue)}</div>
                    <div className="text-xs text-gray-500">{p.qty} dona</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('common.noData', lang)}</p>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Package size={16} className="text-gray-500" />
            <span className="text-sm font-medium">{t('dash.stockValue', lang)}</span>
          </div>
          <p className="text-xl font-bold">{fmt(stats.stockValue)}</p>
          <p className="text-xs text-gray-500 mt-1">{products.filter(p => p.active).length} mahsulot</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-sm font-medium">{t('dash.lowStock', lang)}</span>
          </div>
          <p className="text-xl font-bold text-amber-600">{stats.lowStockItems.length}</p>
          <div className="mt-2 max-h-20 overflow-y-auto">
            {stats.lowStockItems.slice(0, 3).map(p => (
              <p key={p.id} className="text-xs text-gray-500 truncate">{p.name} ({p.stock})</p>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-500" />
            <span className="text-sm font-medium">{t('dash.onlineOrders', lang)}</span>
          </div>
          <p className="text-xl font-bold text-blue-600">{stats.pendingOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Kutilayotgan</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-3">
        <div className={`${color} text-white p-2.5 rounded-lg`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
