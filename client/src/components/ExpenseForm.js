import React, { useMemo, useState } from 'react';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  InputAdornment,
  FormHelperText,
  Stack,
} from '@mui/material';

const CATEGORIES = [
  'Housing',
  'Food',
  'Utilities',
  'Transportation',
  'Savings & Investments',
  'Debt Payments',
  'Health & Personal Care',
  'Entertainment & Leisure',
  'Insurance',
  'Other',
];

const ExpenseForm = ({ onAddExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(''); // keep as string for input UX
  const [category, setCategory] = useState('');
  const [touched, setTouched] = useState(false);

  const amountNumber = useMemo(() => Number(amount), [amount]);

  const errors = {
    description: touched && !description.trim() ? 'Description is required.' : '',
    amount:
      touched && (!amount || Number.isNaN(amountNumber) || amountNumber <= 0)
        ? 'Enter a valid amount greater than 0.'
        : '',
    category: touched && !category ? 'Category is required.' : '',
  };

  const hasErrors = Boolean(errors.description || errors.amount || errors.category);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    if (hasErrors) return;

    onAddExpense({
      description: description.trim(),
      amount: Number(amountNumber.toFixed(2)),
      category,
    });

    setDescription('');
    setAmount('');
    setCategory('');
    setTouched(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => setTouched(true)}
          required
          error={Boolean(errors.description)}
          helperText={errors.description || ' '}
        />

        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={() => setTouched(true)}
          required
          inputProps={{ min: 0, step: '0.01' }}
          error={Boolean(errors.amount)}
          helperText={errors.amount || ' '}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />

        <FormControl required error={Boolean(errors.category)}>
          <InputLabel id="expense-category-label">Category</InputLabel>
          <Select
            labelId="expense-category-label"
            id="expense-category"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onBlur={() => setTouched(true)}
          >
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.category || ' '}</FormHelperText>
        </FormControl>

        <Button type="submit" variant="contained">
          Add Expense
        </Button>
      </Stack>
    </Box>
  );
};

export default ExpenseForm;
