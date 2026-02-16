import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function generateHslPalette(count) {
  return Array.from({ length: count }, (_, i) => {
    const hue = Math.round((360 / Math.max(count, 1)) * i);
    return `hsl(${hue} 55% 60%)`;
  });
}

const ExpenseChart = ({ expenses }) => {
  const theme = useTheme();

  // ✅ Always define a stable array so hooks run every render
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // ✅ Hook is now unconditional
  const { labels, totals } = useMemo(() => {
    const map = new Map();
    for (const exp of safeExpenses) {
      const cat = exp.category || 'Uncategorized';
      const amt = typeof exp.amount === 'number' ? exp.amount : Number(exp.amount) || 0;
      map.set(cat, (map.get(cat) || 0) + amt);
    }
    const labels = Array.from(map.keys());
    const totals = labels.map((k) => map.get(k));
    return { labels, totals };
  }, [safeExpenses]);

  // ✅ Now it’s safe to early return
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

  const data = {
    labels,
    datasets: [
      {
        data: totals,
        backgroundColor: colors,
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Expense Distribution by Category' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw ?? 0;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0) || 1;
            const pct = Math.round((value / total) * 100);
            return `${ctx.label}: $${Number(value).toFixed(2)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Spending Breakdown
      </Typography>
      <Box sx={{ maxWidth: 520, mx: 'auto' }}>
        <Pie data={data} options={options} />
      </Box>
    </Paper>
  );
};

export default ExpenseChart;
