const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const passport = require('../config/passport');
const { register, login, refresh, logout, googleCallback } = require('../controllers/authController');
const validate = require('../middleware/validate');

const authLoginValidators = [
  body('identifier')
    .trim()
    .notEmpty().withMessage('Username or email is required')
    .custom((value) => {
      const isEmail    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value);
      if (!isEmail && !isUsername) {
        throw new Error('Must be a valid email or username');
      }
      return value.toLowerCase();
    }),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required'),
];

const authRegisterValidators = [
  body('email')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
  body('username')
    .trim()
    .isString().withMessage('Username must be a string')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  // Note: username uniqueness is checked in the controller (not here) to avoid enumeration leaks
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 7 }).withMessage('Password must be at least 7 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  body('dateOfBirth')
    .optional({ checkFalsy: true })
    .isISO8601({ strict: true }).withMessage('Date must be in YYYY-MM-DD format')
    .isBefore().withMessage('Birthday cannot be in the future')
    .toDate()
    .custom((value) => {
      const age = Math.floor((new Date() - new Date(value)) / 31557600000);
      if (age > 120) throw new Error('Invalid date of birth');
      return true;
    }),
  body('reason')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(['Budgeting', 'Saving', 'Debt', 'Tracking', 'Other'])
      .withMessage('Reason must be one of: Budgeting, Saving, Debt, Tracking, Other')
    .escape(),
];

router.post('/register', authRegisterValidators, validate, register);
router.post('/login',    authLoginValidators,    validate, login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);

// ── Google OAuth 2.0 ────────────────────────────────────────────────────────
// Step 1: redirect browser to Google's consent screen
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Step 2: Google redirects here with a code; Passport exchanges it for profile
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth?error=oauth_failed' }),
  googleCallback
);

module.exports = router;
