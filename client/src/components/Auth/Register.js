// import React, { useState } from 'react';
// import axios from 'axios';
// // import React, { useState } from 'react';
// import { register } from '../../utils/api';

// const Register = ({ onRegisterSuccess }) => {
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//   });

//   const { username, email, password } = formData;

//   const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

//   const onSubmit = async e => {
//     e.preventDefault();
//     try {
//       const res = await register(formData);
//       console.log(res.data);
//       onRegisterSuccess(res.data.token);
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//       // Add some user feedback here, e.g., set an error state and display it
//     }
//   };

//   return (
//     <form onSubmit={onSubmit}>
//       <input type="text" placeholder="Username" name="username" value={username} onChange={onChange} required />
//       <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
//       <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
//       <button type="submit">Register</button>
//     </form>
//   );
// };

// export default Register;

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

const Register = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    // username: '',
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
      const res = await register(formData);
      console.log(res.data);
      onRegisterSuccess(res.data.token);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          Register
        </Typography>
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {/* <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={onChange}
          /> */}
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
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;