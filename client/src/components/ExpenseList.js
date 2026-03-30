import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Chip,
  Divider,
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const ExpenseList = ({ expenses, onDeleteExpense }) => {
  const [expandedId, setExpandedId] = useState(null);

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
    <Stack spacing={0.75}>
      {expenses.map((expense) => {
        const amount =
          typeof expense.amount === 'number' && !Number.isNaN(expense.amount)
            ? currency.format(expense.amount)
            : currency.format(0);

        const isExpanded = expandedId === expense._id;
        const toggle = () => setExpandedId(isExpanded ? null : expense._id);

        const rawDate = expense.date || expense.createdAt;
        const formattedDate = rawDate
          ? new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : null;

        return (
          <Paper
            key={expense._id}
            sx={{
              px: 2,
              pt: 1,
              pb: 1,
              border: (t) => `1px solid ${t.palette.divider}`,
              transition: 'box-shadow 120ms ease',
              '&:hover': { boxShadow: 2 },
            }}
          >
            {/* Compact fixed-width row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Description — fills all remaining space, truncates with ellipsis */}
              <Typography
                variant="body1"
                sx={{ fontSize: '1.05rem', flex: 1, minWidth: 0 }}
                noWrap
              >
                {expense.description?.trim() || 'No description'}
              </Typography>

              {/* Amount — fixed 80px */}
              <Box sx={{ width: 80, flexShrink: 0, textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                  {amount}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ height: 16, alignSelf: 'center' }} />

              {/* Category — starts at 230px, shrinks to 150px min before description loses space */}
              <Box sx={{ width: 230, minWidth: 150, flexShrink: 1 }}>
                <Chip
                  size="small"
                  label={expense.category || 'Uncategorized'}
                  variant="outlined"
                  sx={{
                    maxWidth: '100%',
                    '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                  }}
                />
              </Box>

              {/* Expand toggle */}
              <IconButton size="small" onClick={toggle} sx={{ flexShrink: 0 }}>
                {isExpanded ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </IconButton>

              {/* Delete */}
              <Tooltip title="Delete expense">
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => onDeleteExpense(expense._id)}
                  sx={{ flexShrink: 0 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Expanded detail panel */}
            <Collapse in={isExpanded}>
              <Box
                sx={{
                  pt: 1,
                  mt: 1,
                  borderTop: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <Typography variant="body2" sx={{ fontSize: '1rem', mb: 0.5 }}>
                  {expense.description?.trim() || 'No description'}
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Amount:</strong> {amount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Category:</strong> {expense.category || 'Uncategorized'}
                  </Typography>
                  {formattedDate && (
                    <Typography variant="caption" color="text.secondary">
                      <strong>Date:</strong> {formattedDate}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default ExpenseList;
