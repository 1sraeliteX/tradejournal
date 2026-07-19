import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DEFAULT_COLORS = {
  win: '#10b981',
  loss: '#ef4444',
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

const TradeColorContext = createContext(null);

export function TradeColorProvider({ children }) {
  const [colors, setColors] = useState(() => {
    try {
      const saved = localStorage.getItem('trade_colors');
      if (saved) return { ...DEFAULT_COLORS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_COLORS;
  });

  useEffect(() => {
    localStorage.setItem('trade_colors', JSON.stringify(colors));
    document.documentElement.style.setProperty('--win-color', colors.win);
    document.documentElement.style.setProperty('--loss-color', colors.loss);
    const winRgb = hexToRgb(colors.win);
    const lossRgb = hexToRgb(colors.loss);
    if (winRgb) document.documentElement.style.setProperty('--win-color-rgb', winRgb.join(' '));
    if (lossRgb) document.documentElement.style.setProperty('--loss-color-rgb', lossRgb.join(' '));
  }, [colors]);

  const updateColors = useCallback((newColors) => {
    setColors(prev => ({ ...prev, ...newColors }));
  }, []);

  return (
    <TradeColorContext.Provider value={{ colors, updateColors }}>
      {children}
    </TradeColorContext.Provider>
  );
}

export const useTradeColors = () => useContext(TradeColorContext);
