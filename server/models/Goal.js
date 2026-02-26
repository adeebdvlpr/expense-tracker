const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, required: true, default: 0, min: 0 },
    targetDate: { type: Date, required: false },
    notes: { type: String, required: false, trim: true, maxlength: 300 },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    status: {
      type: String,
      required: true,
      default: 'active',
      enum: ['active', 'completed', 'archived'],
      index: true,
    },
  },
  { timestamps: true }
);

GoalSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Goal', GoalSchema);