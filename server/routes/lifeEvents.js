const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { listLifeEvents, createLifeEvent, updateLifeEvent, deleteLifeEvent } = require('../controllers/lifeEventController');

const LIFE_EVENT_TYPES = [
  'pet', 'college', 'vehicle_ownership', 'medical', 'eldercare',
  'wedding', 'home_purchase', 'home_renovation', 'new_baby', 'retirement', 'relocation', 'other',
];

router.get('/', auth, listLifeEvents);

router.post(
  '/',
  auth,
  [
    body('name').isString().trim().notEmpty().withMessage('name is required'),
    body('type').isIn(LIFE_EVENT_TYPES).withMessage(`type must be one of: ${LIFE_EVENT_TYPES.join(', ')}`),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('details').optional().isObject().withMessage('details must be an object'),
  ],
  validate,
  createLifeEvent
);

router.patch(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid life event id'),
    body('name').optional().isString().trim().notEmpty().withMessage('name must not be empty'),
    body('type').optional().isIn(LIFE_EVENT_TYPES).withMessage(`type must be one of: ${LIFE_EVENT_TYPES.join(', ')}`),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('details').optional().isObject().withMessage('details must be an object'),
  ],
  validate,
  updateLifeEvent
);

router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid life event id')],
  validate,
  deleteLifeEvent
);

module.exports = router;
