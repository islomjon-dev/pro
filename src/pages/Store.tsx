import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { ShoppingCart, Plus, Minus, Trash2, Search, X, Check, Package } from 'lucide-react';
import type { SaleItem } from '../types';

export function StorePage() {
  const { products, categories, cart, lang, settings, addToCart, removeFromCart, updateCartQty, clearCart, createOnlineOrder } = useStore();
  const [view, setView] = useState<'catalog' | 'cart' | 'checkout' | 'success'>('catalog');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [checkoutForm, setCheckoutForm] = useState({ customerName: '', customerPhone: '', customerAddress: '', deliveryType: 'delivery' as 'delivery' | 'pickup', paymentMethod: 'cash' as 'cash' | 'card', notes: '' });

  const filtered = products.filter(p => {
    if (!p.active || p.stock <= 0) return false;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || p.categoryId === catFilter;
    return matchSearch && matchCat;
  });

  const subtotal = cart.reduce((s, i) => s + i.product.salePrice * i.quantity, 0);
  const deliveryFee = checkoutForm.deliveryType === 'delivery' ? 15000 : 0;
  const total = subtotal + deliveryFee;

  const handleOrder = () => {
    if (!checkoutForm.customerName || !checkoutForm.customerPhone) return;
    const items: SaleItem[] = cart.map(i => ({
      id: crypto.randomUUID(),
      productId: i.product.id,
      productName: i.product.name,
      quantity: i.quantity,
      unitPrice: i.product.salePrice,
      discount: 0,
      total: i.product.salePrice * i.quantity,
      barcode: i.product.barcode,
    }));
    const num = createOnlineOrder({
      customerName: checkoutForm.customerName,
      customerPhone: checkoutForm.customerPhone,
      customerAddress: checkoutForm.deliveryType === 'delivery' ? checkoutForm.customerAddress : undefined,
      items,
      subtotal,
      discount: 0,
      deliveryFee,
      total,
      deliveryType: checkoutForm.deliveryType,
      paymentMethod: checkoutForm.paymentMethod,
      notes: checkoutForm.notes,
    });
    if (num) {
      setOrderNumber(num);
      clearCart();
      setView('success');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">🥤 {settings.storeName}</h1>
          <p className="text-sm text-gray-500">{t('nav.store', lang)} — {settings.storeAddress}</p>
        </div>
        <button
          onClick={() => setView(view === 'cart' ? 'catalog' : 'cart')}
          className="relative btn-primary"
        >
          <ShoppingCart size={20} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
          )}
        </button>
      </div>

      {/* Catalog view */}
      {view === 'catalog' && (
        <>
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
            <button onClick={() => setCatFilter('')} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${!catFilter ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
              {t('common.all', lang)}
            </button>
            {categories.filter(c => c.active).map(c => (
              <button key={c.id} onClick={() => setCatFilter(c.id)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${catFilter === c.id ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {c.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search', lang)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(product => {
              const inCart = cart.find(i => i.product.id === product.id);
              return (
                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                    <span className="text-5xl">🥤</span>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.volume}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-bold text-sky-600">{product.salePrice.toLocaleString()} <span className="text-xs">{settings.currencySymbol}</span></p>
                      {inCart ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateCartQty(product.id, inCart.quantity - 1)} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center"><Minus size={12} /></button>
                          <span className="w-6 text-center text-sm font-medium">{inCart.quantity}</span>
                          <button onClick={() => updateCartQty(product.id, inCart.quantity + 1)} className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center"><Plus size={12} /></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(product)} className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600">
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && <p className="text-center py-12 text-gray-500">{t('common.noData', lang)}</p>}
        </>
      )}

      {/* Cart view */}
      {view === 'cart' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4">{t('store.cart', lang)}</h2>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">{t('pos.emptyCart', lang)}</p>
              <button onClick={() => setView('catalog')} className="btn-primary mt-4">Xaridni davom ettirish</button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-2xl">🥤</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.product.salePrice.toLocaleString()} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center"><Minus size={14} /></button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center"><Plus size={14} /></button>
                    </div>
                    <p className="font-bold w-24 text-right">{(item.product.salePrice * item.quantity).toLocaleString()}</p>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-500"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-lg font-bold">{t('pos.total', lang)}: {subtotal.toLocaleString()} {settings.currencySymbol}</span>
                <button onClick={() => setView('checkout')} className="btn-primary">{t('store.checkout', lang)} →</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Checkout view */}
      {view === 'checkout' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-4">{t('store.checkout', lang)}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">{t('store.addToCart', lang) === 'Savatga qo\'shish' ? 'Ismingiz' : 'Your Name'}*</label>
              <input type="text" value={checkoutForm.customerName} onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">{t('store.phone', lang)}*</label>
              <input type="tel" value={checkoutForm.customerPhone} onChange={(e) => setCheckoutForm({ ...checkoutForm, customerPhone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" placeholder="+998 90 123 45 67" />
            </div>

            {/* Delivery type */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setCheckoutForm({ ...checkoutForm, deliveryType: 'delivery' })} className={`p-3 rounded-lg border-2 text-center ${checkoutForm.deliveryType === 'delivery' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-200 dark:border-gray-600'}`}>
                🚚 {t('ord.delivery', lang)}
              </button>
              <button onClick={() => setCheckoutForm({ ...checkoutForm, deliveryType: 'pickup' })} className={`p-3 rounded-lg border-2 text-center ${checkoutForm.deliveryType === 'pickup' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-200 dark:border-gray-600'}`}>
                🏪 {t('ord.pickup', lang)}
              </button>
            </div>

            {checkoutForm.deliveryType === 'delivery' && (
              <div>
                <label className="block text-sm mb-1">{t('store.address', lang)}*</label>
                <input type="text" value={checkoutForm.customerAddress} onChange={(e) => setCheckoutForm({ ...checkoutForm, customerAddress: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
              </div>
            )}

            {/* Payment */}
            <div>
              <label className="block text-sm mb-2">To'lov usuli</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'cash' })} className={`p-3 rounded-lg border-2 text-center ${checkoutForm.paymentMethod === 'cash' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-200 dark:border-gray-600'}`}>
                  💵 {t('pos.cash', lang)}
                </button>
                <button onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'card' })} className={`p-3 rounded-lg border-2 text-center ${checkoutForm.paymentMethod === 'card' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-200 dark:border-gray-600'}`}>
                  💳 {t('pos.card', lang)}
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Mahsulotlar:</span><span>{subtotal.toLocaleString()} {settings.currencySymbol}</span></div>
              {checkoutForm.deliveryType === 'delivery' && <div className="flex justify-between"><span>Yetkazish:</span><span>{deliveryFee.toLocaleString()} {settings.currencySymbol}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t pt-2"><span>{t('pos.total', lang)}:</span><span className="text-sky-600">{total.toLocaleString()} {settings.currencySymbol}</span></div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setView('cart')} className="btn-secondary flex-1">← {t('common.cancel', lang)}</button>
              <button onClick={handleOrder} className="btn-primary flex-1" disabled={!checkoutForm.customerName || !checkoutForm.customerPhone || (checkoutForm.deliveryType === 'delivery' && !checkoutForm.customerAddress)}>
                {t('store.placeOrder', lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success view */}
      {view === 'success' && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">{t('store.orderPlaced', lang)}</h2>
          <p className="text-gray-500 mb-2">{t('store.orderNumber', lang)}:</p>
          <p className="text-3xl font-bold text-sky-600 mb-6">#{orderNumber}</p>
          <button onClick={() => { setView('catalog'); setOrderNumber(''); }} className="btn-primary">
            {t('pos.newSale', lang)}
          </button>
        </div>
      )}
    </div>
  );
}
