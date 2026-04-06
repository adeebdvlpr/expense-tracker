const mongoose = require('mongoose');

const LifeEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['pet', 'college', 'vehicle_ownership', 'medical', 'eldercare', 'other'],
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    isActive: { type: Boolean, default: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LifeEvent', LifeEventSchema);
