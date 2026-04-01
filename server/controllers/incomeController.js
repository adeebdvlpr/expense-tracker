const Income = require('../models/Income');

exports.getIncome = async (req, res) => {
  try {
    const income = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    return res.json(income);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.addIncome = async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;
    const income = new Income({
      userId: req.user.id,
      amount,
      description,
      category: category || 'Other',
      ...(date ? { date } : {}),
    });
    const saved = await income.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) return res.status(404).json({ message: 'Income entry not found' });
    if (income.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await income.deleteOne();
    return res.json({ message: 'Income entry removed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
