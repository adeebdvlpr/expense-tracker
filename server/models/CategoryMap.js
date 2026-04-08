'use strict';

/**
 * CategoryMap.js — Persistent store for AI-classified custom expense categories.
 *
 * One document per user. Default categories are classified statically in
 * predictionEngine.js and never stored here. Only custom categories (those not
 * in DEFAULT_TYPE_MAP) are persisted so the AI is called at most once per new
 * custom category ever added to a user's account.
 */

const mongoose = require('mongoose');

const categoryMapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // customCategoryName → 'need' | 'want' | 'saving'
    mapping: {
      type: Map,
      of: String,
      default: {},
    },
    // Append-only audit trail — one entry per AI batch call
    rawPrompts: [String],
    rawResponses: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CategoryMap', categoryMapSchema);
