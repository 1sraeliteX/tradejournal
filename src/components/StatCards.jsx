import { api } from '../services/api';
import { useState, useEffect } from 'react';

const cards = [
  { key: 'total_trades', label: 'Total Trades', icon: '📊' },
  { key: 'balance', label: 'Balance', icon: '💰' },
  { key: 'best_day', label: 'Best Day', icon: '📈' },
  { key: 'worst_day', label: 'Worst Day', icon: '📉' },
  { key: 'win_rate', label: 'Win Rate', icon: '🎯' },
];

export default function StatCards({ month, accountId, accountCapital, refreshKey }) {
  const [monthStats, setMonthStats] = useState(null);
  const [allTimeStats, setAllTimeStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const monthParams = `month=${month}${accountId ? `&account_id=${accountId}` : ''}`;
    Promise.all([
      api.stats.get(monthParams),
      api.stats.getAllTime(accountId),
    ]).then(([m, a]) => {
      setMonthStats(m);
      setAllTimeStats(a);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [month, accountId, refreshKey]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.key} className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 animate-pulse">
            <div className="h-4 bg-neutral-800 rounded w-16 mb-3" />
            <div className="h-8 bg-neutral-800 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (val) => {
    const abs = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return val < 0 ? `-$${abs}` : `$${abs}`;
  };

  const formatDayLabel = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  };

  const getValue = (card) => {
    if (!monthStats || !allTimeStats) return '-';
    if (card.key === 'total_trades') return allTimeStats.total_trades;
    if (card.key === 'balance') {
      const balance = accountCapital > 0 ? accountCapital + allTimeStats.total_pnl : allTimeStats.total_pnl;
      return formatCurrency(balance);
    }
    if (card.key === 'win_rate') return `${allTimeStats.win_rate}%`;
    return '-';
  };

  const getValueColor = (card) => {
    if (!monthStats || !allTimeStats) return 'text-white';
    if (card.key === 'balance') {
      const balance = accountCapital > 0 ? accountCapital + allTimeStats.total_pnl : allTimeStats.total_pnl;
      return balance >= 0 ? 'text-emerald-400' : 'text-red-400';
    }
    if (card.key === 'best_day') return 'text-emerald-400';
    if (card.key === 'worst_day') return monthStats.worst_day ? 'text-red-400' : 'text-neutral-400';
    return 'text-white';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.key} className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{card.icon}</span>
            <span className="text-neutral-400 text-sm">{card.label}</span>
          </div>
          {card.key === 'best_day' && monthStats.best_day ? (
            <div>
              <div className="text-xs text-neutral-500 mb-1">{formatDayLabel(monthStats.best_day.date)}</div>
              <div className="text-2xl font-bold text-emerald-400">+${Number(Math.abs(monthStats.best_day.pnl)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          ) : card.key === 'worst_day' && monthStats.worst_day ? (
            <div>
              <div className="text-xs text-neutral-500 mb-1">{formatDayLabel(monthStats.worst_day.date)}</div>
              <div className="text-2xl font-bold text-red-400">{formatCurrency(monthStats.worst_day.pnl)}</div>
            </div>
          ) : (
            <div className={`text-2xl font-bold ${getValueColor(card)}`}>
              {getValue(card)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
