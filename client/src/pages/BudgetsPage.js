import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { getBudgets, upsertBudget, deleteBudget, getMe } from '../utils/api';
import AppLayout from '../components/AppLayout';
import BudgetForm from '../components/BudgetForm';
import BudgetChart from '../components/BudgetChart';
import { formatMoney } from '../utils/money';

function getCurrentPeriodYYYYMM() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function BudgetsPage() {
  const [period, setPeriod] = useState(getCurrentPeriodYYYYMM());

  // data
  const [budgets, setBudgets] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);

  // ui
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const inferredCurrency = useMemo(() => {
    const any = budgets?.find((b) => b?.currency);
    return any?.currency || me?.currency || 'USD';
  }, [budgets, me]);

  async function refreshBudgets(nextPeriod = period) {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await getBudgets({ period: nextPeriod, includeSpent: true });
      setBudgets(Array.isArray(data?.budgets) ? data.budgets : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load budgets.');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshBudgets(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  useEffect(() => {
    (async () => {
      try {
        const user = await getMe();
        setMe(user);
      } catch {
        // ignore – page can work without profile data
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (Number(b.spent) || 0), 0);
    const remaining = totalBudget - totalSpent;
    return { totalBudget, totalSpent, remaining };
  }, [budgets]);

  async function handleSaveBudget({ period: p, category, amount }) {
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      await upsertBudget({
        period: p,
        category,
        amount,
        currency: inferredCurrency || 'USD',
      });
      setSuccess('Budget saved.');
      await refreshBudgets(p);
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      await deleteBudget(id);
      setSuccess('Budget deleted.');
      await refreshBudgets(period);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete budget.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Budgets
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Set monthly category budgets and track progress.
        </Typography>
      </Box>

      {/* OVERVIEW NUMBERS */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total budget
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {formatMoney(totals.totalBudget, inferredCurrency)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total spent
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {formatMoney(totals.totalSpent, inferredCurrency)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Remaining
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: totals.remaining < 0 ? 'error.main' : 'text.primary',
              }}
            >
              {formatMoney(totals.remaining, inferredCurrency)}
            </Typography>
          </Box>
        </Stack>

        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>

      {/* CHART */}
      <Box sx={{ mb: 2 }}>
        <BudgetChart
          totalBudget={totals.totalBudget}
          totalSpent={totals.totalSpent}
          monthlyIncome={me?.monthlyIncome ?? null}
          currency={inferredCurrency}
          chartType={me?.dashboardPrefs?.chartType ?? 'pie'}
          budgets={budgets}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      {/* FORM */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <BudgetForm
          period={period}
          onPeriodChange={setPeriod}
          onSaveBudget={handleSaveBudget}
          loading={loading}
        />
      </Paper>

      {/* LIST */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Budgets for {period}
          </Typography>
          <Button variant="text" onClick={() => refreshBudgets(period)} disabled={loading}>
            Refresh
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {budgets.length === 0 ? (
          <Typography color="text.secondary">No budgets for this month yet. Add your first budget above.</Typography>
        ) : (
          <Stack spacing={2}>
            {budgets.map((b) => {
              const budgetAmt = Number(b.amount) || 0;
              const spent = Number(b.spent) || 0;
              const remaining = typeof b.remaining === 'number' ? b.remaining : budgetAmt - spent;

              const progress = budgetAmt > 0 ? Math.min(100, Math.max(0, (spent / budgetAmt) * 100)) : 0;
              const over = remaining < 0;

              return (
                <Paper
                  key={b._id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: over ? 'error.light' : 'divider',
                    backgroundColor: over ? 'rgba(211, 47, 47, 0.04)' : 'transparent',
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        {b.category}
                      </Typography>

                      <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          Budget: <strong>{formatMoney(budgetAmt, b.currency || inferredCurrency)}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Spent: <strong>{formatMoney(spent, b.currency || inferredCurrency)}</strong>
                        </Typography>
                        <Typography variant="body2" color={over ? 'error.main' : 'text.secondary'} sx={{ fontWeight: 700 }}>
                          Remaining: {formatMoney(remaining, b.currency || inferredCurrency)}
                        </Typography>
                      </Stack>

                      <Box sx={{ mt: 1 }}>
                        <LinearProgress variant="determinate" value={progress} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {Math.round(progress)}% used
                        </Typography>
                      </Box>
                    </Box>

                    <Tooltip title="Delete budget">
                      <span>
                        <IconButton
                          onClick={() => handleDelete(b._id)}
                          disabled={loading}
                          aria-label={`Delete budget ${b.category}`}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Container>
    </AppLayout>
  );
}
