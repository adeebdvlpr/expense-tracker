'use strict';

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { getAllPredictions, generateForAsset, generateForLifeEvent, deletePrediction } = require('../controllers/predictionController');

// GET /api/predictions — all predictions for the authenticated user
router.get('/', auth, getAllPredictions);

// POST /api/predictions/asset/:assetId — generate prediction for an asset
router.post('/asset/:assetId', auth, generateForAsset);

// POST /api/predictions/life-event/:eventId — generate prediction for a life event
router.post('/life-event/:eventId', auth, generateForLifeEvent);

// DELETE /api/predictions/:id — delete a prediction by id
router.delete('/:id', auth, deletePrediction);

module.exports = router;
