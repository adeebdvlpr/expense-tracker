'use strict';

const AIPrediction = require('../models/AIPrediction');
const predictionEngine = require('../services/predictionEngine');

exports.getAllPredictions = async (req, res, next) => {
  try {
    const predictions = await AIPrediction.find({ user: req.user.id })
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
