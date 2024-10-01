// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getExpenses, addExpense, deleteExpense } from '../utils/api';
// import ExpenseForm from '../components/ExpenseForm';
// import ExpenseList from '../components/ExpenseList';
// import ExpenseChart from '../components/ExpenseChart'; // Note the singular 'Chart'

// const ExpenseTracker = () => {
//   const [expenses, setExpenses] = useState([]);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchExpenses();
//   }, []);

//   const fetchExpenses = async () => {
//     try {
//       const data = await getExpenses();
//       setExpenses(data);
//     } catch (err) {
//       if (err.response && err.response.status === 401) {
//         // Unauthorized, redirect to login
//         localStorage.removeItem('token');
//         navigate('/auth');
//       } else {
//         setError('Failed to fetch expenses. Please try again later.');
//       }
//     }
//   };

//   const handleAddExpense = async (expense) => {
//     try {
//       const newExpense = await addExpense(expense);
//       setExpenses([...expenses, newExpense]);
//       setError(null);
//     } catch (err) {
//       setError('Failed to add expense. Please try again.');
//     }
//   };

//   const handleDeleteExpense = async (id) => {
//     try {
//       await deleteExpense(id);
//       setExpenses(expenses.filter(expense => expense._id !== id));
//       setError(null);
//     } catch (err) {
//       setError('Failed to delete expense. Please try again.');
//     }
//   };

//   return (
//     <div>
//       <h1>Expense Tracker</h1>
//       {error && <p className="error">{error}</p>}
//       <ExpenseForm onAddExpense={handleAddExpense} />
//       <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
//       <ExpenseChart expenses={expenses} />
//     </div>
//   );
// };

// export default ExpenseTracker;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExpenses, addExpense, deleteExpense } from '../utils/api';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseChart from '../components/ExpenseChart';
import { Container, Typography, Box, Alert } from '@mui/material';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
      } else {
        setError('Failed to fetch expenses. Please try again later.');
      }
    }
  };

  const handleAddExpense = async (expense) => {
    try {
      const newExpense = await addExpense(expense);
      setExpenses([...expenses, newExpense]);
      setError(null);
    } catch (err) {
      setError('Failed to add expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter(expense => expense._id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete expense. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h2" component="h1" gutterBottom>
        Expense Tracker
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ mb: 4 }}>
        <ExpenseForm onAddExpense={handleAddExpense} />
      </Box>
      <Box sx={{ mb: 4 }}>
        <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
      </Box>
      <Box>
        <ExpenseChart expenses={expenses} />
      </Box>
    </Container>
  );
};

export default ExpenseTracker;