import React, { useState } from 'react';
import { register } from '../../utils/api';
import { 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Box, 
  Alert 
} from '@mui/material';

const Register = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ email, password });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
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
        autoComplete="new-password"
        value={password}
        onChange={onChange}
        helperText="Must be at least 8 characters"
      />

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Register'}
      </Button>
    </Box>
  );
};

export default Register;
