const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    type: {
      type: String,
      required: true,
      enum: ['home_system', 'appliance', 'vehicle', 'electronics', 'real_estate', 'investment', 'business', 'other'],
    },
    brand: { type: String, trim: true, maxlength: 100 },
    purchaseYear: { type: Number, min: 1900, max: new Date().getFullYear() },
    purchasePrice: { type: Number, min: 0 },
    warrantyLengthYears: { type: Number, min: 0 },
    warrantyExpiryDate: { type: Date },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
    },
    // Home system / appliance specific
    subtype: { type: String, trim: true },       // e.g. 'roof', 'hvac'
    materialType: { type: String, trim: true },
    // Vehicle specific
    mileage: { type: Number, min: 0 },
    make: { type: String, trim: true },
    vehicleModel: { type: String, trim: true },
    // Universal financial fields (all optional)
    estimatedCurrentValue:   { type: Number,  default: null },
    annualOwnershipCost:     { type: Number,  default: null },
    depreciationModel:       {
      type: String,
      enum: ['none', 'straight_line', 'accelerated', 'appreciating'],
      default: 'none',
    },
    annualDepreciationRate:  { type: Number,  default: null },
    generatesIncome:         { type: Boolean, default: false },
    monthlyIncomeAmount:     { type: Number,  default: null },
    expectedReplacementYear: { type: Number,  default: null },
    notes:                   { type: String,  default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', AssetSchema);
