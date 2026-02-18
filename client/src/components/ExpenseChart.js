import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';

function generateHslPalette(count) {
  return Array.from({ length: count }, (_, i) => {
    const hue = Math.round((360 / Math.max(count, 1)) * i);
    return `hsl(${hue} 55% 60%)`;
  });
}

const ExpenseChart = ({ expenses }) => {
  const theme = useTheme();
  // Always define a stable array so hooks run every render
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const chartData = useMemo(() => {
    const map = new Map();
    for (const exp of safeExpenses) {
      const label = exp.category || 'Uncategorized';
      const value = typeof exp.amount === 'number' ? exp.amount : Number(exp.amount) || 0;
      map.set(label, (map.get(label) || 0) + value);
    }
    const labels = Array.from(map.keys());
    const totals = labels.map((k) => map.get(k));

    const basePalette = [
      theme.palette.primary.main, 
      theme.palette.secondary.main,
      theme.palette.success.main,  
      theme.palette.info.main, 
    ];

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
  }, [safeExpenses, theme.palette]);

  //  safe to early return
  if (safeExpenses.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          No chart data yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add expenses to see your category breakdown.
        </Typography>
      </Paper>
    );
  }

  //---> remove, getting 'Chart data' now instead of data
  // const data = {
  //   labels,
  //   datasets: [
  //     {
  //       data: totals,
  //       backgroundColor: colors,
  //       borderColor: theme.palette.background.paper,
  //       borderWidth: 2,
  //     },
  //   ],
  // };

  // const options = {
  //   responsive: true,
  //   plugins: {
  //     legend: { position: 'bottom' },
  //     title: { display: true, text: 'Expense Distribution by Category' },
  //     tooltip: {
  //       callbacks: {
  //         label: (ctx) => {
  //           const value = ctx.raw ?? 0;
  //           const total = ctx.dataset.data.reduce((a, b) => a + b, 0) || 1;
  //           const pct = Math.round((value / total) * 100);
  //           return `${ctx.label}: $${Number(value).toFixed(2)} (${pct}%)`;
  //         },
  //       },
  //     },
  //   },
  // };

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Spending Breakdown
      </Typography>


      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <PieChart
          height={320}
          series={[
            {
              data: chartData,
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
};


export default ExpenseChart;
