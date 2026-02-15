import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Box 
} from '@mui/material';

const ExpenseForm = ({ onAddExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || !category) return;
    onAddExpense({ 
      description, 
      amount: parseFloat(amount), // Ensure amount is sent as a number
      category 
    });
    setDescription('');
    setAmount('');
    setCategory('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        required
      />
      <FormControl fullWidth required>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <MenuItem value="Housing">Housing`</MenuItem>
          <MenuItem value="Food">Food</MenuItem>
          <MenuItem value="Utilities">Utilities</MenuItem>
          <MenuItem value="Transportation">Transportation</MenuItem>
          <MenuItem value="Savings & Investments">Savings & Investing</MenuItem>
          <MenuItem value="Debt Payments">Debt Payments</MenuItem>
          <MenuItem value="Health & Personal Care">Health & Personal Care</MenuItem>
          <MenuItem value="Entertainment & Leisure">Entertainment & Leisure</MenuItem>
          <MenuItem value="Insurance">Transportation</MenuItem>
          <MenuItem value="Transportation">Transportation</MenuItem>
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary">
        Add Expense
      </Button>
    </Box>
  );
};

export default ExpenseForm;