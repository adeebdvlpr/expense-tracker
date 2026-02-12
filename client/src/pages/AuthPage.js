import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../utils/api';
import { TextField, Button, Typography, Container, Box, Alert, Tab, Tabs } from '@mui/material';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await (isLogin ? login(formData) : register(formData));
      if (res.data && res.data.token) {
        sessionStorage.setItem('token', res.data.token);
        // Use window.location.href instead of navigate
        window.location.href = '/';
      } else {
        throw new Error('No token received from server');
      }
    } catch (err) {
      console.error('Auth error:', err.response || err);
      setError(err.response?.data?.message || err.message || `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
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
          <img src="/logo.png"  style={{ width: '300px', height: 'auto' }} />
        </Box>
        <Typography component="h2" variant="h5">
          {isLogin ? 'Sign In' : 'Register'}
        </Typography>
        <Tabs value={isLogin ? 0 : 1} onChange={(e, newValue) => setIsLogin(newValue === 0)} sx={{ mb: 2 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={onChange}
          />
            <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AuthPage;