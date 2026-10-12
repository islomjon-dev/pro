import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { Save } from 'lucide-react';

export function SettingsPage() {
  const { settings, lang, updateSettings } = useStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold">{t('nav.settings', lang)}</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        <h3 className="font-semibold text-lg border-b pb-3 border-gray-100 dark:border-gray-700">🏪 Do'kon ma'lumotlari</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">{t('set.storeName', lang)}</label>
            <input type="text" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('set.storePhone', lang)}</label>
            <input type="text" value={form.storePhone} onChange={(e) => setForm({ ...form, storePhone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t('set.storeAddress', lang)}</label>
            <input type="text" value={form.storeAddress} onChange={(e) => setForm({ ...form, storeAddress: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
        </div>

        <h3 className="font-semibold text-lg border-b pb-3 border-gray-100 dark:border-gray-700">💰 Moliyaviy sozlamalar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">{t('set.currency', lang)}</label>
            <input type="text" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">Valyuta belgisi</label>
            <input type="text" value={form.currencySymbol} onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('set.taxRate', lang)}</label>
            <input type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" min="0" max="100" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('set.receiptFormat', lang)}</label>
            <select value={form.receiptFormat} onChange={(e) => setForm({ ...form, receiptFormat: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <option value="58mm">58 mm</option>
              <option value="80mm">80 mm</option>
            </select>
          </div>
        </div>

        <h3 className="font-semibold text-lg border-b pb-3 border-gray-100 dark:border-gray-700">⚠️ Ogohlantirishlar</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={form.lowStockAlert} onChange={(e) => setForm({ ...form, lowStockAlert: e.target.checked })} className="rounded w-4 h-4" />
            <span className="text-sm">Kam qolgan mahsulotlar haqida ogohlantirish</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={form.expiryAlert} onChange={(e) => setForm({ ...form, expiryAlert: e.target.checked })} className="rounded w-4 h-4" />
            <span className="text-sm">Muddati yaqin mahsulotlar haqida ogohlantirish</span>
          </label>
          {form.expiryAlert && (
            <div className="ml-7">
              <label className="block text-sm mb-1">Ogohlantirish kunlari</label>
              <input type="number" value={form.expiryAlertDays} onChange={(e) => setForm({ ...form, expiryAlertDays: parseInt(e.target.value) || 30 })} className="w-24 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm" min="1" />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <button onClick={handleSave} className="btn-primary">
            <Save size={16} className="inline mr-1" />
            {t('common.save', lang)}
          </button>
          {saved && <span className="text-green-600 text-sm">✅ Saqlandi!</span>}
        </div>
      </div>

      {/* System info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-lg mb-3">ℹ️ Tizim haqida</h3>
        <div className="text-sm text-gray-500 space-y-1">
          <p>Versiya: 1.0.0</p>
          <p>Ma'lumotlar bazasi: LocalStorage (Demo)</p>
          <p>Production: PostgreSQL + Prisma + Express.js</p>
          <p className="text-xs mt-3 text-gray-400">
            Bu demo versiya. Production muhitda backend server, PostgreSQL ma'lumotlar bazasi va to'liq xavfsizlik tizimi bilan ishlaydi.
          </p>
        </div>
      </div>
    </div>
  );
}
