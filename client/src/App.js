import React, { createContext, useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme, DEFAULT_THEME } from './theme';

import MarketingLandingPage from './pages/MarketingLandingPage';
import ExpenseTracker from './pages/ExpenseTracker';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';
import RecurringPage from './pages/RecurringPage';
import AssetsPage from './pages/AssetsPage';
import LifeEventsPage from './pages/LifeEventsPage';

export const ThemeContext = createContext({
  selectedTheme: DEFAULT_THEME,
  setSelectedTheme: () => {},
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedThemeState] = useState(() => {
    return localStorage.getItem('appTheme') || DEFAULT_THEME;
  });

  const setSelectedTheme = (name) => {
    setSelectedThemeState(name);
    localStorage.setItem('appTheme', name);
  };

  const theme = useMemo(() => createAppTheme(selectedTheme), [selectedTheme]);

  const themeContextValue = useMemo(
    () => ({ selectedTheme, setSelectedTheme }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedTheme],
  );

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('token');
      setIsAuthenticated(Boolean(token));
      setIsLoading(false);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
                  {/* PUBLIC ...*/}
            <Route
              path="/"
              element={<MarketingLandingPage />}
            />
                  {/* AUTH ...*/}
            <Route
              path="/auth"
              element={isAuthenticated ? <Navigate to="/app" replace /> : <AuthPage />}
            />
                  {/* PROTECTED ...*/}
            <Route
              path="/app"
              element={isAuthenticated ? <ExpenseTracker /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/account"
              element={isAuthenticated ? <AccountPage /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/budgets"
              element={isAuthenticated ? <BudgetsPage /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/goals"
              element={isAuthenticated ? <GoalsPage /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/recurring"
              element={isAuthenticated ? <RecurringPage /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/assets"
              element={isAuthenticated ? <AssetsPage /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/life-events"
              element={isAuthenticated ? <LifeEventsPage /> : <Navigate to="/auth" replace />}
            />

                  {/* CATCH ALL ...*/}
            <Route path="*" element={<Navigate to="/" replace />}/>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default App;
