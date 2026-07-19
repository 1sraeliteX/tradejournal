import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TradeColorProvider } from './context/TradeColorContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <TradeColorProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
        </TradeColorProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
