const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isRecurring: { type: Boolean, default: false },
  recurringPaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringPayment',
    default: null,
  },
}, { collection: 'expense-data', timestamps: true });

ExpenseSchema.index({ date: -1 });

module.exports = mongoose.model('Expense', ExpenseSchema);