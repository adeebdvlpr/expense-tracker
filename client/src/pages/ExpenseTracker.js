import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { getExpenses, addExpense, deleteExpense } from '../utils/api';

import AppLayout from '../components/AppLayout';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseChart from '../components/ExpenseChart';
import GoalsWidget from '../components/GoalsWidget';
import BudgetWidget from '../components/BudgetWidget';

import {
  Alert,
  CircularProgress,
  Container,
  Paper,
  Grid,
  Box,
  Typography,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

const FILTERS = {
  MONTH: 'month',
  LAST_30: 'last30',
  ALL: 'all',
};

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function daysBetweenInclusive(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  const diff = Math.floor((startOfDay(b) - startOfDay(a)) / ms);
  return Math.max(1, diff + 1);
}
function parseExpenseDate(expense) {
  const raw = expense?.date || expense?.createdAt || expense?.updatedAt;
  if (!raw) return null;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

const DEFAULT_PREFS = {
  showExpenseChart: true,
  showBudgetWidget: true,
  showGoalsWidget: true,
  chartType: 'pie',
};

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState(FILTERS.MONTH);

  // Dashboard preferences loaded from user profile
  const [dashPrefs, setDashPrefs] = useState(DEFAULT_PREFS);

  // Snackbar state
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const openSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('token');
    window.location.assign('/');
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch expenses. Please try again later.');
      openSnack('Failed to fetch expenses.', 'error');
      if (err?.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  // Load user prefs on mount (non-blocking — dashboard still works if this fails)
  useEffect(() => {
    let cancelled = false;
    import('../utils/api').then(({ getMe }) =>
      getMe()
        .then((me) => {
          if (!cancelled && me?.dashboardPrefs) {
            setDashPrefs({ ...DEFAULT_PREFS, ...me.dashboardPrefs });
          }
        })
        .catch(() => {
          // silently fall back to defaults
        })
    );
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleAddExpense = useCallback(async (expense) => {
    try {
      const newExpense = await addExpense(expense);
      setExpenses((prev) => [...prev, newExpense]);
      setError(null);
      openSnack('Expense added.', 'success');
    } catch {
      setError('Failed to add expense. Please try again.');
      openSnack('Failed to add expense.', 'error');
    }
  }, []);

  const handleDeleteExpense = useCallback(async (id) => {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      setError(null);
      openSnack('Expense deleted.', 'success');
    } catch {
      setError('Failed to delete expense. Please try again.');
      openSnack('Failed to delete expense.', 'error');
    }
  }, []);

  // Compute filter window
  const filterWindow = useMemo(() => {
    if (filter === FILTERS.ALL) return { from: null, to: null };

    const to = new Date();
    if (filter === FILTERS.LAST_30) {
      const from = new Date();
      from.setDate(from.getDate() - 29);
      return { from: startOfDay(from), to: startOfDay(to) };
    }

    // default: this month
    return { from: startOfDay(startOfMonth(to)), to: startOfDay(to) };
  }, [filter]);

  const filteredExpenses = useMemo(() => {
    const { from, to } = filterWindow;
    if (!from || !to) return expenses;

    return expenses.filter((e) => {
      const dt = parseExpenseDate(e);
      if (!dt) return false;
      const d = startOfDay(dt);
      return d >= from && d <= to;
    });
  }, [expenses, filterWindow]);

  // Summary metrics based on filtered expenses
  const summary = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => {
      const amt = typeof e.amount === 'number' ? e.amount : Number(e.amount) || 0;
      return sum + amt;
    }, 0);

    const categoryTotals = new Map();
    for (const e of filteredExpenses) {
      const cat = e.category || 'Uncategorized';
      const amt = typeof e.amount === 'number' ? e.amount : Number(e.amount) || 0;
      categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + amt);
    }

    let topCategory = '—';
    let topCategoryAmount = 0;
    for (const [cat, amt] of categoryTotals.entries()) {
      if (amt > topCategoryAmount) {
        topCategory = cat;
        topCategoryAmount = amt;
      }
    }

    let avgPerDay = total;
    const { from, to } = filterWindow;
    if (from && to) {
      const days = daysBetweenInclusive(from, to);
      avgPerDay = total / days;
    } else {
      const dates = filteredExpenses.map(parseExpenseDate).filter(Boolean);
      if (dates.length >= 2) {
        const min = new Date(Math.min(...dates.map((d) => d.getTime())));
        const max = new Date(Math.max(...dates.map((d) => d.getTime())));
        const days = daysBetweenInclusive(min, max);
        avgPerDay = total / days;
      }
    }

    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    return {
      totalFmt: fmt.format(total),
      topCategory,
      avgPerDayFmt: fmt.format(avgPerDay),
    };
  }, [filteredExpenses, filterWindow]);

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Filter control row */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <ToggleButtonGroup
            size="small"
            value={filter}
            exclusive
            onChange={(_e, next) => next && setFilter(next)}
          >
            <ToggleButton value={FILTERS.MONTH}>This month</ToggleButton>
            <ToggleButton value={FILTERS.LAST_30}>Last 30 days</ToggleButton>
            <ToggleButton value={FILTERS.ALL}>All time</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Summary row */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Total spent</Typography>
              <Typography variant="h2">{summary.totalFmt}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Top category</Typography>
              <Typography variant="h2">{summary.topCategory}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">Avg/day</Typography>
              <Typography variant="h2">{summary.avgPerDayFmt}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Dashboard cards */}
        <Grid container spacing={2}>
          {/* Add Expense */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>
                Add Expense
              </Typography>
              <ExpenseForm onAddExpense={handleAddExpense} />
            </Paper>
          </Grid>

          {/* Recent Expenses */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2.5, height: { md: 420 }, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="h3">Recent Expenses</Typography>
                <Typography variant="body2" color="text.secondary">
                  {filteredExpenses.length} shown
                </Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', pr: 0.5 }}>
                <ExpenseList expenses={filteredExpenses} onDeleteExpense={handleDeleteExpense} />
              </Box>
            </Paper>
          </Grid>

          {/* Spending Breakdown Chart (toggled by pref) */}
          {dashPrefs.showExpenseChart && (
            <Grid item xs={12}>
              <ExpenseChart expenses={filteredExpenses} chartType={dashPrefs.chartType ?? 'pie'} />
            </Grid>
          )}

          {/* Goals Widget (toggled by pref) */}
          {dashPrefs.showGoalsWidget && (
            <Grid item xs={12} md={6}>
              <GoalsWidget />
            </Grid>
          )}

          {/* Budget Widget (toggled by pref) */}
          {dashPrefs.showBudgetWidget && (
            <Grid item xs={12} md={6}>
              <BudgetWidget />
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};

export default ExpenseTracker;
