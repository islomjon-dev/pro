import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { Plus, Edit, Search, Truck } from 'lucide-react';

export function SuppliersPage() {
  const { suppliers, purchaseOrders, lang, settings, addSupplier } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  const filtered = suppliers.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    addSupplier({ ...form, active: true });
    setShowForm(false);
    setForm({ name: '', phone: '', email: '', address: '' });
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('nav.suppliers', lang)}</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus size={16} className="inline mr-1" />{t('common.add', lang)}</button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search', lang)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => {
          const orders = purchaseOrders.filter(o => o.supplierId === s.id);
          return (
            <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Truck size={18} className="text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.phone}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                {s.email && <p>📧 {s.email}</p>}
                {s.address && <p>📍 {s.address}</p>}
              </div>
              <div className="mt-3 flex justify-between text-sm border-t pt-3 border-gray-100 dark:border-gray-700">
                <span>Xaridlar: <strong>{orders.length}</strong></span>
                <span className={s.balance > 0 ? 'text-red-600' : ''}>Qarz: <strong>{s.balance.toLocaleString()}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold">Yangi yetkazib beruvchi</h3>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nomi*" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefon*" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Manzil" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary flex-1" disabled={!form.name || !form.phone}>{t('common.save', lang)}</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">{t('common.cancel', lang)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
