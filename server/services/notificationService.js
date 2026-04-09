'use strict';

const Notification = require('../models/Notification');

/**
 * Create a notification for a user, with deduplication.
 * If a non-dismissed, unread notification for the same (user, type, sourceId) exists,
 * returns the existing doc without inserting a duplicate.
 *
 * Never throws — logs errors and returns null on failure.
 */
async function createNotification(userId, { type, title, message, sourceType, sourceId, scheduledFor }) {
  try {
    if (sourceId) {
      const existing = await Notification.findOne({
        user: userId,
        type,
        sourceId,
        read: false,
        dismissed: false,
      }).lean();
      if (existing) return existing;
    }

    const doc = new Notification({
      user: userId,
      type,
      title,
      message,
      sourceType: sourceType || undefined,
      sourceId: sourceId || undefined,
      scheduledFor: scheduledFor || undefined,
    });

    return await doc.save();
  } catch (err) {
    console.error('[notificationService] createNotification error:', err.message || err);
    return null;
  }
}

module.exports = { createNotification };
