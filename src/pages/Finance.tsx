import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';

export function FinancePage() {
  const { sales, expenses, products, lang, settings, getSalesByDate, getExpensesByDate } = useStore();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const today = new Date().toISOString().split('T')[0];
  const actualFrom = period === 'custom' ? fromDate : period === 'today' ? today : period === 'week' ? new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] : new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const actualTo = period === 'custom' ? toDate : today;

  const stats = useMemo(() => {
    const filteredSales = getSalesByDate(actualFrom, actualTo);
    const filteredExpenses = getExpensesByDate(actualFrom, actualTo);

    const revenue = filteredSales.reduce((s, sale) => s + sale.total, 0);
    const cogs = filteredSales.reduce((sum, sale) => {
      return sum + sale.items.reduce((s, item) => {
        const product = products.find(p => p.id === item.productId);
        return s + (product?.purchasePrice || 0) * item.quantity;
      }, 0);
    }, 0);
    const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const grossProfit = revenue - cogs;
    const netResult = grossProfit - totalExpenses;
    const refunds = filteredSales.filter(s => s.status === 'refunded').reduce((s, sale) => s + sale.total, 0);
    const discounts = filteredSales.reduce((s, sale) => s + sale.discount, 0);
    const cashTotal = filteredSales.filter(s => s.paymentMethod === 'cash' || s.paymentMethod === 'mixed').reduce((s, sale) => s + (sale.cashAmount || 0), 0);
    const cardTotal = filteredSales.filter(s => s.paymentMethod === 'card' || s.paymentMethod === 'mixed').reduce((s, sale) => s + (sale.cardAmount || 0), 0);

    return { revenue, cogs, totalExpenses, grossProfit, netResult, refunds, discounts, cashTotal, cardTotal, salesCount: filteredSales.length };
  }, [actualFrom, actualTo, sales, expenses, products]);

  // Daily breakdown for chart
  const dailyData = useMemo(() => {
    const days: Record<string, { date: string; revenue: number; expenses: number }> = {};
    const filteredSales = getSalesByDate(actualFrom, actualTo);
    const filteredExpenses = getExpensesByDate(actualFrom, actualTo);

    filteredSales.forEach(sale => {
      const d = sale.createdAt.split('T')[0];
      if (!days[d]) days[d] = { date: d, revenue: 0, expenses: 0 };
      days[d].revenue += sale.total;
    });
    filteredExpenses.forEach(exp => {
      const d = exp.createdAt.split('T')[0];
      if (!days[d]) days[d] = { date: d, revenue: 0, expenses: 0 };
      days[d].expenses += exp.amount;
    });

    return Object.values(days).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({ ...d, date: d.date.slice(5), revenue: d.revenue / 1000, expenses: d.expenses / 1000 }));
  }, [actualFrom, actualTo, sales, expenses]);

  const pieData = [
    { name: 'Naqd', value: stats.cashTotal },
    { name: 'Karta', value: stats.cardTotal },
  ];
  const COLORS = ['#f59e0b', '#3b82f6'];

  const fmt = (n: number) => n.toLocaleString() + ' ' + settings.currencySymbol;

  const exportCSV = () => {
    const rows = [
      ['Kun', 'Daromad', 'Xarajat', 'Sof foyda'],
      ...dailyData.map(d => [d.date, (d.revenue * 1000).toString(), (d.expenses * 1000).toString(), ((d.revenue - d.expenses) * 1000).toString()])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `finance_${actualFrom}_${actualTo}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('nav.finance', lang)}</h1>
        <button onClick={exportCSV} className="btn-secondary text-sm"><Download size={16} className="inline mr-1" />Eksport</button>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2">
        {(['today', 'week', 'month', 'custom'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${period === p ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
            {p === 'today' ? t('common.today', lang) : p === 'week' ? t('common.thisWeek', lang) : p === 'month' ? t('common.thisMonth', lang) : t('common.custom', lang)}
          </button>
        ))}
        {period === 'custom' && (
          <div className="flex gap-2">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-gray-500">{t('fin.revenue', lang)}</p>
          <p className="text-xl font-bold text-green-600">{fmt(stats.revenue)}</p>
          <p className="text-xs text-gray-400">{stats.salesCount} savdo</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500">{t('fin.cogs', lang)}</p>
          <p className="text-xl font-bold text-orange-600">{fmt(stats.cogs)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500">{t('fin.grossProfit', lang)}</p>
          <p className="text-xl font-bold text-emerald-600">{fmt(stats.grossProfit)}</p>
          <p className="text-xs text-gray-400">{stats.revenue > 0 ? ((stats.grossProfit / stats.revenue) * 100).toFixed(1) : 0}% margin</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500">{t('fin.operatingResult', lang)}</p>
          <p className={`text-xl font-bold ${stats.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(stats.netResult)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-gray-500">{t('dash.expenses', lang)}</p>
          <p className="text-lg font-bold text-red-600">{fmt(stats.totalExpenses)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500">{t('fin.refunds', lang)}</p>
          <p className="text-lg font-bold text-red-500">{fmt(stats.refunds)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500">{t('fin.discounts', lang)}</p>
          <p className="text-lg font-bold text-amber-600">{fmt(stats.discounts)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500">{t('dash.cashIncome', lang)} / {t('dash.cardIncome', lang)}</p>
          <p className="text-lg font-bold">{fmt(stats.cashTotal)} / {fmt(stats.cardTotal)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Daromad va xarajatlar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()}K`} />
              <Bar dataKey="revenue" fill="#10b981" name="Daromad" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Xarajat" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">To'lov usullari</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => fmt(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
