'use strict';

const AIPrediction = require('../models/AIPrediction');
const predictionEngine = require('../services/predictionEngine');
const { callAI } = require('../services/aiService');

exports.getAllPredictions = async (req, res, next) => {
  try {
    const predictions = await AIPrediction.find({ user: req.user.id, dismissed: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    res.json(predictions);
  } catch (err) {
    next(err);
  }
};

exports.generateForAsset = async (req, res) => {
  try {
    const prediction = await predictionEngine.generateForAsset(req.user.id, req.params.assetId);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate prediction. AI service may be unavailable.',
      details: error.message,
    });
  }
};

exports.generateForLifeEvent = async (req, res) => {
  try {
    const prediction = await predictionEngine.generateForLifeEvent(req.user.id, req.params.eventId);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate prediction. AI service may be unavailable.',
      details: error.message,
    });
  }
};

exports.deletePrediction = async (req, res, next) => {
  try {
    const deleted = await AIPrediction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Prediction not found' });
    res.json({ message: 'Prediction deleted' });
  } catch (err) {
    next(err);
  }
};

exports.globalAudit = async (req, res) => {
  try {
    const audit = await predictionEngine.generateGlobalAudit(req.user.id);
    res.json(audit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate audit.', details: err.message });
  }
};

exports.advisorChat = async (req, res) => {
  const { question } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'question is required' });
  }

  try {
    // Build data context from global audit (aggregated data only — no raw descriptions)
    const audit = await predictionEngine.generateGlobalAudit(req.user.id);

    const systemPrompt =
      'You are Ledgic, a personal financial advisor. Give practical, personalized, concise advice ' +
      '(3–6 sentences) based on the user\'s actual financial data provided below. ' +
      'Never hallucinate numbers not present in the data. Reference specific categories or ' +
      'predictions where relevant. Be direct and actionable.';

    const userPrompt =
      `User financial data:\n${JSON.stringify(audit, null, 2)}\n\nUser question: ${question.trim()}`;

    const { text } = await callAI({ systemPrompt, userPrompt, maxTokens: 512 });
    res.json({ answer: text });
  } catch (_) {
    res.json({ answer: "I'm having trouble analyzing your data right now. Try again shortly." });
  }
};
