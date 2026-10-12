import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { Plus, Edit, Trash2, Search, Download, Upload } from 'lucide-react';
import type { Product } from '../types';

export function ProductsPage() {
  const { products, categories, brands, suppliers, lang, settings, addProduct, updateProduct, deleteProduct, addCategory, addBrand } = useStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || p.categoryId === catFilter;
    return matchSearch && matchCat;
  });

  const handleSave = (data: any) => {
    if (editProduct) {
      updateProduct(editProduct.id, data);
    } else {
      addProduct({ ...data, stock: 0 });
    }
    setShowForm(false);
    setEditProduct(null);
  };

  const handleExport = () => {
    const csv = ['SKU,Nomi,Shtrix-kod,Kategoriya,Narx,Qoldiq', ...products.map(p => `${p.sku},${p.name},${p.barcode},${categories.find(c => c.id === p.categoryId)?.name || ''},${p.salePrice},${p.stock}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('nav.products', lang)}</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary text-sm"><Download size={16} className="inline mr-1" />{t('prod.export', lang)}</button>
          <button onClick={() => setShowCatForm(true)} className="btn-secondary text-sm">+ Kategoriya</button>
          <button onClick={() => { setEditProduct(null); setShowForm(true); }} className="btn-primary text-sm"><Plus size={16} className="inline mr-1" />{t('prod.add', lang)}</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search', lang)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
          <option value="">{t('common.all', lang)} {t('prod.category', lang)}</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t('prod.name', lang)}</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">{t('prod.sku', lang)}</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">{t('prod.barcode', lang)}</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">{t('prod.category', lang)}</th>
              <th className="text-right px-4 py-3 font-medium">{t('prod.salePrice', lang)}</th>
              <th className="text-right px-4 py-3 font-medium">{t('prod.stock', lang)}</th>
              <th className="text-center px-4 py-3 font-medium">{t('common.actions', lang)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.volume}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-500">{product.sku}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-500 font-mono text-xs">{product.barcode}</td>
                <td className="px-4 py-3 hidden md:table-cell">{categories.find(c => c.id === product.categoryId)?.name}</td>
                <td className="px-4 py-3 text-right font-medium">{product.salePrice.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={product.stock <= product.minStock ? 'text-red-600 font-medium' : 'text-green-600'}>{product.stock}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => { setEditProduct(product); setShowForm(true); }} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 mr-1"><Edit size={14} /></button>
                  <button onClick={() => { if (confirm('O\'chirishni tasdiqlaysizmi?')) deleteProduct(product.id); }} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-gray-500">{t('common.noData', lang)}</p>}
      </div>
      <p className="text-sm text-gray-500">{filtered.length} / {products.length} mahsulot</p>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editProduct}
          categories={categories}
          brands={brands}
          suppliers={suppliers}
          lang={lang}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
        />
      )}

      {/* Category Form */}
      {showCatForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold">Yangi kategoriya</h3>
            <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Kategoriya nomi" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" autoFocus />
            <div className="flex gap-2">
              <button onClick={() => { addCategory(newCatName); setNewCatName(''); setShowCatForm(false); }} className="btn-primary flex-1" disabled={!newCatName}>{t('common.save', lang)}</button>
              <button onClick={() => setShowCatForm(false)} className="btn-secondary flex-1">{t('common.cancel', lang)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, categories, brands, suppliers, lang, onSave, onClose }: any) {
  const [form, setForm] = useState({
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    name: product?.name || '',
    categoryId: product?.categoryId || categories[0]?.id || '',
    brandId: product?.brandId || '',
    volume: product?.volume || '0.5L',
    unit: product?.unit || 'pcs',
    itemsPerBox: product?.itemsPerBox || 1,
    purchasePrice: product?.purchasePrice || 0,
    salePrice: product?.salePrice || 0,
    wholesalePrice: product?.wholesalePrice || 0,
    retailPrice: product?.retailPrice || 0,
    minStock: product?.minStock || 10,
    supplierId: product?.supplierId || '',
    description: product?.description || '',
    active: product?.active ?? true,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg space-y-4 my-8">
        <h3 className="text-lg font-semibold">{product ? t('prod.edit', lang) : t('prod.add', lang)}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm mb-1">{t('prod.name', lang)}*</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.sku', lang)}*</label>
            <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.barcode', lang)}*</label>
            <input type="text" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.category', lang)}</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.brand', lang)}</label>
            <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <option value="">-</option>
              {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.volume', lang)}</label>
            <input type="text" value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.unit', lang)}</label>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <option value="pcs">Dona</option>
              <option value="box">Quti</option>
              <option value="pack">Blok</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.purchasePrice', lang)}</label>
            <input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.salePrice', lang)}</label>
            <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.wholesalePrice', lang)}</label>
            <input type="number" value={form.wholesalePrice} onChange={(e) => setForm({ ...form, wholesalePrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.minStock', lang)}</label>
            <input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.itemsPerBox', lang)}</label>
            <input type="number" value={form.itemsPerBox} onChange={(e) => setForm({ ...form, itemsPerBox: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('prod.supplier', lang)}</label>
            <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <option value="">-</option>
              {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(form)} className="btn-primary flex-1" disabled={!form.name || !form.sku || !form.barcode}>{t('prod.save', lang)}</button>
          <button onClick={onClose} className="btn-secondary flex-1">{t('prod.cancel', lang)}</button>
        </div>
      </div>
    </div>
  );
}
