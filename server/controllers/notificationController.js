'use strict';

const Notification = require('../models/Notification');
const User = require('../models/User');
const Goal = require('../models/Goal');
const { createNotification } = require('../services/notificationService');

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

// Evaluate user profile completeness and create notifications for missing critical fields.
// Critical fields: monthlyIncome, location (city or country), at least one active goal.
exports.createChecklistNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    const goals = await Goal.find({ user: req.user.id, status: 'active' }).lean();

    const CRITICAL_FIELDS = [
      {
        key: 'income',
        label: 'Monthly Income',
        missing: !user.monthlyIncome,
        route: '/account',
      },
      {
        key: 'residence',
        label: 'Primary Residence',
        missing: !user.location?.city && !user.location?.country,
        route: '/account',
      },
      {
        key: 'goal',
        label: 'Financial Goal',
        missing: goals.length === 0,
        route: '/goals',
      },
    ];

    const missingFields = CRITICAL_FIELDS.filter((f) => f.missing);
    const completedCount = CRITICAL_FIELDS.length - missingFields.length;
    const pct = Math.round((completedCount / CRITICAL_FIELDS.length) * 100);

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map((f) => f.label).join(', ');
      await createNotification(req.user.id, {
        type: 'onboarding_checklist',
        title: `Your Financial Audit is ${pct}% ready`,
        message: `Add your ${missingLabels} to unlock full AI insights.`,
        sourceType: 'checklist',
        sourceId: 'onboarding_checklist',
      });
    }

    res.json({ created: Math.min(missingFields.length, 1), missing: missingFields, completeness: pct });
  } catch (err) {
    next(err);
  }
};
