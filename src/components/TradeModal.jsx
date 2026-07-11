import { useState, useEffect } from 'react';

const MARKET_PAIRS = {
  forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'GBPJPY', 'EURGBP'],
  crypto: ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD'],
  commodities: ['XAUUSD', 'XAGUSD', 'WTI', 'BRENT', 'US30', 'SPX500'],
};

export default function TradeModal({ isOpen, onClose, onSave, trade, prefillDate, accounts, selectedAccountId }) {
  const [form, setForm] = useState({
    trade_date: '',
    account_id: '',
    market_type: 'forex',
    pair: 'EURUSD',
    lot_size: '',
    risk_type: 'amount',
    risk_value: '',
    result: 'win',
    pnl_amount: '',
    target_amount: '',
    risk_reward: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trade) {
      setForm({
        trade_date: trade.trade_date,
        account_id: trade.account_id || '',
        market_type: trade.market_type,
        pair: trade.pair,
        lot_size: trade.lot_size,
        risk_type: trade.risk_type,
        risk_value: trade.risk_value,
        result: trade.result,
        pnl_amount: Math.abs(trade.pnl_amount),
        target_amount: trade.target_amount || '',
        risk_reward: trade.risk_reward || '',
        notes: trade.notes || '',
      });
    } else {
      setForm({
        trade_date: prefillDate || new Date().toISOString().split('T')[0],
        account_id: selectedAccountId || '',
        market_type: 'forex',
        pair: 'EURUSD',
        lot_size: '',
        risk_type: 'amount',
        risk_value: '',
        result: 'win',
        pnl_amount: '',
        target_amount: '',
        risk_reward: '',
        notes: '',
      });
    }
  }, [trade, isOpen, prefillDate, selectedAccountId]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    const update = { ...form, [field]: value };
    if (field === 'market_type') {
      update.pair = MARKET_PAIRS[value][0];
    }
    setForm(update);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        lot_size: parseFloat(form.lot_size),
        risk_value: parseFloat(form.risk_value),
        pnl_amount: parseFloat(form.pnl_amount),
        target_amount: form.target_amount ? parseFloat(form.target_amount) : null,
      };
      if (form.result === 'loss') payload.pnl_amount = -Math.abs(payload.pnl_amount);
      if (form.result === 'win') payload.pnl_amount = Math.abs(payload.pnl_amount);

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">{trade ? 'Edit Trade' : 'Add Trade'}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {error && <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {accounts && accounts.length > 0 && (
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Account</label>
              <select value={form.account_id} onChange={(e) => handleChange('account_id', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}{a.capital > 0 ? ` ($${Number(a.capital).toLocaleString()})` : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Date</label>
            <input type="date" value={form.trade_date} onChange={(e) => handleChange('trade_date', e.target.value)} required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Market Type</label>
            <div className="flex gap-2">
              {['forex', 'crypto', 'commodities'].map((type) => (
                <button key={type} type="button" onClick={() => handleChange('market_type', type)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    form.market_type === type
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Pair</label>
            <select value={form.pair} onChange={(e) => handleChange('pair', e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500">
              {MARKET_PAIRS[form.market_type].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Lot Size</label>
              <input type="text" inputMode="decimal" value={form.lot_size} onChange={(e) => handleChange('lot_size', e.target.value)} required
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Risk/Reward</label>
              <select value={form.risk_reward} onChange={(e) => handleChange('risk_reward', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500">
                <option value="">Select</option>
                <option value="1:1">1:1</option>
                <option value="1:2">1:2</option>
                <option value="1:3">1:3</option>
                <option value="1:4">1:4</option>
                <option value="1:5">1:5</option>
                <option value="2:1">2:1</option>
                <option value="3:1">3:1</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Risk Value</label>
            <input type="text" inputMode="decimal" value={form.risk_value} onChange={(e) => handleChange('risk_value', e.target.value)} required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Target ($)</label>
            <input type="text" inputMode="decimal" value={form.target_amount} onChange={(e) => handleChange('target_amount', e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Risk Type</label>
            <div className="flex gap-2">
              {['amount', 'percentage'].map((type) => (
                <button key={type} type="button" onClick={() => handleChange('risk_type', type)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    form.risk_type === type
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}>
                  {type === 'amount' ? 'Amount ($)' : 'Percentage (%)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Result</label>
            <div className="flex gap-2">
              {['win', 'loss'].map((r) => (
                <button key={r} type="button" onClick={() => handleChange('result', r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    form.result === r
                      ? r === 'win' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}>
                  {r === 'win' ? 'Win' : 'Loss'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">P&L Amount ($)</label>
            <input type="text" inputMode="decimal" value={form.pnl_amount} onChange={(e) => handleChange('pnl_amount', e.target.value)} required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg py-2.5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2.5 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : trade ? 'Update Trade' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
