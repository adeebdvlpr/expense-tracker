import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import ExpenseTracker from './pages/ExpenseTracker';
import AuthPage from './pages/AuthPage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('token');
      console.log('Checking authentication:', token ? 'Token found' : 'No token');
      setIsAuthenticated(!!token);
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
          <Route 
            path="/auth" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <ExpenseTracker /> : <Navigate to="/auth" replace />} 
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;