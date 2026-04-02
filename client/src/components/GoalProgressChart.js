import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';

/**
 * GoalProgressChart — donut ring showing a single goal's completion percentage.
 *
 * Props:
 *   currentAmount  {number}  — amount saved so far
 *   targetAmount   {number}  — goal target
 *   currency       {string}  — goal currency (available for future use)
 *   size           {number}  — diameter in px (default 120)
 */
const GoalProgressChart = ({ currentAmount, targetAmount, currency, size = 120 }) => {
  const theme = useTheme();

  // Safe numeric coercion
  const saved = typeof currentAmount === 'number' ? currentAmount : Number(currentAmount) || 0;
  const target = typeof targetAmount === 'number' ? targetAmount : Number(targetAmount) || 0;

  // Percentage — 0 when target is missing/zero, capped at 100
  const pct =
    !target || target <= 0
      ? 0
      : Math.min(100, Math.round((saved / target) * 100));

  // Color based on progress — always from theme, never hardcoded
  let filledColor;
  if (pct >= 75) {
    filledColor = theme.palette.success.main;
  } else if (pct >= 40) {
    filledColor = theme.palette.info.main;
  } else {
    filledColor = theme.palette.primary.main;
  }

  const remainingColor = theme.palette.action.disabledBackground;

  // Chart values — use pct-based proportions so the ring always reflects 0–100.
  // Minimum filled value of 0.5 keeps a tiny visible arc when currentAmount is 0.
  const filledVal = pct >= 100 ? 100 : Math.max(pct, 0.5);
  const remainingVal = 100 - filledVal;

  const data =
    remainingVal > 0
      ? [
          { id: 'saved', value: filledVal, color: filledColor },
          { id: 'remaining', value: remainingVal, color: remainingColor },
        ]
      : [{ id: 'saved', value: 100, color: filledColor }];

  // Ring dimensions — 68% cutout
  const outerRadius = Math.floor(size / 2) - 2;
  const innerRadius = Math.round(outerRadius * 0.68);

  // Center overlay sizing — slightly smaller than the inner hole
  const overlayWidth = innerRadius * 2 - 8;
  const isLarge = size >= 100;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <PieChart
        width={size}
        height={size}
        series={[
          {
            data,
            innerRadius,
            outerRadius,
            paddingAngle: 0,
            cornerRadius: 0,
            startAngle: -90,
            endAngle: 270,
          },
        ]}
        slots={{ legend: () => null, tooltip: () => null }}
        slotProps={{ legend: { hidden: true } }}
        margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
        sx={{ pointerEvents: 'none' }}
      />

      {/* Center content — always visible, never empty */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          width: overlayWidth,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: isLarge ? '1rem' : '0.75rem',
            lineHeight: 1.1,
            color: 'text.primary',
          }}
        >
          {pct}%
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: isLarge ? '0.6rem' : '0.5rem', lineHeight: 1.2 }}
        >
          of goal
        </Typography>
      </Box>
    </Box>
  );
};

export default GoalProgressChart;