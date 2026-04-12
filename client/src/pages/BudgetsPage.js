import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Snackbar,
  Alert,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme, alpha } from '@mui/material/styles';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

import { getBudgets, upsertBudget, deleteBudget, getMe, updateMe } from '../utils/api';
import BudgetForm from '../components/BudgetForm';
import BudgetChart from '../components/BudgetChart';
import { formatMoney } from '../utils/money';

function getCurrentPeriodYYYYMM() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getPreviousPeriodYYYYMM() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const y = prev.getFullYear();
  const m = String(prev.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function periodToMonthName(period) {
  if (!period) return period;
  const [y, m] = period.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function BudgetsPage() {
  const theme = useTheme();

  // Tab state: 0 = Active (current month), 1 = Archived
  const [activeTab, setActiveTab] = useState(0);
  const [archivedPeriod, setArchivedPeriod] = useState(getPreviousPeriodYYYYMM());

  // Derived active period
  const activePeriod = activeTab === 0 ? getCurrentPeriodYYYYMM() : archivedPeriod;

  // Data
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Overall budget cap
  const [overallBudget, setOverallBudget] = useState(null);
  const [overallBudgetInput, setOverallBudgetInput] = useState('');

  // Currency inferred from budgets or user profile
  const [userCurrency, setUserCurrency] = useState('USD');
  const inferredCurrency = useMemo(() => {
    const any = budgets?.find((b) => b?.currency);
    return any?.currency || userCurrency;
  }, [budgets, userCurrency]);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const openSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Totals
  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (Number(b.spent) || 0), 0);
    return { totalBudget, totalSpent };
  }, [budgets]);

  async function refreshBudgets(period = activePeriod) {
    setLoading(true);
    try {
      const data = await getBudgets({ period, includeSpent: true });
      setBudgets(Array.isArray(data?.budgets) ? data.budgets : []);
    } catch (e) {
      openSnack(e?.response?.data?.message || 'Failed to load budgets.', 'error');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }

  // Load budgets when tab or archived period changes
  useEffect(() => {
    refreshBudgets(activePeriod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, archivedPeriod]);

  // Load user profile once on mount
  useEffect(() => {
    (async () => {
      try {
        const user = await getMe();
        setUserCurrency(user?.currency || 'USD');
        setOverallBudget(user?.overallMonthlyBudget ?? null);
        setOverallBudgetInput(
          user?.overallMonthlyBudget != null ? String(user.overallMonthlyBudget) : ''
        );
      } catch {
        // page works without profile
      }
    })();
  }, []);

  async function handleSaveBudget({ period: p, category, amount }) {
    try {
      setLoading(true);
      await upsertBudget({
        period: p,
        category,
        amount,
        currency: inferredCurrency || 'USD',
      });
      openSnack('Budget saved.');
      await refreshBudgets(activePeriod);
      setFormOpen(false);
      setEditingBudget(null);
    } catch (e) {
      openSnack(e?.response?.data?.message || 'Failed to save budget.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      setLoading(true);
      await deleteBudget(id);
      openSnack('Budget deleted.');
      await refreshBudgets(activePeriod);
    } catch (e) {
      openSnack(e?.response?.data?.message || 'Failed to delete budget.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveOverallBudget() {
    try {
      const val = overallBudgetInput.trim() === '' ? null : Number(overallBudgetInput);
      await updateMe({ overallMonthlyBudget: val });
      setOverallBudget(val);
      openSnack('Budget cap saved.');
    } catch {
      openSnack('Failed to save budget cap.', 'error');
    }
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>

        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Budgets</Typography>
            <Typography variant="body2" color="text.secondary">
              Set monthly category budgets and track progress.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setEditingBudget(null); setFormOpen(true); }}
          >
            Add Budget
          </Button>
        </Stack>

        {/* Overall monthly cap row */}
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, background: 'rgba(247, 249, 252, 0.9)' }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
              Monthly cap:
            </Typography>
            <TextField
              type="number"
              size="small"
              value={overallBudgetInput}
              onChange={(e) => setOverallBudgetInput(e.target.value)}
              placeholder="No cap set"
              slotProps={{ input: { min: 0, step: '0.01' } }}
              sx={{ width: 140 }}
            />
            <Tooltip title="Save cap">
              <IconButton size="small" onClick={handleSaveOverallBudget} color="primary">
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {overallBudget != null && (
              <Typography variant="caption" color="text.secondary">
                Current: {formatMoney(overallBudget, inferredCurrency)}
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Loading indicator */}
        {loading && <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />}

        {/* Status tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Active" />
          <Tab label="Archived" />
        </Tabs>

        {/* Archived period picker */}
        {activeTab === 1 && (
          <Box sx={{ mb: 2 }}>
            <TextField
              type="month"
              size="small"
              value={archivedPeriod}
              onChange={(e) => setArchivedPeriod(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              label="View month"
              sx={{ width: 160 }}
            />
          </Box>
        )}

        {/* Budget Overview Chart */}
        <Box sx={{ mb: 2 }}>
          <BudgetChart
            budgets={budgets}
            currency={inferredCurrency}
            totalBudget={totals.totalBudget}
            totalSpent={totals.totalSpent}
            overallBudget={overallBudget}
          />
        </Box>

        {/* Budget list */}
        <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Budgets for {periodToMonthName(activePeriod)}
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => refreshBudgets(activePeriod)}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {budgets.length === 0 ? (
            <Typography color="text.secondary">
              No budgets for this month yet. Add your first budget above.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {budgets.map((b) => {
                const budgetAmt = Number(b.amount) || 0;
                const spent = Number(b.spent) || 0;
                const remaining = typeof b.remaining === 'number' ? b.remaining : budgetAmt - spent;
                const progress = budgetAmt > 0 ? Math.min(100, Math.max(0, (spent / budgetAmt) * 100)) : 0;
                const over = remaining < 0;

                let progressColor;
                if (over) {
                  progressColor = theme.palette.error.main;
                } else if (progress >= 80) {
                  progressColor = theme.palette.warning.main;
                } else {
                  progressColor = theme.palette.success.main;
                }

                return (
                  <Paper
                    key={b._id}
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: over ? 'error.light' : 'divider',
                      backgroundColor: over ? alpha(theme.palette.error.main, 0.04) : 'transparent',
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      {/* Text info */}
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
                          <Typography
                            variant="body2"
                            color={over ? 'error.main' : 'text.secondary'}
                            sx={{ fontWeight: 700 }}
                          >
                            Remaining: {formatMoney(remaining, b.currency || inferredCurrency)}
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Gauge */}
                      <Gauge
                        width={80}
                        height={80}
                        value={Math.round(progress)}
                        startAngle={-110}
                        endAngle={110}
                        text={({ value }) => `${value}%`}
                        sx={{
                          flexShrink: 0,
                          [`& .${gaugeClasses.valueArc}`]: { fill: progressColor },
                          [`& .${gaugeClasses.referenceArc}`]: {
                            fill: theme.palette.action.disabledBackground,
                          },
                          [`& .${gaugeClasses.valueText}`]: {
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            fill: theme.palette.text.primary,
                          },
                        }}
                      />

                      {/* Edit + Delete */}
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title="Edit budget">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => { setEditingBudget(b); setFormOpen(true); }}
                              disabled={loading}
                              aria-label={`Edit budget ${b.category}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete budget">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(b._id)}
                              disabled={loading}
                              aria-label={`Delete budget ${b.category}`}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Paper>
      </Container>

      {/* Budget Form Dialog */}
      <BudgetForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingBudget(null); }}
        onSave={handleSaveBudget}
        budget={editingBudget}
        defaultPeriod={activePeriod}
      />

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
    </>
  );
}
