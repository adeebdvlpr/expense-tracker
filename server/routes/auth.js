const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const validate = require('../middleware/validate');

const authValidators = [
  body('email')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
];

router.post('/register', authValidators, validate, register);
router.post('/login', authValidators, validate, login);

module.exports = router;
