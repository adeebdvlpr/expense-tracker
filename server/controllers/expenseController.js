const Expense = require('../models/Expense');

exports.addExpense = async (req, res, next) => {
  try {
    const newExpense = new Expense({
      ...req.body,
      user: req.user.id
    });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error adding expense:', error);
    next(error);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).lean().exec();
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    next(error);
  }
};


// Delete an expense
exports.deleteExpense = async (req, res, next) => {
  try {
    const result = await Expense.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    next(error);
  }
};