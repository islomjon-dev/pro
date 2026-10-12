import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { Plus, Edit, UserCog, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

export function EmployeesPage() {
  const { users, currentUser, lang, addUser, updateUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', role: 'cashier' as 'ceo' | 'cashier' | 'warehouse', phone: '', active: true });

  const roleIcons: Record<string, any> = {
    ceo: <ShieldCheck size={18} className="text-amber-500" />,
    cashier: <Shield size={18} className="text-blue-500" />,
    warehouse: <ShieldAlert size={18} className="text-green-500" />,
  };

  const roleNames: Record<string, string> = {
    ceo: 'CEO / Admin',
    cashier: 'Kassir',
    warehouse: 'Omborchi',
  };

  const handleSave = () => {
    if (editId) {
      updateUser(editId, form);
    } else {
      addUser(form);
    }
    setShowForm(false);
    setEditId(null);
    setForm({ username: '', password: '', fullName: '', role: 'cashier', phone: '', active: true });
  };

  const openEdit = (u: any) => {
    setForm({ username: u.username, password: u.password, fullName: u.fullName, role: u.role, phone: u.phone || '', active: u.active });
    setEditId(u.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.employees', lang)}</h1>
        <button onClick={() => { setEditId(null); setForm({ username: '', password: '', fullName: '', role: 'cashier', phone: '', active: true }); setShowForm(true); }} className="btn-primary text-sm"><Plus size={16} className="inline mr-1" />{t('common.add', lang)}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => (
          <div key={u.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                  {u.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{u.fullName}</p>
                  <p className="text-xs text-gray-500">@{u.username}</p>
                </div>
              </div>
              {u.id !== currentUser?.id && (
                <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600"><Edit size={14} /></button>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              {roleIcons[u.role]}
              <span className="text-sm">{roleNames[u.role]}</span>
              {!u.active && <span className="badge badge-red ml-auto">Faol emas</span>}
            </div>
            {u.phone && <p className="text-xs text-gray-500 mt-2">📱 {u.phone}</p>}
            {u.id === currentUser?.id && <span className="badge badge-blue mt-2">Siz</span>}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold">{editId ? t('prod.edit', lang) : 'Yangi xodim'}</h3>
            <div>
              <label className="block text-sm mb-1">To'liq ism*</label>
              <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">{t('auth.username', lang)}*</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">{t('auth.password', lang)}*</label>
              <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">Telefon</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">Rol</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <option value="cashier">Kassir</option>
                <option value="warehouse">Omborchi</option>
                <option value="ceo">CEO / Admin</option>
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
              <span className="text-sm">Faol</span>
            </label>
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary flex-1" disabled={!form.fullName || !form.username || !form.password}>{t('common.save', lang)}</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">{t('common.cancel', lang)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
