import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { Plus, Search, Check, X, Clock, Truck as TruckIcon } from 'lucide-react';

export function OrdersPage() {
  const { onlineOrders, lang, settings, updateOrderStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = onlineOrders
    .filter(o => !statusFilter || o.status === statusFilter)
    .filter(o => !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusColors: Record<string, string> = {
    new: 'badge-blue', confirmed: 'badge-yellow', picking: 'badge-yellow',
    ready: 'badge-green', delivering: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red'
  };

  const statusLabels: Record<string, string> = {
    new: t('ord.new', lang), confirmed: t('ord.confirmed', lang), picking: t('ord.picking', lang),
    ready: t('ord.ready', lang), delivering: t('ord.delivering', lang), completed: t('ord.completed', lang), cancelled: t('ord.cancelled', lang)
  };

  const nextStatus: Record<string, string> = {
    new: 'confirmed', confirmed: 'picking', picking: 'ready', ready: 'delivering', delivering: 'completed'
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <h1 className="text-2xl font-bold">{t('nav.orders', lang)}</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buyurtma raqami yoki mijoz..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
          <option value="">{t('common.all', lang)}</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">#{order.orderNumber}</span>
                  <span className={`badge ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {order.customerName} • {order.customerPhone}
                </p>
                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{order.total.toLocaleString()} {settings.currencySymbol}</p>
                <p className="text-xs text-gray-500">{order.deliveryType === 'delivery' ? '🚚 Yetkazish' : '🏪 Olib ketish'}</p>
              </div>
            </div>

            <div className="mt-3 border-t pt-3 border-gray-100 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {order.items.map((item, i) => (
                  <span key={i}>{item.productName} ×{item.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
                ))}
              </div>
              {order.customerAddress && <p className="text-xs text-gray-500 mt-1">📍 {order.customerAddress}</p>}
            </div>

            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="mt-3 flex gap-2">
                {nextStatus[order.status] && (
                  <button
                    onClick={() => updateOrderStatus(order.id, nextStatus[order.status] as any)}
                    className="btn-success text-xs py-1.5 px-3"
                  >
                    <Check size={14} className="inline mr-1" />
                    {statusLabels[nextStatus[order.status]]}
                  </button>
                )}
                <button
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  className="btn-danger text-xs py-1.5 px-3"
                >
                  <X size={14} className="inline mr-1" />
                  Bekor qilish
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-gray-500">{t('common.noData', lang)}</p>}
      </div>
    </div>
  );
}
