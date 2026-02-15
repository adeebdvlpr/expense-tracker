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
];

router.get('/me', auth, getMe);
router.patch('/me', auth, updateMeValidators, validate, updateMe);

module.exports = router;
