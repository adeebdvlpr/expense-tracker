const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['warranty_expiry', 'inspection_reminder', 'ai_prediction', 'budget_alert', 'goal_milestone'],
    },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true },
    sourceType: { type: String },
    sourceId: { type: mongoose.Schema.Types.ObjectId },
    read: { type: Boolean, default: false },
    dismissed: { type: Boolean, default: false },
    scheduledFor: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
