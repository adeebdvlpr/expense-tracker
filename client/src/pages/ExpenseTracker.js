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

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getExpenses, addExpense, deleteExpense } from '../utils/api';
// import ExpenseForm from '../components/ExpenseForm';
// import ExpenseList from '../components/ExpenseList';
// import ExpenseChart from '../components/ExpenseChart';
// import { Container, Typography, Box, Alert } from '@mui/material';

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
//     <Container maxWidth="md">
//       <Typography variant="h2" component="h1" gutterBottom>
//         Expense Tracker
//       </Typography>
//       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
//       <Box sx={{ mb: 4 }}>
//         <ExpenseForm onAddExpense={handleAddExpense} />
//       </Box>
//       <Box sx={{ mb: 4 }}>
//         <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
//       </Box>
//       <Box>
//         <ExpenseChart expenses={expenses} />
//       </Box>
//     </Container>
//   );
// };

// export default ExpenseTracker;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExpenses, addExpense, deleteExpense } from '../utils/api';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseChart from '../components/ExpenseChart';
import { Container, Typography, Box, Alert, CircularProgress, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to fetch expenses. Please try again later.');
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleAddExpense = async (expense) => {
  //   try {
  //     const newExpense = await addExpense(expense);
  //     setExpenses([...expenses, newExpense]);
  //     setError(null);
  //   } catch (err) {
  //     console.error('Error adding expense:', err);
  //     setError('Failed to add expense. Please try again.');
  //   }
  // };

  const handleAddExpense = async (expense) => {
    try {
      const newExpense = await addExpense(expense);
      // Ensure the new expense has the correct structure
      const formattedNewExpense = {
        ...newExpense,
        amount: parseFloat(newExpense.amount) || 0, // Use 0 if parsing fails
        description: newExpense.description || '',
        category: newExpense.category || 'Uncategorized'
      };
      setExpenses(prevExpenses => [...prevExpenses, formattedNewExpense]);
      setError(null);
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter(expense => expense._id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left sidebar with logo */}
      <Box
        sx={{
          width: '200px',
          backgroundColor: '#e8f5e9', // Light green color
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 2,
        }}
      >
        <img src="/logo.png" alt="Logo" style={{ width: '150px', height: 'auto' }} />
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, pl: 4, pr: 2 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h2" component="h1">
              Expense Tracker
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Box>
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
      </Box>
    </Box>
  );
};

export default ExpenseTracker;