import { X, Edit2, Trash2, Plus } from 'lucide-react';

function calcDayPct(trades, capital) {
  if (!capital || capital <= 0) return null;
  const pnl = trades.reduce((s, t) => s + parseFloat(t.pnl_amount), 0);
  const pct = (pnl / capital) * 100;
  const r = Math.round(pct * 10) / 10;
  if (r > 0) return `+${r}%`;
  if (r < 0) return `${r}%`;
  return null;
}

export default function DayDetail({ date, trades, maxPerDay, onClose, onEdit, onDelete, onAddTrade, accountCapital }) {
  if (!date) return null;

  const formatCurrency = (val) => {
    const abs = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return val < 0 ? `-$${abs}` : `$${abs}`;
  };

  const calcTradePct = (trade) => {
    if (trade.risk_type !== 'amount') return null;
    const risk = parseFloat(trade.risk_value);
    if (risk <= 0) return null;
    const pnl = parseFloat(trade.pnl_amount);
    const target = trade.target_amount ? parseFloat(trade.target_amount) : null;
    const base = target && target > 0 ? target : risk;
    const pct = (pnl / base) * 100;
    const r = Math.round(pct * 10) / 10;
    if (r > 0) return `+${r}%`;
    if (r < 0) return `${r}%`;
    return '0%';
  };

  const dayTotal = trades.reduce((sum, t) => sum + parseFloat(t.pnl_amount), 0);
  const dayPctText = calcDayPct(trades, accountCapital);
  const dayTotalDisplay = dayPctText || (dayTotal >= 0 ? `+$${Math.round(dayTotal)}` : `-$${Math.round(Math.abs(dayTotal))}`);
  const atLimit = maxPerDay ? trades.length >= maxPerDay : false;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-semibold text-white">{date}</h2>
            {trades.length > 0 && (
              <span className={`text-sm font-medium ${dayTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                Day total: {dayTotalDisplay}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {trades.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-neutral-500 mb-6">No trades recorded for this day.</p>
            <button
              onClick={() => onAddTrade(date)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Trade
            </button>
          </div>
        )}

        <div className="p-4 space-y-3">
          {trades.length > 0 && (
            <div className="text-xs text-neutral-500 px-1 mb-2">
              {trades.length}{maxPerDay ? `/${maxPerDay}` : ''} trades today
            </div>
          )}
          {trades.map((trade) => (
            <div key={trade.id} className="bg-neutral-800 rounded-lg border border-neutral-700 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-white font-medium">{trade.pair}</span>
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                    trade.result === 'win' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
                  }`}>
                    {trade.result.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(trade)} className="p-1.5 text-neutral-400 hover:text-white transition-colors rounded hover:bg-neutral-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(trade.id)} className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors rounded hover:bg-neutral-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-neutral-500">Market:</span> <span className="text-neutral-300 capitalize">{trade.market_type}</span></div>
                <div><span className="text-neutral-500">Lot:</span> <span className="text-neutral-300">{trade.lot_size}</span></div>
                <div><span className="text-neutral-500">Risk:</span> <span className="text-neutral-300">{trade.risk_type === 'amount' ? '$' : ''}{trade.risk_value}{trade.risk_type === 'percentage' ? '%' : ''}</span></div>
                <div><span className="text-neutral-500">Target:</span> <span className="text-neutral-300">{trade.target_amount ? `$${Number(trade.target_amount).toLocaleString()}` : '-'}</span></div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-sm font-semibold ${trade.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(trade.pnl_amount)}
                </span>
                {calcTradePct(trade) && (
                  <span className={`text-xs font-medium ${trade.result === 'win' ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                    {calcTradePct(trade)}
                  </span>
                )}
              </div>
              {trade.notes && (
                <p className="mt-2 text-sm text-neutral-400 border-t border-neutral-700 pt-2">{trade.notes}</p>
              )}
            </div>
          ))}
        </div>

        {trades.length > 0 && !atLimit && (
          <div className="p-4 border-t border-neutral-800">
            <button
              onClick={() => onAddTrade(date)}
              className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 rounded-lg font-medium transition-colors border border-neutral-700"
            >
              <Plus className="w-4 h-4" />
              Add Another Trade
            </button>
          </div>
        )}

        {atLimit && (
          <div className="p-4 border-t border-neutral-800">
            <p className="text-center text-sm text-amber-400">
              Daily trade limit reached ({trades.length}/{maxPerDay}). Adjust your limit in settings to add more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
