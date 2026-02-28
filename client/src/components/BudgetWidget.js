import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { getBudgets } from '../utils/api';
import { formatMoney } from '../utils/money';

function getCurrentPeriod() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

const BudgetWidget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getBudgets({ period: getCurrentPeriod(), includeSpent: true })
      .then((data) => {
        if (!cancelled) setBudgets(Array.isArray(data?.budgets) ? data.budgets : []);
      })
      .catch(() => { if (!cancelled) setBudgets([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const totalSpent = budgets.reduce((s, b) => s + (Number(b.spent) || 0), 0);
    const remaining = totalBudget - totalSpent;
    const pct = totalBudget > 0 ? Math.min(100, Math.max(0, (totalSpent / totalBudget) * 100)) : 0;
    const currency = budgets.find((b) => b.currency)?.currency || 'USD';
    return { totalBudget, totalSpent, remaining, pct, currency };
  }, [budgets]);

  const progressColor = totals.pct >= 100 ? 'error' : totals.pct >= 80 ? 'warning' : 'primary';

  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <AccountBalanceWalletIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography variant="h3">Budget</Typography>
        <Typography variant="caption" color="text.secondary">
          ({getCurrentPeriod()})
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : budgets.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No budgets set for this month.{' '}
            <Link component={RouterLink} to="/budgets" underline="hover">
              Add one →
            </Link>
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Budget</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {formatMoney(totals.totalBudget, totals.currency)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Spent</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {formatMoney(totals.totalSpent, totals.currency)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Remaining</Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 700, color: totals.remaining < 0 ? 'error.main' : 'text.primary' }}
              >
                {formatMoney(totals.remaining, totals.currency)}
              </Typography>
            </Box>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={totals.pct}
            color={progressColor}
            sx={{ borderRadius: 2, height: 8 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {Math.round(totals.pct)}% of budget used
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
        <Link component={RouterLink} to="/budgets" underline="hover" variant="body2" color="primary">
          View full budgets →
        </Link>
      </Box>
    </Paper>
  );
};

export default BudgetWidget;
