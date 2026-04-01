'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Save, RefreshCw, CreditCard, Wallet } from 'lucide-react';

interface PaymentConfig {
  [key: string]: string;
}

interface PaymentSetting {
  provider: string;
  enabled: boolean;
  config: PaymentConfig;
  updated_at: string;
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/payment-settings');
      const data = await res.json();
      
      if (res.ok) {
        setSettings(data.settings);
      } else {
        setError(data.error || 'Failed to fetch settings');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (provider: string, enabled: boolean) => {
    const setting = settings.find(s => s.provider === provider);
    if (!setting) return;

    await handleSave(provider, !enabled, setting.config);
  };

  const handleConfigChange = (provider: string, key: string, value: string) => {
    setSettings(prev => prev.map(s => 
      s.provider === provider 
        ? { ...s, config: { ...s.config, [key]: value } }
        : s
    ));
  };

  const handleSave = async (provider: string, enabled?: boolean, config?: PaymentConfig) => {
    setSaving(provider);
    setError('');
    setSuccess('');

    const setting = settings.find(s => s.provider === provider);
    if (!setting) return;

    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          enabled: enabled !== undefined ? enabled : setting.enabled,
          config: config || setting.config,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`${provider.toUpperCase()} settings saved successfully`);
        await fetchSettings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(null);
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'crypto':
        return <Wallet className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return 'from-blue-500 to-indigo-500';
      case 'paypal':
        return 'from-blue-600 to-blue-400';
      case 'paystack':
        return 'from-green-500 to-teal-500';
      case 'crypto':
        return 'from-gray-700 to-gray-900';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const renderConfigFields = (provider: string, config: PaymentConfig, enabled: boolean) => {
    const fields: { [key: string]: { label: string; type: string; placeholder: string }[] } = {
      stripe: [
        { label: 'Secret Key', type: 'password', placeholder: 'sk_live_...' },
        { label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...' },
        { label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...' },
      ],
      paypal: [
        { label: 'Client ID', type: 'password', placeholder: 'Your PayPal Client ID' },
        { label: 'Client Secret', type: 'password', placeholder: 'Your PayPal Client Secret' },
        { label: 'Mode', type: 'select', placeholder: 'sandbox' },
      ],
      paystack: [
        { label: 'Secret Key', type: 'password', placeholder: 'sk_live_...' },
        { label: 'Public Key', type: 'text', placeholder: 'pk_live_...' },
      ],
      crypto: [
        { label: 'BTC Address', type: 'text', placeholder: 'bc1q...' },
        { label: 'ETH Address', type: 'text', placeholder: '0x...' },
        { label: 'USDT Address', type: 'text', placeholder: '0x... (ERC-20)' },
        { label: 'LTC Address', type: 'text', placeholder: 'ltc1...' },
        { label: 'DOGE Address', type: 'text', placeholder: 'D...' },
      ],
    };

    const providerFields = fields[provider] || [];
    const configKeys = Object.keys(config);

    return (
      <div className="space-y-4">
        {providerFields.map((field, idx) => {
          const key = configKeys[idx];
          const isPassword = field.type === 'password';
          const fieldId = `${provider}-${key}`;

          if (field.type === 'select') {
            return (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <select
                  value={config[key] || 'sandbox'}
                  onChange={(e) => handleConfigChange(provider, key, e.target.value)}
                  disabled={!enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="live">Live (Production)</option>
                </select>
              </div>
            );
          }

          return (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={isPassword && !showSecrets[fieldId] ? 'password' : 'text'}
                  value={config[key] || ''}
                  onChange={(e) => handleConfigChange(provider, key, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={!enabled}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {isPassword && (
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility(fieldId)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showSecrets[fieldId] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-2">Configure payment providers for your platform</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid gap-6">
          {settings.map((setting) => (
            <div key={setting.provider} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${getProviderColor(setting.provider)} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getProviderIcon(setting.provider)}
                    <div>
                      <h2 className="text-xl font-bold capitalize">{setting.provider}</h2>
                      <p className="text-white/80 text-sm">
                        {setting.enabled ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.enabled}
                      onChange={() => handleToggle(setting.provider, setting.enabled)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-white/30"></div>
                  </label>
                </div>
              </div>

              {/* Config Form */}
              <div className="p-6">
                {renderConfigFields(setting.provider, setting.config, setting.enabled)}
                
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(setting.updated_at).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleSave(setting.provider)}
                    disabled={saving === setting.provider || !setting.enabled}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === setting.provider ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📝 Setup Instructions</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Stripe:</strong> Get keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="underline">dashboard.stripe.com</a></p>
            <p><strong>PayPal:</strong> Create app at <a href="https://developer.paypal.com/dashboard/applications" target="_blank" className="underline">developer.paypal.com</a></p>
            <p><strong>Paystack:</strong> Get keys from <a href="https://dashboard.paystack.com/#/settings/developer" target="_blank" className="underline">dashboard.paystack.com</a></p>
            <p><strong>Crypto:</strong> Generate wallet addresses from your preferred wallet provider</p>
          </div>
        </div>
      </div>
    </div>
  );
}
