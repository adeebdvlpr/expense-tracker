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
  MenuItem
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


const reasonOptions = [
  { value: 'Budgeting',label: 'Budgeting' },
  { value: 'Saving', label: 'Saving'}, 
  { value: 'Debt', label: 'Debt Managment'}, 
  { value: 'Tracking', label: 'Expense Tracking'}, 
  { value: 'Other', label: 'Other'}
];

const Register = ({ onSubmit, isLoading }) => {
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

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Register'}
      </Button>
    </Box>
  );
};

export default Register;

/*
Use something lik ethis for PASSWORD WHEN I GET BACK + Finish front end (client) changes for new form --- thinking 
email + username?+ password required (visibilioty eye)....make the rest optional. Then have an account 
area where they can add that to account post initial registration 

_______

<FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? 'hide the password' : 'display the password'
                  }
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  onMouseUp={handleMouseUpPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
*/