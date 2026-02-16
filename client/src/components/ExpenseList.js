import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ExpenseList = ({ expenses, onDeleteExpense }) => {
  const currency = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    []
  );

  if (!expenses || expenses.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          No expenses yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add your first expense to see it show up here.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={1.25}>
      {expenses.map((expense) => {
        const amount =
          typeof expense.amount === 'number' && !Number.isNaN(expense.amount)
            ? currency.format(expense.amount)
            : currency.format(0);

        return (
          <Paper
            key={expense._id}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              border: (t) => `1px solid ${t.palette.divider}`,
              transition: 'transform 120ms ease, box-shadow 120ms ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 2,
              },
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
                {expense.description?.trim() || 'No description'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
                <Typography variant="body2" color="text.secondary">
                  {amount}
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Chip
                  size="small"
                  label={expense.category || 'Uncategorized'}
                  variant="outlined"
                />
              </Box>
            </Box>

            <Tooltip title="Delete expense">
              <IconButton
                aria-label="delete"
                onClick={() => onDeleteExpense(expense._id)}
                sx={{ flexShrink: 0 }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default ExpenseList;
