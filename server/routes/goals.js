const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { listGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');

router.get(
  '/',
  auth,
  [
    query('status').optional().isIn(['active', 'completed', 'archived']).withMessage('Invalid status'),
  ],
  validate,
  listGoals
);

router.post(
  '/',
  auth,
  [
    body('name').isString().trim().notEmpty().isLength({ max: 60 }).withMessage('Name is required (max 60 chars)'),
    body('targetAmount').isFloat({ min: 0 }).withMessage('targetAmount must be >= 0').toFloat(),
    body('currentAmount').optional().isFloat({ min: 0 }).withMessage('currentAmount must be >= 0').toFloat(),
    body('targetDate').optional({ nullable: true }).isISO8601().withMessage('targetDate must be ISO8601').toDate(),
    body('notes').optional({ nullable: true }).isString().trim().isLength({ max: 300 }).withMessage('notes max 300 chars'),
    body('currency').optional({ checkFalsy: true }).isString().trim().isLength({ min: 3, max: 3 }).toUpperCase(),
  ],
  validate,
  createGoal
);

router.patch(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid goal id'),
    body('name').optional().isString().trim().notEmpty().isLength({ max: 60 }),
    body('targetAmount').optional().isFloat({ min: 0 }).toFloat(),
    body('currentAmount').optional().isFloat({ min: 0 }).toFloat(),
    body('targetDate').optional({ nullable: true }).isISO8601().toDate(),
    body('notes').optional({ nullable: true }).isString().trim().isLength({ max: 300 }),
    body('status').optional().isIn(['active', 'completed', 'archived']),
    body('currency').optional({ checkFalsy: true }).isString().trim().isLength({ min: 3, max: 3 }).toUpperCase(),
  ],
  validate,
  updateGoal
);

router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid goal id')],
  validate,
  deleteGoal
);

module.exports = router;