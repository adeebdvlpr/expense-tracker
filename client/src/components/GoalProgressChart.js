import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

/**
 * GoalProgressChart — radial arc Gauge showing a single goal's completion percentage.
 *
 * Props:
 *   currentAmount  {number}  — amount saved so far
 *   targetAmount   {number}  — goal target
 *   currency       {string}  — goal currency (available for future use)
 *   size           {number}  — diameter in px (default 120)
 */
const GoalProgressChart = ({ currentAmount, targetAmount, size = 120 }) => {
  const theme = useTheme();

  const saved = typeof currentAmount === 'number' ? currentAmount : Number(currentAmount) || 0;
  const target = typeof targetAmount === 'number' ? targetAmount : Number(targetAmount) || 0;

  const pct =
    !target || target <= 0
      ? 0
      : Math.min(100, Math.round((saved / target) * 100));

  let arcColor;
  if (pct >= 75) {
    arcColor = theme.palette.success.main;
  } else if (pct >= 40) {
    arcColor = theme.palette.info.main;
  } else {
    arcColor = theme.palette.primary.main;
  }

  const isLarge = size >= 100;

  return (
    <Box sx={{ width: size, height: size, flexShrink: 0 }}>
      <Gauge
        width={size}
        height={size}
        value={pct}
        startAngle={-110}
        endAngle={110}
        text={({ value }) => `${value}%`}
        sx={{
          [`& .${gaugeClasses.valueArc}`]: {
            fill: arcColor,
          },
          [`& .${gaugeClasses.referenceArc}`]: {
            fill: theme.palette.action.disabledBackground,
          },
          [`& .${gaugeClasses.valueText}`]: {
            fontWeight: 700,
            fontSize: isLarge ? '1rem' : '0.75rem',
            fill: theme.palette.text.primary,
          },
        }}
      />
    </Box>
  );
};

export default GoalProgressChart;
