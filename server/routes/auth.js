const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const validate = require('../middleware/validate');
const User = require('../models/User');

const authLoginValidators = [
  body('identifier')
    .trim()
    .notEmpty().withMessage('Username or email is required')
    .custom((value) => {
      // Check if it's a valid email OR a valid username
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value);
      if (!isEmail && !isUsername) {
        throw new Error('Must be a valid email or username');
      }
      return value.toLowerCase();
    }),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
];

const authRegisterValidators = [
  body('email')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  body('username')
    .trim()
    .isString().withMessage('Username must be a string')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
    .custom(async (value) => {
        const user = await User.findOne({ username: value });
        if (user) {
            throw new Error('Username already taken');
        }
        return true;
      }),
  body('password')
     .trim()
     .notEmpty().withMessage('Password is required')
     .isLength({ min: 7 }).withMessage('Password must be at least 7 characters')
     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
       .withMessage('Password must contain uppercase, lowercase, and number'),
  body('dateOfBirth')
    .optional({checkFalsy: true})
    .isISO8601({ strict: true }).withMessage('Date must be in YYYY-MM-DD format')
    .isBefore().withMessage('Birthday cannot be in the future')
    .toDate()
    .custom((value) => {
      const age = Math.floor((new Date() - new Date(value)) / 31557600000); // milliseconds in a year
      if (age > 120) {
        throw new Error('Invalid date of birth');
      }
      return true;
      }),
  body('reason')
    .optional({checkFalsy: true})
    .trim()
    .isIn(['Budgeting', 'Saving', 'Debt', 'Tracking', 'Other'])
      .withMessage('Reason must be one of: Budgeting, Saving, Debt, Tracking, Other')
    .escape()
];

router.post('/register', authRegisterValidators, validate, register);
router.post('/login', authLoginValidators, validate, login);

module.exports = router;