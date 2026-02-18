import React, { useMemo, useState } from 'react';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

  const [touched, setTouched] = useState({
    description: false,
    amount: false,
    category: false,
  });

  const [submittedOnce, setSubmittedOnce] = useState(false);

  const amountNumber = useMemo(() => Number(amount), [amount]);

  const errors = useMemo(() => {
    const descError = !description.trim() ? 'Description is required.' : '';
    const amountError =
      !amount || Number.isNaN(amountNumber) || amountNumber <= 0
        ? 'Enter a valid amount greater than 0.'
        : '';
    const categoryError = !category ? 'Category is required.' : '';

    return { description: descError, amount: amountError, category: categoryError };
  }, [description, amount, amountNumber, category]);

  const showError = (field) => submittedOnce || touched[field];

  const hasErrors = Boolean(errors.description || errors.amount || errors.category);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedOnce(true);

    if (hasErrors) return;

    onAddExpense({
      description: description.trim(),
      amount: Number(amountNumber.toFixed(2)),
      category,
    });

    // reset form
    setDescription('');
    setAmount('');
    setCategory('');
    setTouched({ description: false, amount: false, category: false });
    setSubmittedOnce(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, description: true }))}
          required
          error={showError('description') && Boolean(errors.description)}
          helperText={(showError('description') && errors.description) || ' '}
        />

        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
          required
          inputProps={{ min: 0, step: '0.01' }}
          error={showError('amount') && Boolean(errors.amount)}
          helperText={(showError('amount') && errors.amount) || ' '}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />

        <FormControl 
          required 
          error={showError('category') && Boolean(errors.category)}
        >
          <InputLabel id="expense-category-label">Category</InputLabel>
          <Select
            labelId="expense-category-label"
            id="expense-category"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, category: true }))}
          >
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {(showError('category') && errors.category) || ' '}
          </FormHelperText>
        </FormControl>

        <Button type="submit" variant="contained">
          Add Expense
        </Button>
      </Stack>
    </form>
  );
};

export default ExpenseForm;
