import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme } from '@mui/material/styles';

import { getGoals, createGoal, updateGoal, deleteGoal } from '../utils/api';
import { formatMoney } from '../utils/money';
import AppLayout from '../components/AppLayout';
import GoalForm from '../components/GoalForm';

const STATUS_TABS = ['active', 'completed', 'archived'];

const STATUS_COLORS = {
  active: 'primary',
  completed: 'success',
  archived: 'default',
};

function progressPercent(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

export default function GoalsPage() {
  const theme = useTheme();
  const [statusTab, setStatusTab] = useState(0);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const openSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const activeStatus = STATUS_TABS[statusTab];

  const fetchGoals = useCallback(async (status) => {
    setLoading(true);
    try {
      const data = await getGoals({ status });
      setGoals(Array.isArray(data) ? data : []);
    } catch {
      openSnack('Failed to load goals.', 'error');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals(activeStatus);
  }, [fetchGoals, activeStatus]);

  const handleSave = async (payload) => {
    if (editingGoal) {
      const updated = await updateGoal(editingGoal._id, payload);
      setGoals((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
      openSnack('Goal updated.');
    } else {
      const created = await createGoal(payload);
      // Refresh the list — new goal might be for a different status tab
      await fetchGoals(activeStatus);
      if (created.status === activeStatus || activeStatus === 'active') {
        openSnack('Goal added.');
      }
    }
    setEditingGoal(null);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g._id !== id));
      openSnack('Goal deleted.');
    } catch {
      openSnack('Failed to delete goal.', 'error');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingGoal(null);
  };

  // Chart data — only meaningful for active goals with progress
  const chartData = useMemo(() => {
    const palette = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
    ];
    return goals
      .filter((g) => g.targetAmount > 0)
      .map((g, i) => ({
        id: g._id,
        label: g.name,
        value: g.currentAmount || 0,
        color: palette[i % palette.length],
      }));
  }, [goals, theme.palette]);

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Goals</Typography>
            <Typography variant="body2" color="text.secondary">
              Track your financial goals and milestones.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setEditingGoal(null); setFormOpen(true); }}
          >
            Add Goal
          </Button>
        </Stack>

        {/* Status tabs */}
        <Tabs
          value={statusTab}
          onChange={(_, v) => setStatusTab(v)}
          sx={{ mb: 2 }}
        >
          {STATUS_TABS.map((s) => (
            <Tab key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} />
          ))}
        </Tabs>

        {/* Chart — only for active goals that have any current amount */}
        {activeStatus === 'active' && chartData.length > 0 && chartData.some((d) => d.value > 0) && (
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Progress Overview</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart
                height={260}
                series={[
                  {
                    data: chartData,
                    innerRadius: 50,
                    outerRadius: 100,
                    paddingAngle: 2,
                    cornerRadius: 5,
                    valueFormatter: (item) => formatMoney(item.value),
                  },
                ]}
              />
            </Box>
          </Paper>
        )}

        {/* Goal list */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : goals.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
            <Typography color="text.secondary">
              {activeStatus === 'active'
                ? 'No active goals yet. Add your first goal above.'
                : `No ${activeStatus} goals.`}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {goals.map((goal) => {
              const pct = progressPercent(goal.currentAmount, goal.targetAmount);
              const remaining = (goal.targetAmount || 0) - (goal.currentAmount || 0);

              return (
                <Paper
                  key={goal._id}
                  elevation={0}
                  sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}
                >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                          {goal.name}
                        </Typography>
                        <Chip
                          label={goal.status}
                          size="small"
                          color={STATUS_COLORS[goal.status] || 'default'}
                          sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                        />
                      </Stack>

                      <Stack direction="row" spacing={2} sx={{ mb: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          Saved: <strong>{formatMoney(goal.currentAmount || 0, goal.currency)}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Target: <strong>{formatMoney(goal.targetAmount || 0, goal.currency)}</strong>
                        </Typography>
                        {remaining > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Remaining: <strong>{formatMoney(remaining, goal.currency)}</strong>
                          </Typography>
                        )}
                        {goal.targetDate && (
                          <Typography variant="body2" color="text.secondary">
                            Due: <strong>{new Date(goal.targetDate).toLocaleDateString()}</strong>
                          </Typography>
                        )}
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        color={pct >= 100 ? 'success' : 'primary'}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {Math.round(pct)}% complete
                      </Typography>

                      {goal.notes && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {goal.notes}
                          </Typography>
                        </>
                      )}
                    </Box>

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(goal)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(goal._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Container>

      <GoalForm
        open={formOpen}
        onClose={handleFormClose}
        onSave={handleSave}
        goal={editingGoal}
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
}
