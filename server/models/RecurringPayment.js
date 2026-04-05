const mongoose = require('mongoose');

const VALID_INTERVALS = ['daily', 'weekly', 'monthly', 'annual'];

const RecurringPaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  interval: {
    type: String,
    enum: VALID_INTERVALS,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null,
  },
  nextDueDate: {
    type: Date,
    required: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoggedDate: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('RecurringPayment', RecurringPaymentSchema);
