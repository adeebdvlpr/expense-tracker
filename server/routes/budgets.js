const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { listBudgets, upsertBudget, deleteBudget } = require('../controllers/budgetController');

router.get(
  '/',
  auth,
  [
    query('period')
      .exists({ checkFalsy: true })
      .withMessage('period is required')
      .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
      .withMessage('period must be in YYYY-MM format'),
    query('includeSpent')
      .optional()
      .isBoolean()
      .withMessage('includeSpent must be boolean'),
  ],
  validate,
  listBudgets
);

// v1: upsert so UI can "Set budget" without managing IDs
router.post(
  '/',
  auth,
  [
    body('period')
      .exists({ checkFalsy: true })
      .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
      .withMessage('period must be in YYYY-MM format'),
    body('category')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('category is required')
      .isLength({ max: 50 })
      .withMessage('category must be 50 characters or less'),
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('amount must be a number greater than 0')
      .toFloat(),
    body('currency')
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ min: 3, max: 3 })
      .withMessage('currency must be a 3-letter code (e.g., USD)')
      .toUpperCase(),
  ],
  validate,
  upsertBudget
);

router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid budget id')],
  validate,
  deleteBudget
);

module.exports = router;