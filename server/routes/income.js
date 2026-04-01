const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const { getIncome, addIncome, deleteIncome } = require('../controllers/incomeController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', auth, getIncome);

router.post(
  '/',
  auth,
  [
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Amount must be a number greater than 0'),
    body('description')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 200 })
      .withMessage('Description must be 200 characters or less'),
    body('category')
      .optional()
      .isIn(['Salary', 'Freelance', 'Investment Return', 'Gift', 'Inheritance', 'Bonus', 'Other'])
      .withMessage('Invalid category'),
  ],
  validate,
  addIncome
);

router.delete(
  '/:id',
  auth,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid income id'),
  ],
  validate,
  deleteIncome
);

module.exports = router;
