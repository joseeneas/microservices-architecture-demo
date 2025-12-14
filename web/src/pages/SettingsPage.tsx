import { useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';

export function SettingsPage() {
  const { preferences, updatePreferences } = usePreferences();
  const [theme, setTheme] = useState(preferences.theme || 'light');
  const [language, setLanguage] = useState(preferences.language || 'en');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      await updatePreferences({ theme, language });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-onSurface">Settings</h2>
        <p className="text-muted mt-1">Manage your preferences and appearance</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('success') 
              ? 'bg-success-bg text-success-fg' 
              : 'bg-error-bg text-error-fg'
          }`}>
            {message}
          </div>
        )}

        {/* Theme Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-onSurface mb-2">
            Theme
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">☀️</div>
                <div className="font-medium">Light</div>
              </div>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">🌙</div>
                <div className="font-medium">Dark</div>
              </div>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-onSurface mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'es' | 'pt')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="pt">Português</option>
          </select>
          <p className="text-xs text-muted mt-1">
            Language support is coming soon
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition font-medium"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Table Preferences Info */}
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mt-6">
        <h3 className="text-lg font-semibold text-onSurface mb-2">Table Preferences</h3>
        <p className="text-sm text-muted">
          Your table sorting preferences are automatically saved. Click on any sortable column header to sort the data.
        </p>
      </div>
    </div>
  );
}
