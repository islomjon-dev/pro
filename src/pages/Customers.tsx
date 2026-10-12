import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { Plus, Edit, Search, Users } from 'lucide-react';

export function CustomersPage() {
  const { customers, sales, lang, settings, addCustomer, updateCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', isWholesale: false, discount: 0 });

  const filtered = customers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  const getCustomerStats = (customerId: string) => {
    const customerSales = sales.filter(s => s.customerId === customerId && s.status === 'completed');
    const totalSpent = customerSales.reduce((s, sale) => s + sale.total, 0);
    return { orders: customerSales.length, totalSpent };
  };

  const handleSave = () => {
    if (editId) {
      updateCustomer(editId, form);
    } else {
      addCustomer(form);
    }
    setShowForm(false);
    setEditId(null);
    setForm({ name: '', phone: '', email: '', address: '', isWholesale: false, discount: 0 });
  };

  const openEdit = (c: any) => {
    setForm({ name: c.name, phone: c.phone, email: c.email || '', address: c.address || '', isWholesale: c.isWholesale, discount: c.discount });
    setEditId(c.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('nav.customers', lang)}</h1>
        <button onClick={() => { setEditId(null); setForm({ name: '', phone: '', email: '', address: '', isWholesale: false, discount: 0 }); setShowForm(true); }} className="btn-primary text-sm"><Plus size={16} className="inline mr-1" />{t('common.add', lang)}</button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search', lang)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const stats = getCustomerStats(c.id);
          return (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                    <Users size={18} className="text-sky-600 dark:text-sky-300" />
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.phone || 'Telefon yo\'q'}</p>
                  </div>
                </div>
                <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600"><Edit size={14} /></button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Buyurtmalar</p>
                  <p className="font-bold">{stats.orders}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Summa</p>
                  <p className="font-bold text-xs">{(stats.totalSpent / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Chegirma</p>
                  <p className="font-bold">{c.discount}%</p>
                </div>
              </div>
              {c.isWholesale && <span className="badge badge-blue mt-2">Ulgurji</span>}
              {c.debt > 0 && <span className="badge badge-red mt-2 ml-1">Qarz: {c.debt.toLocaleString()}</span>}
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="text-center py-8 text-gray-500">{t('common.noData', lang)}</p>}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold">{editId ? t('prod.edit', lang) : t('common.add', lang)}</h3>
            <div>
              <label className="block text-sm mb-1">Ism*</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">Telefon*</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" placeholder="+998 90 123 45 67" />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">Manzil</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isWholesale} onChange={(e) => setForm({ ...form, isWholesale: e.target.checked })} className="rounded" />
                <span className="text-sm">Ulgurji mijoz</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm">Chegirma:</span>
                <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: parseInt(e.target.value) || 0 })} className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm" min="0" max="50" />
                <span className="text-sm">%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary flex-1" disabled={!form.name}>{t('common.save', lang)}</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">{t('common.cancel', lang)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
