import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';

function generateHslPalette(count) {
  return Array.from({ length: count }, (_, i) => {
    const hue = Math.round((360 / Math.max(count, 1)) * i);
    return `hsl(${hue} 55% 60%)`;
  });
}

function parseExpenseDate(expense) {
  const raw = expense?.date || expense?.createdAt || expense?.updatedAt;
  if (!raw) return null;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

const ExpenseChart = ({ expenses, chartType = 'pie' }) => {
  const theme = useTheme();
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const basePalette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
  ];

  // Category totals — used by pie + bar
  const categoryData = useMemo(() => {
    const map = new Map();
    for (const exp of safeExpenses) {
      const label = exp.category || 'Uncategorized';
      const value = typeof exp.amount === 'number' ? exp.amount : Number(exp.amount) || 0;
      map.set(label, (map.get(label) || 0) + value);
    }
    const labels = Array.from(map.keys());
    const totals = labels.map((k) => map.get(k));
    const colors =
      labels.length <= basePalette.length
        ? basePalette.slice(0, labels.length)
        : [...basePalette, ...generateHslPalette(labels.length - basePalette.length)];

    return labels.map((label, idx) => ({
      id: label,
      label,
      value: totals[idx],
      color: colors[idx],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeExpenses, theme.palette]);

  // Daily totals — used by line chart
  const dailyData = useMemo(() => {
    const map = new Map();
    for (const exp of safeExpenses) {
      const dt = parseExpenseDate(exp);
      if (!dt) continue;
      const key = toDateKey(dt);
      const value = typeof exp.amount === 'number' ? exp.amount : Number(exp.amount) || 0;
      map.set(key, (map.get(key) || 0) + value);
    }
    const keys = Array.from(map.keys()).sort();
    return {
      dates: keys,
      amounts: keys.map((k) => map.get(k)),
    };
  }, [safeExpenses]);

  if (safeExpenses.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>No chart data yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Add expenses to see your spending breakdown.
        </Typography>
      </Paper>
    );
  }

  // --- PIE (donut) ---
  if (chartType === 'pie') {
    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Spending Breakdown</Typography>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <PieChart
            height={320}
            series={[
              {
                data: categoryData,
                innerRadius: 60,
                outerRadius: 120,
                paddingAngle: 2,
                cornerRadius: 6,
                arcLabel: (item) => `$${item.value.toFixed(0)}`,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { innerRadius: 60, additionalRadius: -6, color: 'gray' },
                valueFormatter: (item) => `$${item.value.toFixed(2)}`,
              },
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: theme.palette.common.white,
                fontWeight: 700,
                fontSize: 12,
              },
            }}
          />
        </Box>
      </Paper>
    );
  }

  // --- BAR (category totals) ---
  if (chartType === 'bar') {
    const categories = categoryData.map((d) => d.label);
    const amounts = categoryData.map((d) => d.value);

    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Spending by Category</Typography>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <BarChart
            height={320}
            xAxis={[{ scaleType: 'band', data: categories, tickLabelStyle: { fontSize: 11 } }]}
            series={[
              {
                data: amounts,
                label: 'Amount ($)',
                color: theme.palette.primary.main,
                valueFormatter: (v) => `$${v.toFixed(2)}`,
              },
            ]}
            margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
          />
        </Box>
      </Paper>
    );
  }

  // --- LINE (daily spending trend) ---
  if (chartType === 'line') {
    if (dailyData.dates.length < 2) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 0.5 }}>Spending Over Time</Typography>
          <Typography variant="body2" color="text.secondary">
            Need expenses on at least 2 different dates to show a trend.
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Spending Over Time</Typography>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <LineChart
            height={320}
            xAxis={[{
              scaleType: 'point',
              data: dailyData.dates,
              tickLabelStyle: { fontSize: 10 },
            }]}
            series={[
              {
                data: dailyData.amounts,
                label: 'Daily spending ($)',
                color: theme.palette.primary.main,
                area: true,
                showMark: dailyData.dates.length <= 30,
                valueFormatter: (v) => `$${(v ?? 0).toFixed(2)}`,
              },
            ]}
            margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
          />
        </Box>
      </Paper>
    );
  }

  return null;
};

export default ExpenseChart;
