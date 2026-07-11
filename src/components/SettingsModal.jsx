import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save, X as XIcon } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SettingsModal({ isOpen, onClose, onAccountsChange }) {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCapital, setFormCapital] = useState('');
  const [formLimit, setFormLimit] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setMessage('');
      setError('');
      loadAccounts();
    }
  }, [isOpen, user]);

  const loadAccounts = async () => {
    try {
      const data = await api.accounts.list();
      setAccounts(data.accounts);
    } catch {
      setAccounts([]);
    }
  };

  if (!isOpen) return null;

  const resetForm = () => {
    setShowForm(false);
    setEditingAccount(null);
    setFormName('');
    setFormCapital('');
    setFormLimit('');
  };

  const handleAddAccount = async () => {
    if (!formName.trim()) return;
    try {
      const payload = {
        name: formName.trim(),
        capital: parseFloat(formCapital) || 0,
      };
      const parsedLimit = formLimit === '' ? null : parseInt(formLimit, 10);
      if (parsedLimit !== null && (isNaN(parsedLimit) || parsedLimit < 1)) {
        setError('Max Trades Per Day must be a positive number or empty.');
        return;
      }
      if (parsedLimit !== null) payload.max_trades_per_day = parsedLimit;

      if (editingAccount) {
        await api.accounts.update(editingAccount.id, payload);
      } else {
        await api.accounts.create(payload);
      }
      resetForm();
      await loadAccounts();
      onAccountsChange?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await api.accounts.delete(id);
      await loadAccounts();
      onAccountsChange?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (account) => {
    setEditingAccount(account);
    setFormName(account.name);
    setFormCapital(String(account.capital || ''));
    setFormLimit(account.max_trades_per_day != null ? String(account.max_trades_per_day) : '');
    setShowForm(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">{error}</div>}
          {message && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg p-3 text-sm">{message}</div>}

          {/* Accounts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Trading Accounts</h3>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Account
              </button>
            </div>

            {showForm && (
              <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-4 mb-3 space-y-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Account Name</label>
                  <input
                    type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Personal, Prop Firm, Demo"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-400 mb-1">Capital ($)</label>
                    <input
                      type="text" inputMode="decimal" value={formCapital} onChange={(e) => setFormCapital(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-400 mb-1">Max Trades Per Day</label>
                    <input
                      type="text" inputMode="numeric" value={formLimit} onChange={(e) => setFormLimit(e.target.value)}
                      placeholder="No limit"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={resetForm}
                    className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg py-1.5 text-sm transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAddAccount}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-1.5 text-sm transition-colors">
                    {editingAccount ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            )}

            {accounts.length === 0 && !showForm && (
              <p className="text-sm text-neutral-500">No accounts yet. Add one to track separate trading accounts.</p>
            )}

            <div className="space-y-2">
              {accounts.map((a) => (
                <div key={a.id} className="bg-neutral-800 rounded-lg border border-neutral-700 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white">{a.name}</span>
                    {a.capital > 0 && (
                      <span className="text-xs text-neutral-400 ml-2">${Number(a.capital).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    )}
                    {a.max_trades_per_day != null && (
                      <span className="text-xs text-neutral-500 ml-2">max {a.max_trades_per_day}/day</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(a)} className="p-1.5 text-neutral-500 hover:text-white transition-colors rounded hover:bg-neutral-700">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteAccount(a.id)} className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors rounded hover:bg-neutral-700">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
