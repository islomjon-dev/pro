import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { Plus, Check, Search, Package } from 'lucide-react';

export function PurchasesPage() {
  const { purchaseOrders, suppliers, products, lang, settings, createPurchaseOrder, receivePurchase } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: string; purchasePrice: string }[]>([{ productId: '', quantity: '', purchasePrice: '' }]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = purchaseOrders
    .filter(o => !statusFilter || o.status === statusFilter)
    .filter(o => !search || o.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || o.supplierName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const addItem = () => setItems([...items, { productId: '', quantity: '', purchasePrice: '' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const handleCreate = () => {
    const validItems = items.filter(i => i.productId && i.quantity && i.purchasePrice).map(i => ({
      productId: i.productId,
      quantity: parseInt(i.quantity),
      purchasePrice: parseFloat(i.purchasePrice),
    }));
    if (!supplierId || !invoiceNumber || validItems.length === 0) return;
    createPurchaseOrder(supplierId, validItems, invoiceNumber);
    setShowForm(false);
    setSupplierId('');
    setInvoiceNumber('');
    setItems([{ productId: '', quantity: '', purchasePrice: '' }]);
  };

  const statusColors: Record<string, string> = {
    pending: 'badge-yellow', received: 'badge-green', partial: 'badge-blue'
  };
  const statusLabels: Record<string, string> = {
    pending: 'Kutilmoqda', received: 'Qabul qilingan', partial: 'Qisman'
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('nav.purchases', lang)}</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus size={16} className="inline mr-1" />Yangi xarid</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
          <option value="">Barchasi</option>
          <option value="pending">Kutilmoqda</option>
          <option value="received">Qabul qilingan</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">📋 {order.invoiceNumber}</span>
                  <span className={`badge ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{order.supplierName}</p>
                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{order.total.toLocaleString()} {settings.currencySymbol}</p>
                <p className="text-xs text-gray-500">{order.items.length} mahsulot</p>
              </div>
            </div>

            <div className="mt-3 border-t pt-3 border-gray-100 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>{item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {order.status === 'pending' && (
              <button onClick={() => receivePurchase(order.id)} className="btn-success text-sm mt-3">
                <Check size={14} className="inline mr-1" />Qabul qilish
              </button>
            )}
            {order.status === 'received' && order.receivedAt && (
              <p className="text-xs text-green-600 mt-2">✅ Qabul qilingan: {new Date(order.receivedAt).toLocaleString()}</p>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-gray-500">{t('common.noData', lang)}</p>}
      </div>

      {/* Create purchase order form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg space-y-4 my-8">
            <h3 className="text-lg font-semibold">Yangi xarid buyurtmasi</h3>

            <div>
              <label className="block text-sm mb-1">Yetkazib beruvchi*</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <option value="">Tanlang...</option>
                {suppliers.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Hisob-faktura raqami*</label>
              <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" placeholder="INV-2024-001" />
            </div>

            <div>
              <label className="block text-sm mb-2">Mahsulotlar*</label>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <select value={item.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)} className="flex-1 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm">
                    <option value="">Mahsulot...</option>
                    {products.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} placeholder="Soni" className="w-20 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm" min="1" />
                  <input type="number" value={item.purchasePrice} onChange={(e) => updateItem(idx, 'purchasePrice', e.target.value)} placeholder="Narx" className="w-24 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm" />
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="text-red-500 px-1">×</button>
                  )}
                </div>
              ))}
              <button onClick={addItem} className="text-sm text-sky-600 hover:text-sky-700">+ Mahsulot qo'shish</button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
              <div className="flex justify-between font-bold">
                <span>Jami:</span>
                <span>{items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.purchasePrice) || 0), 0).toLocaleString()} {settings.currencySymbol}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleCreate} className="btn-primary flex-1" disabled={!supplierId || !invoiceNumber}>Yaratish</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">{t('common.cancel', lang)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
