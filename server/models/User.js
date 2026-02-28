const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  reason: {
    type: String,
    required: false,
    enum: ['Budgeting', 'Saving', 'Debt', 'Tracking', 'Other'],
  },
  monthlyIncome: {
    type: Number,
    required: false,
    min: 0,
  },
  currency: {
    type: String,
    required: false,
    default: 'USD',
    trim: true,
    uppercase: true,
    minlength: 3,
    maxlength: 3,
  },

  // Persisted dashboard visibility toggles + chart type preference
  dashboardPrefs: {
    showExpenseChart: { type: Boolean, default: true },
    showBudgetWidget: { type: Boolean, default: true },
    showGoalsWidget: { type: Boolean, default: true },
    chartType: { type: String, default: 'pie', enum: ['pie', 'bar', 'line'] },
  },

  // for third-party auth later
  // authProvider: { type: String, default: 'local', enum: ['local', 'google'] },
  // googleId: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
