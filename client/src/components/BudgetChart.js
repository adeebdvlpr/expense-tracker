// Used in the BudgetsPage

import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { formatMoney } from '../utils/money';

export default function BudgetChart({
  totalBudget = 0,
  totalSpent = 0,
  monthlyIncome = null,
  currency = 'USD',
  chartType = 'pie',
  // For bar chart: per-category data
  budgets = [],
}) {
  const theme = useTheme();

  // Pie data: used / remaining / unbudgeted income
  const pieData = useMemo(() => {
    const budget = Math.max(0, Number(totalBudget) || 0);
    const spent = Math.max(0, Number(totalSpent) || 0);
    const remaining = Math.max(0, budget - spent);

    const out = [
      { id: 0, value: spent, label: 'Used', color: theme.palette.primary.main },
      { id: 1, value: remaining, label: 'Remaining', color: theme.palette.success.main },
    ];

    const incomeNum = Number(monthlyIncome);
    if (Number.isFinite(incomeNum) && incomeNum > 0) {
      const unbudgeted = Math.max(0, incomeNum - budget);
      out.push({ id: 2, value: unbudgeted, label: 'Unbudgeted Income', color: theme.palette.info.main });
    }

    const total = out.reduce((s, x) => s + x.value, 0);
    return total > 0 ? out : [];
  }, [totalBudget, totalSpent, monthlyIncome, theme.palette]);

  // Bar data: budget vs actual per category
  const barData = useMemo(() => {
    const cats = budgets.map((b) => b.category || 'Uncategorized');
    const budgeted = budgets.map((b) => Number(b.amount) || 0);
    const spent = budgets.map((b) => Number(b.spent) || 0);
    return { cats, budgeted, spent };
  }, [budgets]);

  if (!pieData.length && budgets.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Budget Overview</Typography>
        <Typography color="text.secondary">
          Add budgets (and optionally income) to see a chart overview.
        </Typography>
      </Paper>
    );
  }

  // --- BAR: budget vs actual per category ---
  if (chartType === 'bar' && barData.cats.length > 0) {
    return (
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Budget vs Actual</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Budget: <strong>{formatMoney(totalBudget, currency)}</strong> • Spent:{' '}
          <strong>{formatMoney(totalSpent, currency)}</strong>
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <BarChart
            height={280}
            xAxis={[{ scaleType: 'band', data: barData.cats, tickLabelStyle: { fontSize: 11 } }]}
            series={[
              {
                data: barData.budgeted,
                label: 'Budgeted',
                color: theme.palette.primary.main,
                valueFormatter: (v) => formatMoney(v, currency),
              },
              {
                data: barData.spent,
                label: 'Spent',
                color: theme.palette.secondary.main,
                valueFormatter: (v) => formatMoney(v, currency),
              },
            ]}
            margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
          />
        </Box>
      </Paper>
    );
  }

  // --- PIE (default) ---
  if (!pieData.length) return null;

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Budget Overview</Typography>
      <Typography variant="body2" color="text.secondary">
        Budget: <strong>{formatMoney(totalBudget, currency)}</strong> • Used:{' '}
        <strong>{formatMoney(totalSpent, currency)}</strong>
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <PieChart
          height={280}
          series={[
            {
              data: pieData,
              innerRadius: 60,
              outerRadius: 110,
              paddingAngle: 2,
              cornerRadius: 6,
            },
          ]}
        />
      </Box>
    </Paper>
  );
}
