import { useMemo, useState, useEffect } from 'react';
import { FileDown, FileText } from 'lucide-react';
import { api } from '../services/api';
import { exportToCSV, exportToPDF } from '../services/export';

const WEEK_LABELS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

function getWeekOfMonth(dateStr) {
  const day = new Date(dateStr + 'T00:00:00').getDate();
  return Math.floor((day - 1) / 7);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function getWeekDateRange(year, month, weekIndex) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDay = weekIndex * 7 + 1;
  const endDay = Math.min((weekIndex + 1) * 7, daysInMonth);
  return {
    from: `${year}-${pad(month)}-${pad(startDay)}`,
    to: `${year}-${pad(month)}-${pad(endDay)}`,
  };
}

export default function WeeklyStats({ trades, accountCapital, accountId, year, month }) {
  const [yearStats, setYearStats] = useState(null);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    if (!accountCapital || accountCapital <= 0) return;
    api.stats.getYear(year, accountId).then(setYearStats).catch(() => {});
  }, [year, accountId, accountCapital]);

  const data = useMemo(() => {
    if (!trades || trades.length === 0 || !accountCapital || accountCapital <= 0) return null;

    const weekly = {};
    let monthPnl = 0, monthWins = 0, monthLosses = 0;

    trades.forEach((t) => {
      const w = getWeekOfMonth(t.trade_date);
      const pnl = parseFloat(t.pnl_amount);
      if (!weekly[w]) weekly[w] = { pnl: 0, wins: 0, losses: 0 };
      weekly[w].pnl += pnl;
      if (pnl >= 0) weekly[w].wins += 1;
      else weekly[w].losses += 1;
      monthPnl += pnl;
      if (pnl >= 0) monthWins += 1;
      else monthLosses += 1;
    });

    const monthPct = (monthPnl / accountCapital) * 100;
    const monthR = Math.round(monthPct * 10) / 10;

    const items = Object.entries(weekly).map(([w, d]) => {
      const pct = (d.pnl / accountCapital) * 100;
      const r = Math.round(pct * 10) / 10;
      return { week: parseInt(w), pnl: d.pnl, pct: r, wins: d.wins, losses: d.losses };
    }).sort((a, b) => a.week - b.week);

    return { weeks: items, monthPnl, monthPct: monthR, monthWins, monthLosses };
  }, [trades, accountCapital]);

  const handleExport = async (from, to, label, format) => {
    const key = `${from}-${to}-${format}`;
    setExporting(key);
    try {
      const params = { from, to };
      if (accountId) params.account_id = accountId;
      const res = await api.trades.export(params);
      const periodLabel = `${label}-${from}`;
      if (format === 'csv') {
        exportToCSV(res.trades, periodLabel);
      } else {
        exportToPDF(res.trades, { from, to, label, accountCapital });
      }
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(null);
    }
  };

  if (!data || data.weeks.length === 0) return null;

  const yearPnl = yearStats ? parseFloat(yearStats.total_pnl) : 0;
  const yearPct = accountCapital > 0 ? Math.round((yearPnl / accountCapital) * 100 * 10) / 10 : 0;
  const yearTrades = yearStats ? (yearStats.total_trades || 0) : 0;
  const daysInMonth = new Date(year, month, 0).getDate();

  const ExportBtns = ({ from, to, label }) => (
    <div className="flex items-center justify-center gap-2 mt-1">
      <button
        onClick={(e) => { e.stopPropagation(); handleExport(from, to, label, 'csv'); }}
        disabled={exporting === `${from}-${to}-csv`}
        className="text-neutral-500 hover:text-white transition-colors disabled:opacity-30"
        title={`Export ${label} as CSV`}
      >
        <FileDown className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleExport(from, to, label, 'pdf'); }}
        disabled={exporting === `${from}-${to}-pdf`}
        className="text-neutral-500 hover:text-white transition-colors disabled:opacity-30"
        title={`Export ${label} as PDF`}
      >
        <FileText className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <div className="mb-4 bg-neutral-900 rounded-xl border border-neutral-800 p-3 sm:p-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
        {data.weeks.map((w) => {
          const range = getWeekDateRange(year, month, w.week);
          return (
            <div key={w.week} className="bg-neutral-800/60 rounded-lg p-3 sm:p-4 text-center min-w-0">
              <div className="text-[10px] sm:text-xs text-neutral-400 mb-1 sm:mb-2">{WEEK_LABELS[w.week]}</div>
              <div className={`text-base sm:text-xl font-bold mb-1 sm:mb-2 ${w.pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {w.pct > 0 ? '+' : ''}{w.pct}%
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
                <span className="text-emerald-400/80">W:{w.wins}</span>
                <span className="text-red-400/80">L:{w.losses}</span>
              </div>
              <ExportBtns from={range.from} to={range.to} label={`Week ${w.week + 1}`} />
            </div>
          );
        })}
        <div className="bg-emerald-900/20 rounded-lg p-3 sm:p-4 text-center ring-1 ring-emerald-700/30 min-w-0">
          <div className="text-[10px] sm:text-xs text-neutral-400 mb-1 sm:mb-2">Month</div>
          <div className={`text-base sm:text-xl font-bold mb-1 sm:mb-2 ${data.monthPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {data.monthPct > 0 ? '+' : ''}{data.monthPct}%
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
            <span className="text-emerald-400/80">W:{data.monthWins}</span>
            <span className="text-red-400/80">L:{data.monthLosses}</span>
          </div>
          <ExportBtns from={`${year}-${pad(month)}-01`} to={`${year}-${pad(month)}-${pad(daysInMonth)}`} label="Month" />
        </div>
        <div className="bg-neutral-800/60 rounded-lg p-3 sm:p-4 text-center ring-1 ring-neutral-600/30 min-w-0">
          <div className="text-[10px] sm:text-xs text-neutral-400 mb-1 sm:mb-2">{year}</div>
          <div className={`text-base sm:text-xl font-bold mb-1 sm:mb-2 ${yearPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {yearPct > 0 ? '+' : ''}{yearPct}%
          </div>
          <div className="text-[10px] sm:text-xs text-white mb-1">{yearTrades} trade{yearTrades !== 1 ? 's' : ''}</div>
          <ExportBtns from={`${year}-01-01`} to={`${year}-12-31`} label="Year" />
        </div>
      </div>
    </div>
  );
}
