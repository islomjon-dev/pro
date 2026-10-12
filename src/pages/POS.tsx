import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Printer, X, Check, AlertCircle } from 'lucide-react';

export function POSPage() {
  const {
    products, cart, currentSession, customers, lang, settings,
    addToCart, removeFromCart, updateCartQty, clearCart,
    completeSale, openSession, closeSession, getProductByBarcode
  } = useStore();

  const [search, setSearch] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mixed'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [discount, setDiscount] = useState(0);
  const [lastSale, setLastSale] = useState<any>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const filteredProducts = products.filter(p =>
    p.active && (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    )
  ).slice(0, 20);

  // Handle barcode scan
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && search.length >= 8) {
        const product = getProductByBarcode(search);
        if (product) {
          addToCart(product);
          setSearch('');
          searchRef.current?.focus();
        }
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [search, getProductByBarcode, addToCart]);

  const handlePay = () => {
    if (cart.length === 0) return;
    const sale = completeSale(paymentMethod, parseFloat(cashReceived) || total, parseFloat(cardAmount) || 0, selectedCustomer || undefined, discount);
    if (sale) {
      setLastSale(sale);
      setShowPayment(false);
      setShowReceipt(true);
      setCashReceived('');
      setCardAmount('');
      setDiscount(0);
      setSelectedCustomer('');
    }
  };

  // Session not open
  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔒</div>
          <h2 className="text-xl font-semibold">{t('pos.noSession', lang)}</h2>
          <button onClick={() => setShowSessionModal(true)} className="btn-primary">
            {t('pos.openSession', lang)}
          </button>
        </div>

        {showSessionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4">
              <h3 className="text-lg font-semibold">{t('pos.openSession', lang)}</h3>
              <div>
                <label className="block text-sm mb-1">{t('pos.openingBalance', lang)}</label>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { openSession(parseFloat(openingBalance) || 0); setShowSessionModal(false); }} className="btn-primary flex-1">
                  {t('pos.openSession', lang)}
                </button>
                <button onClick={() => setShowSessionModal(false)} className="btn-secondary flex-1">
                  {t('common.cancel', lang)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pos-grid gap-4 -m-4 md:-m-6">
      {/* Products section */}
      <div className="flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Search */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('pos.searchProduct', lang)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
              autoFocus
            />
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600 transition-colors text-left disabled:opacity-50"
              >
                <div className="text-2xl mb-1">🥤</div>
                <p className="text-xs font-medium truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.volume}</p>
                <p className="text-sm font-bold text-sky-600 mt-1">{product.salePrice.toLocaleString()} {settings.currencySymbol}</p>
                <p className={`text-xs mt-0.5 ${product.stock <= product.minStock ? 'text-red-500' : 'text-green-500'}`}>
                  {t('prod.stock', lang)}: {product.stock}
                </p>
              </button>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <p className="text-center text-gray-500 py-8">{t('common.noData', lang)}</p>
          )}
        </div>
      </div>

      {/* Cart section */}
      <div className="flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        {/* Cart header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold">{t('pos.cart', lang)} ({cart.length})</h3>
          <div className="flex gap-2">
            {currentSession && (
              <button onClick={closeSession} className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                {t('pos.closeSession', lang)}
              </button>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('pos.emptyCart', lang)}</p>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500">{item.product.salePrice.toLocaleString()} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                    <Plus size={14} />
                  </button>
                </div>
                <p className="text-sm font-bold w-20 text-right">{(item.product.salePrice * item.quantity).toLocaleString()}</p>
                <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
          {/* Customer select */}
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
          >
            <option value="">{t('pos.selectCustomer', lang)}</option>
            {customers.filter(c => c.phone).map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
            ))}
          </select>

          {/* Discount */}
          <div className="flex items-center gap-2">
            <span className="text-sm">{t('pos.discount', lang)}:</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-center"
              min="0"
              max="100"
            />
            <span className="text-sm">%</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>{t('pos.subtotal', lang)}:</span>
            <span>{subtotal.toLocaleString()} {settings.currencySymbol}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>-{t('pos.discount', lang)}:</span>
              <span>-{discountAmount.toLocaleString()} {settings.currencySymbol}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>{t('pos.total', lang)}:</span>
            <span className="text-sky-600">{total.toLocaleString()} {settings.currencySymbol}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { clearCart(); setDiscount(0); }}
              className="btn-secondary flex-1"
              disabled={cart.length === 0}
            >
              <X size={16} className="inline mr-1" />
              {t('pos.cancel', lang)}
            </button>
            <button
              onClick={() => setShowPayment(true)}
              className="btn-primary flex-1"
              disabled={cart.length === 0}
            >
              {t('pos.pay', lang)} →
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4 animate-fadeIn">
            <h3 className="text-lg font-semibold">{t('pos.pay', lang)}</h3>
            <p className="text-2xl font-bold text-center text-sky-600">{total.toLocaleString()} {settings.currencySymbol}</p>

            {/* Payment method */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${paymentMethod === 'cash' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-200 dark:border-gray-600'}`}
              >
                <Banknote size={24} className="mx-auto mb-1" />
                <span className="text-sm">{t('pos.cash', lang)}</span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${paymentMethod === 'card' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-200 dark:border-gray-600'}`}
              >
                <CreditCard size={24} className="mx-auto mb-1" />
                <span className="text-sm">{t('pos.card', lang)}</span>
              </button>
              <button
                onClick={() => setPaymentMethod('mixed')}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${paymentMethod === 'mixed' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-200 dark:border-gray-600'}`}
              >
                <span className="text-xl">💳💵</span>
                <span className="text-xs block mt-1">Aralash</span>
              </button>
            </div>

            {paymentMethod === 'cash' && (
              <div>
                <label className="block text-sm mb-1">{t('pos.cashReceived', lang)}</label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-lg text-center"
                  placeholder={total.toString()}
                  autoFocus
                />
                {parseFloat(cashReceived) >= total && (
                  <p className="text-green-600 text-sm mt-1 text-center">
                    {t('pos.change', lang)}: {(parseFloat(cashReceived) - total).toLocaleString()} {settings.currencySymbol}
                  </p>
                )}
              </div>
            )}

            {paymentMethod === 'mixed' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm mb-1">{t('pos.cash', lang)}</label>
                  <input type="number" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('pos.card', lang)}</label>
                  <input type="number" value={cardAmount} onChange={(e) => setCardAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowPayment(false)} className="btn-secondary flex-1">{t('common.cancel', lang)}</button>
              <button
                onClick={handlePay}
                className="btn-success flex-1"
                disabled={paymentMethod === 'cash' && parseFloat(cashReceived) < total}
              >
                <Check size={16} className="inline mr-1" />
                {t('pos.pay', lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4 animate-fadeIn">
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-lg font-semibold">{t('pos.saleCompleted', lang)}</h3>
            </div>

            <div className="receipt-print bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs font-mono space-y-2">
              <div className="text-center">
                <p className="font-bold">{settings.storeName}</p>
                <p>{settings.storeAddress}</p>
                <p>{settings.storePhone}</p>
              </div>
              <hr className="border-dashed" />
              <div className="flex justify-between">
                <span>Chek: {lastSale.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Kassir: {lastSale.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Sana: {new Date(lastSale.createdAt).toLocaleString()}</span>
              </div>
              <hr className="border-dashed" />
              {lastSale.items.map((item: any) => (
                <div key={item.id}>
                  <p>{item.productName}</p>
                  <div className="flex justify-between">
                    <span>{item.quantity} × {item.unitPrice.toLocaleString()}</span>
                    <span>{item.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              <hr className="border-dashed" />
              {lastSale.discount > 0 && (
                <div className="flex justify-between">
                  <span>Chegirma:</span>
                  <span>-{lastSale.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm">
                <span>JAMI:</span>
                <span>{lastSale.total.toLocaleString()} {settings.currencySymbol}</span>
              </div>
              <div className="flex justify-between">
                <span>To'lov: {lastSale.paymentMethod === 'cash' ? 'Naqd' : lastSale.paymentMethod === 'card' ? 'Karta' : 'Aralash'}</span>
              </div>
              {lastSale.change > 0 && (
                <div className="flex justify-between">
                  <span>Qaytarim:</span>
                  <span>{lastSale.change.toLocaleString()}</span>
                </div>
              )}
              <hr className="border-dashed" />
              <p className="text-center">Rahmat!</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => window.print()} className="btn-secondary flex-1">
                <Printer size={16} className="inline mr-1" />
                {t('pos.printReceipt', lang)}
              </button>
              <button onClick={() => setShowReceipt(false)} className="btn-primary flex-1">
                {t('pos.newSale', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
