import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body1">No data available for the chart.</Typography>
      </Box>
    );
  }

  const categories = [...new Set(expenses.map(exp => exp.category))];
  const colorPalette = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', 
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
  ];

  const data = {
    labels: categories,
    datasets: [
      {
        data: categories.map(cat => 
          expenses.filter(exp => exp.category === cat)
            .reduce((sum, exp) => sum + exp.amount, 0)
        ),
        backgroundColor: colorPalette.slice(0, categories.length),
        borderColor: colorPalette.slice(0, categories.length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Expense Distribution by Category',
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default ExpenseChart;