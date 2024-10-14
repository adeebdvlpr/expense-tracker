// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Login from '../components/Auth/Login';
// import Register from '../components/Auth/Register';

// const AuthPage = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const navigate = useNavigate();

//   const handleAuthSuccess = (token) => {
//     localStorage.setItem('token', token);
//     navigate('/');
//   };

//   return (
//     <div>
//       {isLogin ? (
//         <Login onLoginSuccess={handleAuthSuccess} />
//       ) : (
//         <Register onRegisterSuccess={handleAuthSuccess} />
//       )}
//       <button onClick={() => setIsLogin(!isLogin)}>
//         {isLogin ? 'Need to register?' : 'Already have an account?'}
//       </button>
//     </div>
//   );
// };

// export default AuthPage;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { login, register } from '../utils/api.js';

// const AuthPage = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = isLogin 
//         ? await login({ email, password })
//         : await register({ email, password });
      
//       localStorage.setItem('token', response.data.token);
//       navigate('/');
//     } catch (error) {
//       console.error('Authentication error:', error.response?.data || error.message);
//       // Handle error (e.g., show error message to user)
//     }
//   };

//   return (
//     <div>
//       <h2>{isLogin ? 'Login' : 'Register'}</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Email"
//           required
//         />
//         <input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Password"
//           required
//         />
//         <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
//       </form>
//       <button onClick={() => setIsLogin(!isLogin)}>
//         {isLogin ? 'Need to register?' : 'Already have an account?'}
//       </button>
//     </div>
//   );
// };

// export default AuthPage;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { login } from '../utils/api';
// import { TextField, Button, Typography, Container, Box, Alert } from '@mui/material';

// const AuthPage = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const { email, password } = formData;

//   const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

//   const onSubmit = async e => {
//     e.preventDefault();
//     setError('');
//     try {
//       console.log('Attempting login with:', { email }); // Log email for debugging
//       const res = await login(formData);
//       console.log('Login response:', res.data);
//       localStorage.setItem('token', res.data.token);
//       navigate('/');
//     } catch (err) {
//       console.error('Login error:', err.response?.data || err.message);
//       setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
//     }
//   };

//   return (
//     <Container component="main" maxWidth="xs">
//       <Box
//         sx={{
//           marginTop: 8,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//         }}
//       >
//         <Typography component="h1" variant="h5">
//           Sign in
//         </Typography>
//         <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
//           {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
//           <TextField
//             margin="normal"
//             required
//             fullWidth
//             id="email"
//             label="Email Address"
//             name="email"
//             autoComplete="email"
//             autoFocus
//             value={email}
//             onChange={onChange}
//           />
//           <TextField
//             margin="normal"
//             required
//             fullWidth
//             name="password"
//             label="Password"
//             type="password"
//             id="password"
//             autoComplete="current-password"
//             value={password}
//             onChange={onChange}
//           />
//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{ mt: 3, mb: 2 }}
//           >
//             Sign In
//           </Button>
//         </Box>
//       </Box>
//     </Container>
//   );
// };

// export default AuthPage;
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