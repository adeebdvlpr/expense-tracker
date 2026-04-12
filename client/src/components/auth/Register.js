import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Divider,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
  MenuItem,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);


const reasonOptions = [
  { value: 'Budgeting',label: 'Budgeting' },
  { value: 'Saving', label: 'Saving'}, 
  { value: 'Debt', label: 'Debt Managment'}, 
  { value: 'Tracking', label: 'Expense Tracking'}, 
  { value: 'Other', label: 'Other'}
];

const Register = ({ onSubmit, isLoading, onCancel }) => {
  const [formData, setFormData] = useState({username: '', email: '', password: '', dateOfBirth: '', reason: '' });
  const { username, email, password, dateOfBirth, reason} = formData;
  const [showPassword, setShowPassword] = React.useState(false);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ username, email, password, dateOfBirth, reason });
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
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        value={username}
        onChange={onChange}
      />

      <FormControl fullWidth margin="normal" required variant="outlined">
         <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
         <OutlinedInput
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={onChange}
            autoComplete="new-password"
            label="Password"
            endAdornment={
             <InputAdornment position="end">
               <IconButton
                 aria-label={showPassword ? 'hide the password' : 'display the password'}
                 onClick={handleClickShowPassword}
                 onMouseDown={handleMouseDownPassword}
                 onMouseUp={handleMouseUpPassword}
                 edge="end"
               >
                 {showPassword ? <VisibilityOff /> : <Visibility />}
               </IconButton>
             </InputAdornment>
           }
         />
         <FormHelperText> Must be at least 8 characters</FormHelperText>
       </FormControl>

      <TextField
        label="Date of Birth"
        type="date"
        name="dateOfBirth"  
        value={dateOfBirth}
        onChange={onChange}
        fullWidth
        margin="normal" 
        InputLabelProps={{
          shrink: true,
        }}
        inputProps={{
          max: new Date().toISOString().split('T')[0]
        }}
      />
      
       <TextField
          select
          fullWidth
          margin='normal'
          id="reason"
          label="Select Reason"
          name="reason"
          value={reason}
          onChange={onChange}
          helperText="Why are you using this app?"
        >
          {reasonOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

      <Stack direction="row" spacing={1} sx={{ mt: 3, mb: 2 }}>
        <Button
          type="button"
          variant="text"
          sx={{ flex: 1, color: 'text.secondary', fontSize: '0.75rem' }}
          onClick={onCancel}
          disabled={isLoading}
        >
          I'd rather not be financially stable
        </Button>
        <Button type="submit" variant="contained" sx={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Register'}
        </Button>
      </Stack>

      <Divider sx={{ my: 1 }}>
        <Typography variant="caption" color="text.secondary">or</Typography>
      </Divider>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={() => { window.location.href = `${API_BASE}/api/auth/google`; }}
        sx={{ mt: 1, textTransform: 'none' }}
      >
        Sign up with Google
      </Button>
    </Box>
  );
};

export default Register;