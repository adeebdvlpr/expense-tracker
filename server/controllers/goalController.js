const Goal = require('../models/Goal');

exports.listGoals = async (req, res, next) => {
  try {
    const status = req.query.status;
    const filter = { user: req.user.id };
    if (status) filter.status = status;

    const goals = await Goal.find(filter).sort({ createdAt: -1 }).lean().exec();
    res.json(goals);
  } catch (err) {
    next(err);
  }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, notes, currency } = req.body;

    const created = await Goal.create({
      user: req.user.id,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount === undefined ? 0 : Number(currentAmount),
      targetDate: targetDate || undefined,
      notes: notes || undefined,
      currency: currency || 'USD',
      status: 'active',
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, notes, status, currency } = req.body;

    const update = {};
    if ('name' in req.body) update.name = name;
    if ('targetAmount' in req.body) update.targetAmount = Number(targetAmount);
    if ('currentAmount' in req.body) update.currentAmount = Number(currentAmount);
    if ('targetDate' in req.body) update.targetDate = targetDate || undefined;
    if ('notes' in req.body) update.notes = notes || undefined;
    if ('status' in req.body) update.status = status;
    if ('currency' in req.body) update.currency = currency;

    const updated = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Goal not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const removed = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!removed) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    next(err);
  }
};