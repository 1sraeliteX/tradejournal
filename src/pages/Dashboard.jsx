import { useState, useEffect, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import StatCards from '../components/StatCards';
import CalendarGrid from '../components/CalendarGrid';
import WeeklyStats from '../components/WeeklyStats';
import TradeModal from '../components/TradeModal';
import DayDetail from '../components/DayDetail';
import TradeList from '../components/TradeList';
import SettingsModal from '../components/SettingsModal';
import AccountSwitcher from '../components/AccountSwitcher';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTradeList, setShowTradeList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [prefillDate, setPrefillDate] = useState(null);
  const [limitError, setLimitError] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingCapital, setOnboardingCapital] = useState('');
  const [creating, setCreating] = useState(false);
  const [statsKey, setStatsKey] = useState(0);

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  const loadAccounts = useCallback(async () => {
    try {
      const data = await api.accounts.list();
      setAccounts(data.accounts);
    } catch {
      setAccounts([]);
    } finally {
      setAccountsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && selectedAccountId === null) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!onboardingName.trim()) return;
    setCreating(true);
    try {
      const data = await api.accounts.create({ name: onboardingName.trim(), capital: parseFloat(onboardingCapital) || 0 });
      await loadAccounts();
      setSelectedAccountId(data.id);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = `month=${monthStr}${selectedAccountId ? `&account_id=${selectedAccountId}` : ''}`;
      const data = await api.trades.list(params);
      setTrades(data.trades);
    } catch {
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, [monthStr, selectedAccountId]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const handlePrevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const handleSave = async (payload) => {
    if (editTrade) {
      await api.trades.update(editTrade.id, payload);
    } else {
      await api.trades.create(payload);
    }
    setEditTrade(null);
    setStatsKey(k => k + 1);
    await fetchTrades();
  };

  const handleEdit = (trade) => {
    setSelectedDay(null);
    setEditTrade(trade);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    await api.trades.delete(id);
    setStatsKey(k => k + 1);
    await fetchTrades();
  };

  const handleDayClick = (date) => {
    setSelectedDay(date);
  };

  const maxPerDay = selectedAccountId
    ? (accounts.find(a => a.id === selectedAccountId)?.max_trades_per_day ?? null)
    : null;

  const checkLimit = (date) => {
    if (!maxPerDay) return true;
    const count = trades.filter((t) => t.trade_date === date).length;
    if (count >= maxPerDay) {
      setLimitError(`Daily trade limit reached (${count}/${maxPerDay}). Adjust your limit in settings to add more.`);
      return false;
    }
    return true;
  };

  const handleDayAddTrade = (date) => {
    if (!checkLimit(date)) return;
    setLimitError('');
    setSelectedDay(null);
    setPrefillDate(date);
    setEditTrade(null);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditTrade(null);
    setPrefillDate(null);
  };

  const handleOpenAddTrade = () => {
    const today = new Date().toISOString().split('T')[0];
    if (!checkLimit(today)) return;
    setLimitError('');
    setPrefillDate(today);
    setEditTrade(null);
    setShowAddModal(true);
  };

  useEffect(() => {
    if (limitError) {
      const t = setTimeout(() => setLimitError(''), 4000);
      return () => clearTimeout(t);
    }
  }, [limitError]);

  const dayTrades = selectedDay ? trades.filter((t) => t.trade_date === selectedDay) : [];
  const accountCapital = selectedAccountId
    ? (accounts.find(a => a.id === selectedAccountId)?.capital || 0)
    : 0;

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-white">TradeJournal</h1>
            <AccountSwitcher
              accounts={accounts}
              selectedId={selectedAccountId}
              onSelect={setSelectedAccountId}
              onAccountsChange={loadAccounts}
            />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowTradeList(true)}
              className="text-sm text-neutral-400 hover:text-white transition-colors">
              Trades
            </button>
            <span className="text-neutral-500 text-sm">|</span>
            <button onClick={() => setShowSettings(true)}
              className="text-sm text-neutral-400 hover:text-white transition-colors">
              Settings
            </button>
            <span className="text-neutral-500 text-sm">|</span>
            <button onClick={toggleTheme}
              className="text-neutral-400 hover:text-white transition-colors p-1">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="text-neutral-500 text-sm">|</span>
            <span className="text-neutral-400 text-sm">{user?.name}</span>
            <button onClick={logout}
              className="text-sm text-neutral-500 hover:text-white transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!accountsLoaded ? null : accounts.length === 0 ? (
          <div className="max-w-md mx-auto mt-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to TradeJournal</h2>
            <p className="text-neutral-400 mb-8">Create your first trading account to get started.</p>
            <form onSubmit={handleCreateAccount} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-4 text-left">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Account Name</label>
                <input type="text" value={onboardingName} onChange={(e) => setOnboardingName(e.target.value)}
                  placeholder="e.g. Personal, Prop Firm, Demo"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" required />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Capital Amount ($)</label>
                <input type="number" step="0.01" min="0" value={onboardingCapital} onChange={(e) => setOnboardingCapital(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" required />
              </div>
              <button type="submit" disabled={creating}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {limitError && (
              <div className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg p-3 text-sm text-center">
                {limitError}
              </div>
            )}
            <StatCards month={monthStr} accountId={selectedAccountId} accountCapital={accountCapital} refreshKey={statsKey} />

            {accountCapital > 0 && (
              <div className="flex items-center gap-3 mb-4 bg-neutral-900 rounded-xl border border-neutral-800 px-5 py-3">
                <span className="text-sm text-neutral-400">Account Capital:</span>
                <span className="text-lg font-bold text-white">
                  ${Number(accountCapital).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <WeeklyStats trades={trades} accountCapital={accountCapital} accountId={selectedAccountId} year={year} />

            <CalendarGrid
              year={year}
              month={month}
              trades={trades}
              onDayClick={handleDayClick}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              accountCapital={accountCapital}
            />
          </>
        )}
      </main>

      <button
        onClick={handleOpenAddTrade}
        className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-colors z-40"
      >
        +
      </button>

      <TradeModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        trade={editTrade}
        prefillDate={prefillDate}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
      />

      <DayDetail
        date={selectedDay}
        trades={dayTrades}
        maxPerDay={maxPerDay}
        onClose={() => setSelectedDay(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddTrade={handleDayAddTrade}
        accountCapital={accountCapital}
      />

      <TradeList
        isOpen={showTradeList}
        onClose={() => setShowTradeList(false)}
        trades={trades}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddTrade={handleOpenAddTrade}
        accountCapital={accountCapital}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onAccountsChange={loadAccounts}
      />
    </div>
  );
}
