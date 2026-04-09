'use strict';

const Notification = require('../models/Notification');

exports.listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id, dismissed: false })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const fieldsToSet = req.body.dismissed === true ? { dismissed: true } : { read: true };
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: fieldsToSet },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: 'Notification not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ updated: result.modifiedCount });
  } catch (err) {
    next(err);
  }
};
