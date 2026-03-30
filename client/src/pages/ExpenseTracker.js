import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { getExpenses, addExpense, deleteExpense } from '../utils/api';

import AppLayout from '../components/AppLayout';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseChart from '../components/ExpenseChart';
import GoalsWidget from '../components/GoalsWidget';
import BudgetWidget from '../components/BudgetWidget';
import BudgetDotGrid from '../components/BudgetDotGrid';

import {
  Alert,
  CircularProgress,
  Container,
  Paper,
  Box,
  Typography,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

const FILTERS = {
  MONTH: 'month',
  ALL: 'all',
  CUSTOM: 'custom',
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
function parseDateInput(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
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
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const [dashPrefs, setDashPrefs] = useState(DEFAULT_PREFS);
  const [monthlyIncome, setMonthlyIncome] = useState(null);

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

  useEffect(() => {
    let cancelled = false;
    import('../utils/api').then(({ getMe }) =>
      getMe()
        .then((me) => {
          if (!cancelled && me?.dashboardPrefs) {
            setDashPrefs({ ...DEFAULT_PREFS, ...me.dashboardPrefs });
          }
          if (!cancelled && me?.monthlyIncome != null) {
            setMonthlyIncome(Number(me.monthlyIncome) || null);
          }
        })
        .catch(() => {})
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

  const filterWindow = useMemo(() => {
    if (filter === FILTERS.ALL) return { from: null, to: null };

    if (filter === FILTERS.CUSTOM) {
      const from = parseDateInput(customFrom);
      const to = parseDateInput(customTo);
      if (!from || !to) return { from: null, to: null };
      return { from: startOfDay(from), to: startOfDay(to) };
    }

    // default: this month
    const to = new Date();
    return { from: startOfDay(startOfMonth(to)), to: startOfDay(to) };
  }, [filter, customFrom, customTo]);

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

    let biggestHit = 0;
    for (const e of filteredExpenses) {
      const amt = typeof e.amount === 'number' ? e.amount : Number(e.amount) || 0;
      if (amt > biggestHit) biggestHit = amt;
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

    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysToReset = lastDay - now.getDate() + 1;

    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    return {
      topCategory,
      avgPerDayFmt: fmt.format(avgPerDay),
      biggestHitFmt: fmt.format(biggestHit),
      daysToReset,
    };
  }, [filteredExpenses, filterWindow]);

  const thisMonthTotal = useMemo(() => {
    const now = new Date();
    const yr = now.getFullYear();
    const mo = now.getMonth();
    return expenses
      .filter((e) => {
        const dt = parseExpenseDate(e);
        return dt && dt.getFullYear() === yr && dt.getMonth() === mo;
      })
      .reduce((sum, e) => {
        const amt = typeof e.amount === 'number' ? e.amount : Number(e.amount) || 0;
        return sum + amt;
      }, 0);
  }, [expenses]);

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Summary row */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'stretch' }}>
          {/* 4 stat cards */}
          <Paper sx={{ p: 2, flex: '1 1 110px' }}>
            <Typography variant="body2" color="text.secondary">Daily Burn</Typography>
            <Typography variant="h2">{summary.avgPerDayFmt}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: '1 1 110px' }}>
            <Typography variant="body2" color="text.secondary">Days to Reset</Typography>
            <Typography variant="h2">{summary.daysToReset}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: '1 1 110px' }}>
            <Typography variant="body2" color="text.secondary">Biggest Drain</Typography>
            <Typography variant="h2" noWrap>{summary.topCategory}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: '1 1 110px' }}>
            <Typography variant="body2" color="text.secondary">Biggest Single Hit</Typography>
            <Typography variant="h2">{summary.biggestHitFmt}</Typography>
          </Paper>

          {/* Monthly remaining — wider card with dot grid */}
          <Paper sx={{ p: 2, flex: '2 1 220px' }}>
            {monthlyIncome ? (
              <BudgetDotGrid
                spent={thisMonthTotal}
                income={monthlyIncome}
                monthLabel={new Date().toLocaleDateString('en-US', { month: 'long' })}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {new Date().toLocaleDateString('en-US', { month: 'long' })} Spending
                  </Typography>
                  <Typography variant="h2">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(thisMonthTotal)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 160, textAlign: 'right' }}>
                  Set income in Account settings to track progress.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Combo chart: donut (this month) + bar (last 6 months) */}
        {dashPrefs.showExpenseChart && (
          <Box sx={{ mb: 2 }}>
            <ExpenseChart expenses={expenses} chartType="combo" height={200} />
          </Box>
        )}

        {/* Dashboard: list + sidebar, fluid responsive */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Expense Feed */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column' }}>
              {/* Header: title + filter controls right-aligned */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h3">Expense Feed</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <ToggleButtonGroup
                    size="small"
                    value={filter}
                    exclusive
                    onChange={(_e, next) => next && setFilter(next)}
                  >
                    <ToggleButton value={FILTERS.MONTH}>This month</ToggleButton>
                    <ToggleButton value={FILTERS.ALL}>All time</ToggleButton>
                    <ToggleButton value={FILTERS.CUSTOM}>Custom</ToggleButton>
                  </ToggleButtonGroup>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {filteredExpenses.length} shown
                  </Typography>
                </Box>
              </Box>

              {/* Custom date range */}
              {filter === FILTERS.CUSTOM && (
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    type="date"
                    label="From"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 150 }}
                  />
                  <TextField
                    size="small"
                    type="date"
                    label="To"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 150 }}
                  />
                </Box>
              )}

              {/* List — always reserves 12-row height, scrollable beyond */}
              <Box sx={{ overflow: 'auto', minHeight: 520, maxHeight: 520 }}>
                <ExpenseList expenses={filteredExpenses} onDeleteExpense={handleDeleteExpense} />
              </Box>
            </Paper>
          </Box>

          {/* Right sidebar — starts at 280px, shrinks to 155px before wrapping */}
          <Box sx={{ flex: '0 1 280px', minWidth: 155, display: 'flex', flexDirection: 'column', gap: 1 }}>

            {dashPrefs.showBudgetWidget && <BudgetWidget />}

            {dashPrefs.showGoalsWidget && <GoalsWidget />}

            <Paper sx={{ p: 2 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>
                I spent...
              </Typography>
              <ExpenseForm onAddExpense={handleAddExpense} />
            </Paper>

          </Box>
        </Box>
      </Container>

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