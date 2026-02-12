const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const { addExpense, getExpenses, deleteExpense } = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  auth,
  [
    body('description')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 140 })
      .withMessage('Description must be 140 characters or less'),
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Amount must be a number greater than 0'),
    body('category')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Category is required')
      .isLength({ max: 50 })
      .withMessage('Category must be 50 characters or less')
  ],
  validate,
  addExpense
);

router.get('/', auth, getExpenses);

router.delete(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid expense id')
  ],
  validate,
  deleteExpense
);

module.exports = router;
