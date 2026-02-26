const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getMe, updateMe } = require('../controllers/userController');

const updateMeValidators = [
  body('dateOfBirth')
    .optional({ checkFalsy: true, nullable: true })
    .isISO8601({ strict: true }).withMessage('Date must be in YYYY-MM-DD format')
    .isBefore().withMessage('Birthday cannot be in the future')
    .toDate()
    .custom((value) => {
      const age = Math.floor((new Date() - new Date(value)) / 31557600000);
      if (age > 120) throw new Error('Invalid date of birth');
      return true;
    }),

  body('reason')
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isIn(['Budgeting', 'Saving', 'Debt', 'Tracking', 'Other'])
    .withMessage('Reason must be one of: Budgeting, Saving, Debt, Tracking, Other')
    ,
      body('monthlyIncome')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true; // allow clearing
      const num = Number(value);
      if (!Number.isFinite(num)) throw new Error('Monthly income must be a number');
      if (num < 0) throw new Error('Monthly income must be 0 or greater');
      if (num > 1_000_000) throw new Error('Monthly income seems too large');
      return true;
    })
    .toFloat(),

  body('currency')
    .optional({ checkFalsy: true })
    .isString().withMessage('Currency must be a string')
    .trim()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code (e.g., USD)')
    .toUpperCase(),

  body('dashboardPrefs')
    .optional()
    .isObject().withMessage('dashboardPrefs must be an object'),
  body('dashboardPrefs.showExpenseChart')
    .optional()
    .isBoolean().withMessage('showExpenseChart must be boolean'),
  body('dashboardPrefs.showBudgetWidget')
    .optional()
    .isBoolean().withMessage('showBudgetWidget must be boolean'),
  body('dashboardPrefs.showGoalsWidget')
    .optional()
    .isBoolean().withMessage('showGoalsWidget must be boolean'),

  ];

router.get('/me', auth, getMe);
router.patch('/me', auth, updateMeValidators, validate, updateMe);

module.exports = router;
