const mongoose = require('mongoose');

const AIPredictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sourceType: {
      type: String,
      required: true,
      enum: ['asset', 'lifeEvent', 'expense', 'manual'],
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId },
    title: { type: String, required: true, maxlength: 200 },
    summary: { type: String, required: true },
    projectedCost: { type: Number, required: true, min: 0 },
    projectedDate: { type: Date },
    monthlySavingsTarget: { type: Number, min: 0 },
    timelineLabel: { type: String },       // e.g. "12–18 months"
    confidence: { type: String, enum: ['low', 'medium', 'high'] },
    riskRating: { type: String, enum: ['low', 'medium', 'high'] },
    opportunityCost: { type: String },
    linkedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    dismissed: { type: Boolean, default: false },
    aiProvider: { type: String, default: 'anthropic' },
    rawPrompt: { type: String },
    rawResponse: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIPrediction', AIPredictionSchema);
