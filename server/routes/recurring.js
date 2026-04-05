const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  listRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  triggerRecurring,
} = require('../controllers/recurringController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const VALID_INTERVALS = ['daily', 'weekly', 'monthly', 'annual'];

// GET /api/recurring
router.get('/', auth, listRecurring);

// POST /api/recurring
router.post(
  '/',
  auth,
  [
    body('description')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 100 })
      .withMessage('Description must be 100 characters or less'),
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a number of 0 or greater'),
    body('category')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Category is required'),
    body('interval')
      .isIn(VALID_INTERVALS)
      .withMessage(`Interval must be one of: ${VALID_INTERVALS.join(', ')}`),
    body('startDate')
      .isISO8601()
      .withMessage('startDate must be a valid ISO 8601 date'),
    body('endDate')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('endDate must be a valid ISO 8601 date'),
  ],
  validate,
  createRecurring
);

// PATCH /api/recurring/:id
router.patch(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid recurring payment id'),
    body('description')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Description must be 100 characters or less'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Amount must be a number of 0 or greater'),
    body('category')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Category cannot be empty'),
    body('interval')
      .optional()
      .isIn(VALID_INTERVALS)
      .withMessage(`Interval must be one of: ${VALID_INTERVALS.join(', ')}`),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('startDate must be a valid ISO 8601 date'),
    body('endDate')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('endDate must be a valid ISO 8601 date'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
  validate,
  updateRecurring
);

// DELETE /api/recurring/:id
router.delete(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid recurring payment id'),
  ],
  validate,
  deleteRecurring
);

// POST /api/recurring/:id/trigger
router.post(
  '/:id/trigger',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid recurring payment id'),
  ],
  validate,
  triggerRecurring
);

module.exports = router;
