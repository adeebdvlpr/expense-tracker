const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { listAssets, createAsset, updateAsset, deleteAsset } = require('../controllers/assetController');

const currentYear = new Date().getFullYear();

const ASSET_TYPES = ['home_system', 'appliance', 'vehicle', 'electronics', 'other'];
const CONDITIONS  = ['excellent', 'good', 'fair', 'poor'];

// Shared optional field validators (used by both POST and PATCH)
const optionalFields = [
  body('brand').optional().trim(),
  body('purchaseYear').optional().isInt({ min: 1900, max: currentYear }).withMessage(`purchaseYear must be between 1900 and ${currentYear}`).toInt(),
  body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('purchasePrice must be >= 0').toFloat(),
  body('warrantyLengthYears').optional().isFloat({ min: 0 }).withMessage('warrantyLengthYears must be >= 0').toFloat(),
  body('warrantyExpiryDate').optional({ nullable: true }).isISO8601().withMessage('warrantyExpiryDate must be a valid ISO 8601 date').toDate(),
  body('condition').optional().isIn(CONDITIONS).withMessage(`condition must be one of: ${CONDITIONS.join(', ')}`),
  body('subtype').optional().trim(),
  body('materialType').optional().trim(),
  body('mileage').optional().isFloat({ min: 0 }).withMessage('mileage must be >= 0').toFloat(),
  body('make').optional().trim(),
  body('vehicleModel').optional().trim(),
];

router.get('/', auth, listAssets);

router.post(
  '/',
  auth,
  [
    body('name').isString().trim().notEmpty().withMessage('name is required'),
    body('type').isIn(ASSET_TYPES).withMessage(`type must be one of: ${ASSET_TYPES.join(', ')}`),
    ...optionalFields,
  ],
  validate,
  createAsset
);

router.patch(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid asset id'),
    body('name').optional().isString().trim().notEmpty(),
    body('type').optional().isIn(ASSET_TYPES).withMessage(`type must be one of: ${ASSET_TYPES.join(', ')}`),
    ...optionalFields,
  ],
  validate,
  updateAsset
);

router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid asset id')],
  validate,
  deleteAsset
);

module.exports = router;
