import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


const Login = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const { identifier, password } = formData;
  const [showPassword, setShowPassword] = React.useState(false);

 

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };


  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ identifier, password });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="identifier"
        label="Username or Email"
        name="identifier"
        autoComplete="identifier"
        autoFocus
        value={identifier}
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

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Sign In'}
      </Button>
    </Box>
  );
};

export default Login;
