// import React, { useState } from 'react';
// import { login } from '../../utils/api';

// const Login = ({ onLoginSuccess }) => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');

//   const { email, password } = formData;

//   const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

//   const onSubmit = async e => {
//     e.preventDefault();
//     setError('');
//     try {
//       console.log('Attempting login with:', formData);
//       const res = await login(formData);
//       console.log('Login response:', res.data);
//       onLoginSuccess(res.data.token);
//     } catch (err) {
//       console.error('Login error:', err.response?.data || err.message);
//       setError(err.response?.data?.message || 'Login failed. Please try again.');
//     }
//   };

//   return (
//     <form onSubmit={onSubmit}>
//       {error && <p className="error">{error}</p>}
//       <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
//       <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
//       <button type="submit">Login</button>
//     </form>
//   );
// };

// export default Login;

import React, { useState } from 'react';
import { login } from '../../utils/api';
import { 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Box, 
  Alert 
} from '@mui/material';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting login with:', formData);
      const res = await login(formData);
      console.log('Login response:', res.data);
      onLoginSuccess(res.data.token);
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
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
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;