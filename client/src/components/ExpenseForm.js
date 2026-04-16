import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { DEFAULT_CATEGORIES } from '../constants/categories';

const ExpenseForm = ({ onAddExpense, open = false, onClose, categories }) => {
  const categoryList = Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const [touched, setTouched] = useState({
    description: false,
    amount: false,
    category: false,
  });

  const [submittedOnce, setSubmittedOnce] = useState(false);

  const amountNumber = useMemo(() => Number(amount), [amount]);

  const errors = useMemo(() => ({
    description: !description.trim() ? 'Description is required.' : '',
    amount:
      !amount || Number.isNaN(amountNumber) || amountNumber <= 0
        ? 'Enter a valid amount greater than 0.'
        : '',
    category: !category ? 'Category is required.' : '',
  }), [description, amount, amountNumber, category]);

  const showError = (field) => submittedOnce || touched[field];
  const hasErrors = Boolean(errors.description || errors.amount || errors.category);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setTouched({ description: false, amount: false, category: false });
    setSubmittedOnce(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedOnce(true);
    if (hasErrors) return;

    onAddExpense({
      description: description.trim(),
      amount: Number(amountNumber.toFixed(2)),
      category,
    });

    resetForm();
    onClose?.();
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '14px' } } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h3">Add Expense</Typography>
        <IconButton onClick={handleClose} size="small" edge="end" aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ pt: 1 }}>

          {/* Row 1: Amount + Category */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
            <TextField
              size="small"
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
              required
              error={showError('amount') && Boolean(errors.amount)}
              helperText={showError('amount') && errors.amount}
              slotProps={{
                htmlInput: { min: 0, step: '0.01' },
                input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
              }}
              sx={{ flex: 1 }}
            />

            <FormControl
              size="small"
              required
              error={showError('category') && Boolean(errors.category)}
              sx={{ flex: 1 }}
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
                {categoryList.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {showError('category') && errors.category}
              </FormHelperText>
            </FormControl>
          </Box>

          {/* Row 2: Description */}
          <TextField
            size="small"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, description: true }))}
            required
            fullWidth
            error={showError('description') && Boolean(errors.description)}
            helperText={showError('description') && errors.description}
          />


          {/* Row 3 --> drop down containing the goals user has active */}

          
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleClose} variant="text" color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Expense
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseForm;
