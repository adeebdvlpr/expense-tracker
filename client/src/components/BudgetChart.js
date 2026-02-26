// Used in the BudgetsPage

import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { formatMoney } from '../utils/money';

export default function BudgetChart({
  totalBudget = 0,
  totalSpent = 0,
  monthlyIncome = null,
  currency = 'USD',
}) {
  const data = useMemo(() => {
    const budget = Math.max(0, Number(totalBudget) || 0);
    const spent = Math.max(0, Number(totalSpent) || 0);
    const remaining = Math.max(0, budget - spent);

    const out = [
      { id: 0, value: spent, label: 'Used' },
      { id: 1, value: remaining, label: 'Remaining' },
    ];

    const incomeNum = Number(monthlyIncome);
    if (Number.isFinite(incomeNum) && incomeNum > 0) {
      const unbudgeted = Math.max(0, incomeNum - budget);
      out.push({ id: 2, value: unbudgeted, label: 'Unbudgeted Income' });
    }

    const total = out.reduce((s, x) => s + x.value, 0);
    return total > 0 ? out : [];
  }, [totalBudget, totalSpent, monthlyIncome]);

  if (!data.length) {
    return (
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Budget Overview
        </Typography>
        <Typography color="text.secondary">
          Add budgets (and optionally income) to see a chart overview.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
        Budget Overview
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Budget: <strong>{formatMoney(totalBudget, currency)}</strong> • Used:{' '}
        <strong>{formatMoney(totalSpent, currency)}</strong>
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <PieChart
          height={280}
          series={[
            {
              data,
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
