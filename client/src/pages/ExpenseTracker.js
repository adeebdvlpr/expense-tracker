import React, { useCallback, useState, useEffect, useMemo, useContext } from 'react';
import { getExpenses, addExpense, deleteExpense, getIncome, addIncome, deleteIncome, getBudgets, getGoals } from '../utils/api';
import { useTheme } from '@mui/material/styles';
import { ThemeContext } from '../App';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { formatMoney } from '../utils/money';

import AppLayout from '../components/AppLayout';
import ExpenseForm from '../components/ExpenseForm';
import IncomeForm from '../components/IncomeForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseChart from '../components/ExpenseChart';
import GoalsWidget from '../components/GoalsWidget';
import BudgetWidget from '../components/BudgetWidget';
import AdvisoryPulseWidget from '../components/AdvisoryPulseWidget';
import BudgetDotGrid from '../components/BudgetDotGrid';
import ExpandableWidget from '../components/ExpandableWidget';

import {
  Alert,
  Button,
  CircularProgress,
  Container,
  LinearProgress,
  Paper,
  Box,
  Stack,
  Typography,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

function getCurrentPeriod() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function goalProgressPercent(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

const BudgetExpandedContent = () => {
  const theme = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getBudgets({ period: getCurrentPeriod(), includeSpent: true })
      .then((data) => { if (!cancelled) setBudgets(Array.isArray(data?.budgets) ? data.budgets : []); })
      .catch(() => { if (!cancelled) setBudgets([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (budgets.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No budgets set for this month.
      </Typography>
    );
  }

  const currency = budgets.find((b) => b.currency)?.currency || 'USD';

  return (
    <Box sx={{ pb: 1 }}>
      {/* Column headers */}
      <Stack direction="row" sx={{ mb: 1, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 0 }}>Category</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ width: 76, textAlign: 'right' }}>Budget</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ width: 76, textAlign: 'right' }}>Spent</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ width: 84, textAlign: 'right' }}>Remaining</Typography>
      </Stack>

      <Stack spacing={1}>
        {budgets.map((b) => {
          const spent = Number(b.spent) || 0;
          const amount = Number(b.amount) || 0;
          const remaining = amount - spent;
          return (
            <Stack key={b._id} direction="row" alignItems="center" sx={{ px: 0.5 }}>
              <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>{b.category}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ width: 76, textAlign: 'right', flexShrink: 0 }}>
                {formatMoney(amount, currency)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ width: 76, textAlign: 'right', flexShrink: 0 }}>
                {formatMoney(spent, currency)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  width: 84,
                  textAlign: 'right',
                  flexShrink: 0,
                  color: remaining < 0 ? theme.palette.error.main : theme.palette.success.main,
                }}
              >
                {formatMoney(remaining, currency)}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};

const GoalsExpandedContent = () => {
  const theme = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getGoals({ status: 'active' })
      .then((data) => { if (!cancelled) setGoals(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setGoals([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (goals.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No active goals yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={2} sx={{ pb: 1 }}>
      {goals.map((goal) => {
        const pct = goalProgressPercent(goal.currentAmount, goal.targetAmount);
        const barColor =
          pct >= 75 ? theme.palette.success.main
          : pct >= 40 ? theme.palette.warning.main
          : theme.palette.info.main;
        const targetDateStr = goal.targetDate
          ? new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : '—';
        return (
          <Box key={goal._id}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.25 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{goal.name}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>{targetDateStr}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {formatMoney(goal.currentAmount || 0, goal.currency)} / {formatMoney(goal.targetAmount || 0, goal.currency)}
              </Typography>
              <Typography variant="caption" color="text.secondary">{Math.round(pct)}%</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 4,
                borderRadius: 2,
                '& .MuiLinearProgress-bar': { backgroundColor: barColor },
              }}
            />
          </Box>
        );
      })}
    </Stack>
  );
};

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
  const theme = useTheme();
  const { setSelectedTheme } = useContext(ThemeContext);

  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState(FILTERS.MONTH);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const [dashPrefs, setDashPrefs] = useState(DEFAULT_PREFS);
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [incomeType, setIncomeType] = useState('monthly');
  const [customCategories, setCustomCategories] = useState([]);

  const [incomeTransactions, setIncomeTransactions] = useState([]);

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);

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
    import('../utils/api').then(({ getMe, getIncome: fetchIncome }) => {
      getMe()
        .then((me) => {
          if (!cancelled && me?.dashboardPrefs) {
            setDashPrefs({ ...DEFAULT_PREFS, ...me.dashboardPrefs });
          }
          if (!cancelled && me?.monthlyIncome != null) {
            setMonthlyIncome(Number(me.monthlyIncome) || null);
          }
          if (!cancelled && me?.incomeType) {
            setIncomeType(me.incomeType);
          }
          if (!cancelled && Array.isArray(me?.customCategories)) {
            setCustomCategories(me.customCategories);
          }
          if (!cancelled && me?.selectedTheme) {
            setSelectedTheme(me.selectedTheme);
          }
        })
        .catch(() => {});

      fetchIncome()
        .then((data) => {
          if (!cancelled) setIncomeTransactions(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Effective monthly income: rolling = sum this month's income transactions; else compute from monthlyIncome + type
  const effectiveMonthlyIncome = useMemo(() => {
    if (incomeType === 'rolling') {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = now.getMonth();
      return incomeTransactions
        .filter((t) => {
          const dt = t.date ? new Date(t.date) : null;
          return dt && dt.getFullYear() === yr && dt.getMonth() === mo;
        })
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || null;
    }
    if (!monthlyIncome) return null;
    // if (incomeType === 'annual') return monthlyIncome / 12;
    // if (incomeType === 'weekly') return monthlyIncome * 52 / 12;
    return monthlyIncome; // monthly
  }, [incomeType, monthlyIncome, incomeTransactions]);

  const allCategories = useMemo(
    () => [...DEFAULT_CATEGORIES, ...customCategories],
    [customCategories],
  );

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

  const handleAddIncome = useCallback(async (incomeData) => {
    try {
      const newEntry = await addIncome(incomeData);
      setIncomeTransactions((prev) => [newEntry, ...prev]);
      openSnack('Income added.', 'success');
    } catch {
      openSnack('Failed to add income.', 'error');
    }
  }, []);

  const handleDeleteIncome = useCallback(async (id) => {
    try {
      await deleteIncome(id);
      setIncomeTransactions((prev) => prev.filter((t) => t._id !== id));
      openSnack('Income deleted.', 'success');
    } catch {
      openSnack('Failed to delete income.', 'error');
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
    const filtered = (!from || !to) ? expenses : expenses.filter((e) => {
      const dt = parseExpenseDate(e);
      if (!dt) return false;
      const d = startOfDay(dt);
      return d >= from && d <= to;
    });
    return [...filtered].sort((a, b) => {
      const da = parseExpenseDate(a);
      const db = parseExpenseDate(b);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db.getTime() - da.getTime();
    });
  }, [expenses, filterWindow]);

  const filteredIncome = useMemo(() => {
    const { from, to } = filterWindow;
    if (!from || !to) return incomeTransactions;
    return incomeTransactions.filter((t) => {
      const dt = parseExpenseDate(t);
      if (!dt) return false;
      const d = startOfDay(dt);
      return d >= from && d <= to;
    });
  }, [incomeTransactions, filterWindow]);

  const allTransactions = useMemo(() => {
    const tagged = [
      ...filteredExpenses.map((e) => ({ ...e, _type: 'expense' })),
      ...filteredIncome.map((t) => ({ ...t, _type: 'income' })),
    ];
    return tagged.sort((a, b) => {
      const da = parseExpenseDate(a);
      const db = parseExpenseDate(b);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db.getTime() - da.getTime();
    });
  }, [filteredExpenses, filteredIncome]);

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
      <Box sx={{ flex: 1, bgcolor: theme.palette.dashboardBg }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Summary row */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'stretch' }}>
          {/* 4 stat cards */}
          <Paper sx={{ p: 1.5, flex: '0.75 1 110px', background:"rgba(247, 249, 252, 0.9)"}}>
            <Typography variant="body2" color="text.secondary">Daily Burn</Typography>
            <Typography variant="h1">{summary.avgPerDayFmt}</Typography>
          </Paper>
          <Paper sx={{ p: 1.5, flex: '0.75 1 110px', background:"rgba(247, 249, 252, 0.9)" }}>
            <Typography variant="body2" color="text.secondary">Days to Reset</Typography>
            <Typography variant="h1">{summary.daysToReset}</Typography>
          </Paper>
          <Paper sx={{ p: 1.5, flex: '0.75 1 110px', background:"rgba(247, 249, 252, 0.9)" }}>
            <Typography variant="body2" color="text.secondary">Biggest Drain</Typography>
            <Typography
              variant="h2"
              sx={{
                lineHeight: 1.2,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {summary.topCategory}
            </Typography>
          </Paper>
          <Paper sx={{ p: 1.5, flex: '0.75 1 110px', background:"rgba(247, 249, 252, 0.9)" }}>
            <Typography variant="body2" color="text.secondary">Biggest Single Hit</Typography>
            <Typography variant="h1">{summary.biggestHitFmt}</Typography>
          </Paper>

          {/* Monthly remaining — wider card with dot grid */}
          <Paper sx={{ p: 1.5, flex: '4 1 220px', background:"rgba(247, 249, 252, 0.9)" }}>
            {effectiveMonthlyIncome ? (
              <BudgetDotGrid
                spent={thisMonthTotal}
                income={effectiveMonthlyIncome}
                monthLabel={new Date().toLocaleDateString('en-US', { month: 'long' })}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {new Date().toLocaleDateString('en-US', { month: 'long' })} Spending
                  </Typography>
                  <Typography variant="h3">
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
          <Box sx={{ mb: 1 }}>
            <ExpenseChart expenses={expenses} chartType="combo" height={200} />
          </Box>
        )}
        <Box sx={{display: 'flex', gap: 2}}>
          <AdvisoryPulseWidget />
        </Box>

        {/* Dashboard: list + sidebar, fluid responsive */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Money Feed */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0 , }}>
            
            <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column', background:"rgba(247, 249, 252, 0.9)" }}>
              {/* Header: title + filter controls right-aligned */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h3">Money Feed</Typography>
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
                    {allTransactions.length} shown
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
                <ExpenseList
                  transactions={allTransactions}
                  onDeleteExpense={handleDeleteExpense}
                  onDeleteIncome={handleDeleteIncome}
                />
              </Box>
            </Paper>
          </Box>

          {/* Right sidebar — starts at 280px, shrinks to 155px before wrapping */}
          <Box sx={{ flex: '0 1 280px', minWidth: 155, display: 'flex', flexDirection: 'column', gap: 1 ,  }}>


            {dashPrefs.showBudgetWidget && (
              <ExpandableWidget title="Budget Details" expandedContent={<BudgetExpandedContent />}>
                <BudgetWidget />
              </ExpandableWidget>
            )}

            {dashPrefs.showGoalsWidget && (
              <ExpandableWidget title="Active Goals" expandedContent={<GoalsExpandedContent />}>
                <GoalsWidget />
              </ExpandableWidget>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={() => setExpenseDialogOpen(true)}
              sx={{ py: 1.5 }}
            >
              + Add Expense
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => setIncomeDialogOpen(true)}
              sx={{ py: 1.5 }}
            >
              + Add Income
            </Button>

          </Box>
        </Box>
      </Container>
      </Box>

      <ExpenseForm
        open={expenseDialogOpen}
        onClose={() => setExpenseDialogOpen(false)}
        onAddExpense={handleAddExpense}
        categories={allCategories}
      />

      <IncomeForm
        open={incomeDialogOpen}
        onClose={() => setIncomeDialogOpen(false)}
        onAddIncome={handleAddIncome}
      />

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
