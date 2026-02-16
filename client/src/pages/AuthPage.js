import React, { useState } from 'react';
import { login, register } from '../utils/api';
import Register from '../components/auth/Register.js';
import Login from '../components/auth/Login.js';
import { Typography, Container, Box, Alert, Tab, Tabs, Paper } from '@mui/material';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (_e, newValue) => {
    setIsLogin(newValue === 0);
    setError('');
  };

  const handleAuthSubmit = async (payload) => {
    setError('');
    setIsLoading(true);

    try {
      const data = isLogin
        ? await login({
            identifier: payload.identifier,
            password: payload.password,
          })
        : await register({
            username: payload.username,
            email: payload.email,
            password: payload.password,
            dateOfBirth: payload.dateOfBirth,
            reason: payload.reason,
          });

      if (!data?.token) {
        throw new Error('No token received from server'); 
      }
        sessionStorage.setItem('token', data.token);
        window.location.assign('/');
    } catch (err) {
      console.error('Auth error:', err.response || err);
      setError(
        err.response?.data?.message || 
        err.message ||
        `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src="/logo.png"
                alt="Cashflow Compass logo"
                style={{ width: 260, height: 'auto' }}
              />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" component="h1">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isLogin ? 'Sign in to continue tracking expenses.' : 'Start tracking your spending in minutes.'}
              </Typography>
            </Box>

            <Tabs
              value={isLogin ? 0 : 1}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 1 }}
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>

            {error && <Alert severity="error">{error}</Alert>}

            {isLogin ? (
              <Login onSubmit={handleAuthSubmit} isLoading={isLoading} />
            ) : (
              <Register onSubmit={handleAuthSubmit} isLoading={isLoading} />
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};


export default AuthPage;