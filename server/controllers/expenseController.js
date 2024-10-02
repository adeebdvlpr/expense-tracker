const Expense = require('../models/Expense');

exports.addExpense = async (req, res, next) => {
  try {
    const { description, amount, category } = req.body;
    const newExpense = new Expense({
      description,
      amount: parseFloat(amount) || 0, // Ensure amount is stored as a number
      category,
      user: req.user.id
    });
    const savedExpense = await newExpense.save();
    res.status(201).json({
      _id: savedExpense._id,
      description: savedExpense.description,
      amount: savedExpense.amount,
      category: savedExpense.category
    });
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