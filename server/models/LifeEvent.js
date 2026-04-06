const mongoose = require('mongoose');

const LifeEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'pet', 'college', 'vehicle_ownership', 'medical', 'eldercare',
        'wedding', 'home_purchase', 'home_renovation', 'new_baby', 'retirement', 'relocation', 'other',
      ],
    },
    name:     { type: String, required: true, trim: true, maxlength: 100 },
    isActive: { type: Boolean, default: true },
    details: {
      // universal fields — present on all event types
      description:   { type: String, default: '' },
      estimatedCost: { type: Number, default: null },
      costFrequency: { type: String, enum: ['one_time', 'monthly', 'annual'], default: 'one_time' },
      targetDate:    { type: Date,   default: null },
      // type-specific optional enrichment fields
      petName:            { type: String, default: '' },
      species:            { type: String, default: '' },
      age:                { type: Number, default: null },
      studentName:        { type: String, default: '' },
      institution:        { type: String, default: '' },
      startYear:          { type: Number, default: null },
      endYear:            { type: Number, default: null },
      vehicleDescription: { type: String, default: '' },
      condition:          { type: String, default: '' },
      personName:         { type: String, default: '' },
      careLevel:          { type: String, enum: ['in_home', 'assisted_living', 'memory_care', ''], default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LifeEvent', LifeEventSchema);
