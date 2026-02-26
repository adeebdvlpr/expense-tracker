//Using this in the budgetPage

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { CATEGORIES } from '../constants/categories';

export default function BudgetForm({
  period,
  onPeriodChange,
  onSaveBudget,
  loading = false,
}) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const [touched, setTouched] = useState({ category: false, amount: false, period: false });
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const amountNumber = useMemo(() => Number(amount), [amount]);

  const errors = useMemo(() => {
    const periodErr = !period ? 'Month is required.' : '';
    const categoryErr = !category ? 'Category is required.' : '';
    const amountErr =
      !amount || Number.isNaN(amountNumber) || amountNumber <= 0
        ? 'Enter a valid amount greater than 0.'
        : '';
    return { period: periodErr, category: categoryErr, amount: amountErr };
  }, [period, category, amount, amountNumber]);

  const showError = (field) => submittedOnce || touched[field];

  const hasErrors = Boolean(errors.period || errors.category || errors.amount);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedOnce(true);
    if (hasErrors) return;

    onSaveBudget?.({
      period,
      category,
      amount: Number(amountNumber.toFixed(2)),
    });

    // reset (keep period)
    setCategory('');
    setAmount('');
    setTouched({ category: false, amount: false, period: false });
    setSubmittedOnce(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        Add / update a budget
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Month"
            type="month"
            value={period}
            onChange={(e) => onPeriodChange?.(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, period: true }))}
            fullWidth
            size="small"
            required
            error={showError('period') && Boolean(errors.period)}
            helperText={(showError('period') && errors.period) || ' '}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl
            fullWidth
            size="small"
            required
            error={showError('category') && Boolean(errors.category)}
          >
            <InputLabel id="budget-category-label">Category</InputLabel>
            <Select
              labelId="budget-category-label"
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
        </Grid>

        <Grid item xs={12} sm={2}>
          <TextField
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
            type="number"
            inputProps={{ min: 0, step: '0.01' }}
            fullWidth
            size="small"
            required
            error={showError('amount') && Boolean(errors.amount)}
            helperText={(showError('amount') && errors.amount) || ' '}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={2}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="medium"
            sx={{ height: '100%', fontWeight: 800, borderRadius: 2 }}
            disabled={loading}
          >
            Save
          </Button>
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Tip: saving the same category again will overwrite that month’s budget (upsert).
      </Typography>
    </Box>
  );
}
