
// const express = require('express');
// const router = express.Router();
// const { addExpense, getExpenses, deleteExpense } = require('../controllers/expenseController');
// const Expense = require('../models/Expense'); // Add this line


// router.post('/', addExpense);
// router.get('/', async (req, res, next) => {
//     try {
//       const expenses = await Expense.find().lean();
//       res.json(expenses);
//     } catch (error) {
//       console.error('Error fetching expenses:', error);
//       next(error); // Pass the error to the global error handler
//     }
//   });
// router.delete('/:id', deleteExpense);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, deleteExpense } = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.post('/', auth, addExpense);
router.get('/', auth, getExpenses);
router.delete('/:id', auth, deleteExpense);

module.exports = router;