import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { useTheme } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';

import { getGoals } from '../utils/api';
import { formatMoney } from '../utils/money';

function progressPercent(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

const GoalsWidget = () => {
  const theme = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlighted, setHighlighted] = useState(null);



  useEffect(() => {
    let cancelled = false;
    getGoals({ status: 'active' })
      .then((data) => { if (!cancelled) setGoals(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setGoals([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const palette = theme.palette.donutPalette || [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.secondary.main,
  ];

  // Build outer (target) and inner (current) series data
  const outerData = goals.map((g, i) => ({
    id: `outer-${g._id}`,
    value: g.targetAmount ,
    color: palette[i % palette.length],
    label: g.name,
  }));

  const innerData = goals.map((g, i) => ({
    id: `inner-${g._id}`,
    value: g.currentAmount || 0,
    // Same color at ~67% opacity — append 'aa' to the hex
    color: (palette[i % palette.length]) + 'aa',
    label: g.name,
  }));

  // Totals for default center display
  const totalTarget = goals.reduce((s, g) => s + (g.targetAmount || 0), 0);
  const totalCurrent = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
  const totalPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  // Determine what the center overlay should show
  let centerPct = totalPct;
  let centerLabel = 'Total goals';
  let centerSub = null;

  if (highlighted && highlighted.dataIndex != null) {
    const goal = goals[highlighted.dataIndex];
    if (goal) {
      const isOuterRing = (highlighted.seriesId ? true : false);
      centerPct = Math.round(progressPercent(goal.currentAmount, goal.targetAmount));
      centerLabel = goal.name;
      // Outer ring = goal target amount; Inner ring = progress (saved) amount
      centerSub = isOuterRing
        ? formatMoney(goal.targetAmount || 0, goal.currency)
        : formatMoney(goal.currentAmount || 0, goal.currency);
    }
  }

  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(247, 249, 252, 0.9)' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.3 }}>
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
        <Box sx={{ flex: 1, position: 'relative' }}>
          <PieChart
            height={240}
            series={[
              {
                // Outer ring — target amounts
                // Base radii scaled ×1.3 for larger chart, ring width then thinned 25%
                // innerRadius: 60 (≈46×1.3), width: 31 (≈32×1.3×0.75) → outerRadius: 91
                id: 1,
                data: outerData,
                innerRadius: 60,
                outerRadius: 91,
                paddingAngle: 2,
                cornerRadius: 3,
                valueFormatter: (item) => formatMoney(item.value),
              },
              {
                // Inner ring — current saved amounts
                // Shifted outward: innerRadius 21→33, outerRadius 44→56 (ring width 23 unchanged)
                // Gap to outer ring: 60 - 56 = 4px (was 16px)
                id: 0,
                data: innerData,
                innerRadius: 33,
                outerRadius: 56,
                paddingAngle: 2,
                cornerRadius: 3,
                valueFormatter: (item) => formatMoney(item.value),
              },
            ]}
            //TODO: inner-ring = highlight progressAmount / outer-ring = highlight goalAmount 
            //      const isInner = (series.data == innerData) ? true : false;
            //       if (isInner) { setHighlited(progressAmount) }.... setHighlited(goalAmount) 
            onHighlightChange={(item) => setHighlighted(item)}
            slots={{ legend: () => null, tooltip: () => null }}
            slotProps={{ legend: { hidden: true } }}
            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          />

          {/* Center overlay — only source of hover feedback, no popup */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              width: 56,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                lineHeight: 1.1,
                color: 'text.primary',
              }}
            >
              {centerPct}%
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                fontSize: '0.62rem',
                lineHeight: 1.2,
                display: 'block',
                maxWidth: 56,
              }}
            >
              {centerLabel}
            </Typography>
            {centerSub && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.62rem', lineHeight: 1.1, display: 'block' }}
              >
                {centerSub}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 0.75, pt: 0.3, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
        <Link component={RouterLink} to="/goals" underline="hover" variant="body2" color="primary">
          View all goals →
        </Link>
      </Box>
    </Paper>
  );
};

export default GoalsWidget;
