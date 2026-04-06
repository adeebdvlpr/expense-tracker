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

  // Theme selection
  selectedTheme: { type: String, default: 'misty-highlands' },

  // Custom expense categories
  customCategories: [{ type: String, trim: true }],

  // Income tracking type
  incomeType: {
    type: String,
    default: 'monthly',
    enum: ['monthly', 'annual', 'weekly', 'rolling'],
  },

  // Overall monthly budget cap (optional — stored on user, not period-specific)
  overallMonthlyBudget: {
    type: Number,
    required: false,
    min: 0,
  },

  // Location (for AI projection regionalisation)
  location: {
    city:       { type: String, trim: true },
    state:      { type: String, trim: true },
    country:    { type: String, trim: true },
    postalCode: { type: String, trim: true },
  },

  // Onboarding completion flag
  onboardingCompleted: { type: Boolean, default: false },

  // for third-party auth later
  // authProvider: { type: String, default: 'local', enum: ['local', 'google'] },
  // googleId: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
