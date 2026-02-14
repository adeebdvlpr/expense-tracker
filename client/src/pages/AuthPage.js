import React, { useState } from 'react';
import { login, register } from '../utils/api';
import Register from '../components/auth/Register.js';
import Login from '../components/auth/Login.js';
import { Typography, Container, Box, Alert, Tab, Tabs } from '@mui/material';

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
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <img
           src="/logo.png" 
           alt="Cashflow Compass logo"  
           style={{ width: '300px', height: 'auto' }}
          />
        </Box>

        <Typography component="h2" variant="h5">
          {isLogin ? 'Sign In' : 'Register'}
        </Typography>

        <Tabs value={isLogin ? 0 : 1} onChange={( handleTabChange)} sx={{ mb: 2 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLogin ? (
          <Login onSubmit={handleAuthSubmit} isLoading={isLoading} />
        ) : (
          <Register onSubmit={handleAuthSubmit} isLoading={isLoading} />
        )}
        </Box>
    </Container>
  );
};

export default AuthPage;