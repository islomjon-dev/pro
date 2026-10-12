import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const { login, lang, setLang, theme, setTheme } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (!success) {
      setError(t('auth.invalidCredentials', lang));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      {/* Language & theme controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as any)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
        >
          <option value="uz">O'zbekcha</option>
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🥤</div>
          <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400">DrinkMarket Pro</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t('auth.welcomeDesc', lang)}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 space-y-5">
          <h2 className="text-xl font-semibold text-center">{t('auth.welcome', lang)}</h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('auth.username', lang)}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
              placeholder="admin"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('auth.password', lang)}</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pr-10"
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-3 text-base">
            {t('auth.signIn', lang)}
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1 pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="font-medium">Demo foydalanuvchilar:</p>
            <p>CEO: admin / admin123</p>
            <p>Kassir: kassir / kassir123</p>
            <p>Omborchi: ombor / ombor123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
