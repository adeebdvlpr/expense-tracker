const LifeEvent = require('../models/LifeEvent');

exports.listLifeEvents = async (req, res, next) => {
  try {
    const events = await LifeEvent.find({ user: req.user.id }).sort({ createdAt: -1 }).lean().exec();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

exports.createLifeEvent = async (req, res, next) => {
  try {
    const { name, type, isActive, details } = req.body;

    const created = await LifeEvent.create({
      user: req.user.id,
      name,
      type,
      isActive: isActive !== undefined ? isActive : true,
      details: details || {},
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.updateLifeEvent = async (req, res, next) => {
  try {
    const update = {};
    const fields = ['name', 'type', 'isActive', 'details'];
    for (const field of fields) {
      if (field in req.body) update[field] = req.body[field];
    }

    const updated = await LifeEvent.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Life event not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteLifeEvent = async (req, res, next) => {
  try {
    const removed = await LifeEvent.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!removed) return res.status(404).json({ message: 'Life event not found' });
    res.json({ message: 'Life event deleted' });
  } catch (err) {
    next(err);
  }
};
