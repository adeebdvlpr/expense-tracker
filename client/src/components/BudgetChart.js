import React from 'react';
import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { formatMoney } from '../utils/money';

/**
 * BudgetChart — horizontal bar overview of per-category budgets.
 *
 * Props:
 *   budgets       {array}         — budget objects with { category, amount, spent, currency }
 *   currency      {string}        — display currency
 *   totalBudget   {number}        — sum of all category budgets
 *   totalSpent    {number}        — sum of all category spending
 *   overallBudget {number|null}   — optional overall monthly cap from user profile
 */
export default function BudgetChart({
  budgets = [],
  currency = 'USD',
  totalBudget = 0,
  totalSpent = 0,
  overallBudget = null,
}) {
  const theme = useTheme();

  if (budgets.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 2.5, background: 'rgba(247, 249, 252, 0.9)' }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          Budget Overview
        </Typography>
        <Typography color="text.secondary">
          Add budgets to see an overview.
        </Typography>
      </Paper>
    );
  }

  function barColor(pct) {
    if (pct > 100) return theme.palette.error.main;
    if (pct > 80) return theme.palette.warning.main;
    return theme.palette.success.main;
  }

  const overallPct =
    totalBudget > 0 ? Math.min(150, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const overallOver = totalSpent > totalBudget;
  const overallRemaining = totalBudget - totalSpent;

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, background: 'rgba(247, 249, 252, 0.9)' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Budget Overview
      </Typography>

      <Stack spacing={1.5}>
        {budgets.map((b) => {
          const budgetAmt = Number(b.amount) || 0;
          const spent = Number(b.spent) || 0;
          const pct = budgetAmt > 0 ? Math.round((spent / budgetAmt) * 100) : 0;
          const fillPct = Math.min(100, pct);
          const over = spent > budgetAmt;
          const fill = barColor(pct);

          return (
            <Box
              key={b._id}
              sx={{
                borderRadius: 2,
                px: 1,
                py: 0.5,
                bgcolor: over ? alpha(theme.palette.error.main, 0.04) : 'transparent',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                {/* Category name */}
                <Typography
                  variant="body2"
                  sx={{ flex: 1, minWidth: 0, fontWeight: 600 }}
                  noWrap
                >
                  {b.category}
                </Typography>

                {/* Progress track */}
                <Box
                  sx={{
                    flex: 3,
                    minWidth: 0,
                    height: 22,
                    borderRadius: '6px',
                    bgcolor: theme.palette.action.disabledBackground,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Fill bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${fillPct}%`,
                      bgcolor: fill,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      transition: 'width 0.4s ease',
                    }}
                  >
                    {/* Dollar label inside bar — only when wide enough */}
                    {pct > 15 && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#fff',
                          pr: 0.75,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatMoney(spent, b.currency || currency)}
                      </Typography>
                    )}
                  </Box>
                  {/* Dollar label outside bar — when bar is narrow */}
                  {pct <= 15 && spent > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        left: `${fillPct + 1}%`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatMoney(spent, b.currency || currency)}
                    </Typography>
                  )}
                </Box>

                {/* Right label: spent / budget */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flexShrink: 0, minWidth: 120, textAlign: 'right' }}
                  noWrap
                >
                  {formatMoney(spent, b.currency || currency)}{' '}
                  <span style={{ opacity: 0.55 }}>/ {formatMoney(budgetAmt, b.currency || currency)}</span>
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>

      {/* Summary section */}
      <Divider sx={{ my: 2 }} />

      <Box>
        {/* Overall progress bar */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 700 }}>
            Overall
          </Typography>

          <Box
            sx={{
              flex: 3,
              height: 22,
              borderRadius: '6px',
              bgcolor: theme.palette.action.disabledBackground,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${Math.min(100, overallPct)}%`,
                bgcolor: barColor(overallPct),
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                transition: 'width 0.4s ease',
              }}
            >
              {overallPct > 15 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#fff',
                    pr: 0.75,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatMoney(totalSpent, currency)}
                </Typography>
              )}
            </Box>
            {overallPct <= 15 && totalSpent > 0 && (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: `${Math.min(100, overallPct) + 1}%`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  whiteSpace: 'nowrap',
                }}
              >
                {formatMoney(totalSpent, currency)}
              </Typography>
            )}
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flexShrink: 0, minWidth: 120, textAlign: 'right' }}
            noWrap
          >
            {formatMoney(totalSpent, currency)}{' '}
            <span style={{ opacity: 0.55 }}>/ {formatMoney(totalBudget, currency)}</span>
          </Typography>
        </Stack>

        {/* Budget • Spent • Remaining summary line */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Typography variant="caption" color="text.secondary">
            Budget: <strong>{formatMoney(totalBudget, currency)}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">•</Typography>
          <Typography variant="caption" color="text.secondary">
            Spent: <strong>{formatMoney(totalSpent, currency)}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">•</Typography>
          <Typography
            variant="caption"
            sx={{ color: overallOver ? 'error.main' : 'text.secondary' }}
          >
            Remaining:{' '}
            <strong>{formatMoney(overallRemaining, currency)}</strong>
          </Typography>
        </Stack>

        {/* Overall cap note — only when overallBudget is set and exceeds totalBudget */}
        {overallBudget != null && overallBudget > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
            Category total {formatMoney(totalBudget, currency)} of {formatMoney(overallBudget, currency)} overall cap
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
