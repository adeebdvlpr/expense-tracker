import React, { createContext, useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme, DEFAULT_THEME } from './theme';
import { AdvisoryProvider } from './context/AdvisoryContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { getMe, registerAuthFailureCallback } from './utils/api';
import AppLayout from './components/AppLayout';


import MarketingLandingPage from './pages/MarketingLandingPage';
import ExpenseTracker from './pages/ExpenseTracker';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';
import RecurringPage from './pages/RecurringPage';
import AssetsPage from './pages/AssetsPage';
import LifeEventsPage from './pages/LifeEventsPage';
import PredictionsPage from './pages/PredictionsPage';

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
    // Register the callback BEFORE calling getMe() so the interceptor can
    // flip auth state if the refresh token is also expired.
    registerAuthFailureCallback(() => setIsAuthenticated(false));

    let cancelled = false;

    const checkAuth = async () => {
      try {
        await getMe();
        if (!cancelled) setIsAuthenticated(true);
      } catch {
        // Interceptor already attempted a silent refresh. If we're here,
        // both tokens are gone — stay unauthenticated.
        if (!cancelled) setIsAuthenticated(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkAuth();

    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AdvisoryProvider isAuthenticated={isAuthenticated}>
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
                  {/* PROTECTED — single persistent AppLayout shell; never unmounts on navigation */}
            <Route
              element={
                isAuthenticated
                  ? <AppLayout><Outlet /></AppLayout>
                  : <Navigate to="/auth" replace />
              }
            >
              <Route path="/app"         element={<ExpenseTracker />} />
              <Route path="/account"     element={<AccountPage />} />
              <Route path="/budgets"     element={<BudgetsPage />} />
              <Route path="/goals"       element={<GoalsPage />} />
              <Route path="/recurring"   element={<RecurringPage />} />
              <Route path="/assets"      element={<AssetsPage />} />
              <Route path="/life-events" element={<LifeEventsPage />} />
              <Route path="/predictions" element={<PredictionsPage />} />
            </Route>

                  {/* CATCH ALL ...*/}
            <Route path="*" element={<Navigate to="/" replace />}/>
          </Routes>
        <Analytics />
        <SpeedInsights />
        </BrowserRouter>
        </AdvisoryProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default App;
