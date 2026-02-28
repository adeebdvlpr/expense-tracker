import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import MarketingLandingPage from './pages/MarketingLandingPage';
import ExpenseTracker from './pages/ExpenseTracker';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

                {/* CATCH ALL ...*/}
          <Route path="*" element={<Navigate to="/" replace />}/> 
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;