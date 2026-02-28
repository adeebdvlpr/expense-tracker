import React, { useEffect, useState } from 'react';
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
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

import { getGoals } from '../utils/api';
import { formatMoney } from '../utils/money';

function progressPercent(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

const GoalsWidget = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getGoals({ status: 'active' })
      .then((data) => { if (!cancelled) setGoals(Array.isArray(data) ? data.slice(0, 3) : []); })
      .catch(() => { if (!cancelled) setGoals([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <TrackChangesIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography variant="h3">Goals</Typography>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : goals.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No active goals yet.{' '}
            <Link component={RouterLink} to="/goals" underline="hover">
              Set one →
            </Link>
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          {goals.map((goal) => {
            const pct = progressPercent(goal.currentAmount, goal.targetAmount);
            return (
              <Box key={goal._id}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {goal.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
                    {formatMoney(goal.currentAmount || 0, goal.currency)} / {formatMoney(goal.targetAmount || 0, goal.currency)}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  color={pct >= 100 ? 'success' : 'primary'}
                  sx={{ borderRadius: 2, height: 6 }}
                />
              </Box>
            );
          })}
        </Stack>
      )}

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
        <Link component={RouterLink} to="/goals" underline="hover" variant="body2" color="primary">
          View all goals →
        </Link>
      </Box>
    </Paper>
  );
};

export default GoalsWidget;
