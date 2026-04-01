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

const INCOME_COLOR = '#66bb6a';
const EXPENSE_COLOR = '#ef5350';

const ExpenseList = ({ transactions, onDeleteExpense, onDeleteIncome }) => {
  const [expandedId, setExpandedId] = useState(null);

  const currency = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    []
  );

  if (!transactions || transactions.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          No transactions yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add an expense or income entry to see it here.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={0.75}>
      {transactions.map((item) => {
        const isIncome = item._type === 'income';
        const typeColor = isIncome ? INCOME_COLOR : EXPENSE_COLOR;

        const amount =
          typeof item.amount === 'number' && !Number.isNaN(item.amount)
            ? currency.format(item.amount)
            : currency.format(0);

        const isExpanded = expandedId === item._id;
        const toggle = () => setExpandedId(isExpanded ? null : item._id);

        const rawDate = item.date || item.createdAt;
        const formattedDate = rawDate
          ? new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : null;

        const handleDelete = () => {
          if (isIncome) {
            onDeleteIncome?.(item._id);
          } else {
            onDeleteExpense?.(item._id);
          }
        };

        return (
          <Paper
            key={item._id}
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
              {/* Type indicator dot */}
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: typeColor,
                  flexShrink: 0,
                }}
              />

              {/* Description — fills all remaining space, truncates with ellipsis */}
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, flex: 1, minWidth: 0 }}
                noWrap
              >
                {item.description?.trim() || 'No description'}
              </Typography>

              {/* Amount — fixed 80px, colored by type */}
              <Box sx={{ width: 80, flexShrink: 0, textAlign: 'right' }}>
                <Typography variant="body2" sx={{ color: typeColor, fontWeight: 500 }}>
                  {isIncome ? '+' : ''}{amount}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ height: 16, alignSelf: 'center' }} />

              {/* Category — starts at 230px, shrinks to 150px min before description loses space */}
              <Box sx={{ width: 230, minWidth: 150, flexShrink: 1 }}>
                <Chip
                  size="small"
                  label={item.category || 'Uncategorized'}
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
              <Tooltip title={isIncome ? 'Delete income' : 'Delete expense'}>
                <IconButton
                  aria-label={isIncome ? 'delete income' : 'delete expense'}
                  size="small"
                  onClick={handleDelete}
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
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {item.description?.trim() || 'No description'}
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Amount:</strong> {isIncome ? '+' : ''}{amount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Category:</strong> {item.category || 'Uncategorized'}
                  </Typography>
                  {formattedDate && (
                    <Typography variant="caption" color="text.secondary">
                      <strong>Date:</strong> {formattedDate}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: typeColor, fontWeight: 600 }}>
                    {isIncome ? 'Income' : 'Expense'}
                  </Typography>
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