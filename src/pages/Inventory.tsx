import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { AlertTriangle, Package, ArrowDown, ArrowUp, Search } from 'lucide-react';

export function InventoryPage() {
  const { products, stockMovements, categories, lang, settings, addStock, removeStock } = useStore();
  const [tab, setTab] = useState<'stock' | 'movements' | 'alerts'>('stock');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [moveType, setMoveType] = useState<'in' | 'out'>('in');

  const filtered = products.filter(p => p.active && (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)));
  const lowStock = products.filter(p => p.active && p.stock <= p.minStock);

  const handleStockChange = () => {
    if (!selectedProduct || !quantity) return;
    const qty = parseInt(quantity);
    if (moveType === 'in') {
      addStock(selectedProduct, qty, reason || 'Qo\'lda qo\'shildi');
    } else {
      removeStock(selectedProduct, qty, reason || 'Qo\'lda ayirildi');
    }
    setShowAddModal(false);
    setSelectedProduct('');
    setQuantity('');
    setReason('');
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('nav.inventory', lang)}</h1>
        <div className="flex gap-2">
          <button onClick={() => { setMoveType('in'); setShowAddModal(true); }} className="btn-success text-sm"><ArrowDown size={16} className="inline mr-1" />{t('inv.purchase', lang)}</button>
          <button onClick={() => { setMoveType('out'); setShowAddModal(true); }} className="btn-danger text-sm"><ArrowUp size={16} className="inline mr-1" />{t('inv.writeoff', lang)}</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'stock', label: t('prod.stock', lang) },
          { key: 'movements', label: t('inv.stockMovements', lang) },
          { key: 'alerts', label: `⚠️ ${t('inv.lowStockAlert', lang)}` },
        ].map(tabItem => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === tabItem.key ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'stock' && (
        <>
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search', lang)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
          </div>
          <div className="table-container">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3">{t('prod.name', lang)}</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">{t('prod.category', lang)}</th>
                  <th className="text-right px-4 py-3">{t('prod.stock', lang)}</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">{t('prod.minStock', lang)}</th>
                  <th className="text-right px-4 py-3 hidden lg:table-cell">{t('prod.purchasePrice', lang)}</th>
                  <th className="text-right px-4 py-3">Qiymat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">{categories.find(c => c.id === p.categoryId)?.name}</td>
                    <td className={`px-4 py-3 text-right font-medium ${p.stock <= p.minStock ? 'text-red-600' : 'text-green-600'}`}>{p.stock}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell text-gray-500">{p.minStock}</td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">{p.purchasePrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{(p.stock * p.purchasePrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700 font-medium">
                <tr>
                  <td colSpan={5} className="px-4 py-3">Jami ombor qiymati:</td>
                  <td className="px-4 py-3 text-right">{filtered.reduce((s, p) => s + p.stock * p.purchasePrice, 0).toLocaleString()} {settings.currencySymbol}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {tab === 'movements' && (
        <div className="table-container">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3">{t('common.date', lang)}</th>
                <th className="text-left px-4 py-3">{t('prod.name', lang)}</th>
                <th className="text-center px-4 py-3">Tur</th>
                <th className="text-right px-4 py-3">{t('common.quantity', lang)}</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Avval</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Keyin</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Sabab</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Xodim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {stockMovements.slice(0, 100).map(m => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-xs">{new Date(m.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{m.productName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${m.type === 'in' ? 'badge-green' : 'badge-red'}`}>
                      {m.type === 'in' ? '↙ Kirim' : '↗ Chiqim'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{m.quantity}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell text-gray-500">{m.previousStock}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">{m.newStock}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{m.reason}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{m.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stockMovements.length === 0 && <p className="text-center py-8 text-gray-500">{t('common.noData', lang)}</p>}
        </div>
      )}

      {tab === 'alerts' && (
        <div className="space-y-3">
          {lowStock.length === 0 ? (
            <p className="text-center py-8 text-gray-500">✅ Barcha mahsulotlar yetarli</p>
          ) : (
            lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} className="text-amber-500" />
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">{categories.find(c => c.id === p.categoryId)?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{p.stock} / {p.minStock}</p>
                  <p className="text-xs text-gray-500">Qoldiq / Min</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Stock change modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold">{moveType === 'in' ? t('inv.purchase', lang) : t('inv.writeoff', lang)}</h3>
            <div>
              <label className="block text-sm mb-1">{t('prod.name', lang)}</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <option value="">Tanlang...</option>
                {products.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">{t('common.quantity', lang)}</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" min="1" autoFocus />
            </div>
            <div>
              <label className="block text-sm mb-1">Sabab</label>
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" placeholder="Sabab..." />
            </div>
            <div className="flex gap-2">
              <button onClick={handleStockChange} className="btn-primary flex-1" disabled={!selectedProduct || !quantity}>{t('common.save', lang)}</button>
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">{t('common.cancel', lang)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
