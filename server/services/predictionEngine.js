'use strict';

/**
 * predictionEngine.js — Domain logic for AI-powered financial projections.
 *
 * Rules:
 * - No req / res / next — this is pure domain logic, not transport.
 * - Calls aiService for all AI interactions; never imports @anthropic-ai/sdk.
 * - Throws on call failures; catches only JSON.parse failures (content failure).
 */

const { callAI } = require('./aiService');
const AIPrediction = require('../models/AIPrediction');
const Asset = require('../models/Asset');
const LifeEvent = require('../models/LifeEvent');
const User = require('../models/User');
const Expense = require('../models/Expense');

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Fetch user currency + location. */
async function fetchUser(userId) {
  return User.findById(userId).select('currency location');
}

/** Fetch last 90 days of expenses (max 20, description/amount/category/date). */
async function fetchRecentExpenses(userId) {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  return Expense.find({ user: userId, date: { $gte: since } })
    .sort({ date: -1 })
    .limit(20)
    .select('description amount category date');
}

/**
 * Calculate monthly average spend per category from recent expenses.
 * Groups by category, sums amounts, divides by number of distinct months covered.
 */
function spendingAveragesSummary(expenses) {
  if (!expenses.length) return '(no recent expense data)';

  // Find the date range to compute how many months are covered
  const dates = expenses.map((e) => new Date(e.date));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const monthsSpan = Math.max(
    1,
    (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
      (maxDate.getMonth() - minDate.getMonth()) +
      1
  );

  const totals = {};
  for (const e of expenses) {
    const cat = e.category || 'Uncategorized';
    totals[cat] = (totals[cat] || 0) + (e.amount || 0);
  }

  return Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, total]) => `  ${cat}: ~$${(total / monthsSpan).toFixed(0)}/mo`)
    .join('\n');
}

/** Location string for prompt — falls back gracefully. */
function locationString(user) {
  const loc = user && user.location;
  if (!loc) return '(location not set)';
  const parts = [loc.city, loc.state, loc.country].filter(Boolean);
  return parts.length ? parts.join(', ') : '(location not set)';
}

/**
 * Strip markdown code fences (```json ... ``` or ``` ... ```) before parsing.
 * Claude sometimes wraps JSON in markdown even when instructed not to.
 */

/*
 More robust sanitization is needed: This function now will find the first '{' and the last '}'
 To ignore any markedown fences or conversational preamble
*/ 
function sanitizeAIJson(text) {
  const start = text.indexOf('{');
  const end = text.indexOf('}');

  if (start === -1 || end === -1) return text;

  return text.substring(start, end +1).trim();
}

/** Parse AI JSON response; return null on failure. */
function parseAIJson(text) {
  try {
    return JSON.parse(sanitizeAIJson(text));
  } catch (_) {
    return null;
  }
}

/** Validate projectedCost — must be a finite number >= 0. */
function safeProjectedCost(value) {
  return typeof value === 'number' && isFinite(value) && value >= 0 ? value : 0;
}

// ---------------------------------------------------------------------------
// Shared system prompt shape
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT_BASE = `You are a Senior Financial Advisor providing conservative, actionable financial guidance. Your role is to assess a client's financial situation and generate a realistic cost projection based on their actual spending behavior and asset data.

You must respond with a single valid JSON object — no markdown, no code fences, no explanation, no text outside the JSON. Use this exact shape:
{
  "title": "string (max 80 chars) — concise advisory name for this projection",
  "summary": "string — 3 to 4 sentences of professional advisor guidance. Reference the client's actual spending averages where relevant. Be conservative and specific.",
  "projectedCost": number,
  "projectedDate": "ISO 8601 date string or null",
  "monthlySavingsTarget": number or null,
  "timelineLabel": "string or null",
  "confidence": "low" | "medium" | "high"
}

Rules:
- projectedCost must be a number >= 0, never null or a string.
- monthlySavingsTarget must be a number if projectedDate is set, otherwise null.
- confidence is "low" if key data is missing; "medium" if partial data is available; "high" if comprehensive.
- Tone: professional, measured, and actionable — not speculative or alarmist.
- Base your projections on the client's actual monthly spending averages provided.`;

// ---------------------------------------------------------------------------
// generateForAsset
// ---------------------------------------------------------------------------

/**
 * Generate and persist an AIPrediction for a given asset.
 *
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} assetId
 * @returns {Promise<AIPrediction>}
 */
async function generateForAsset(userId, assetId) {
  // Step 1 — fetch + validate asset
  const asset = await Asset.findOne({ _id: assetId, user: userId });
  if (!asset) throw new Error('Asset not found or access denied');

  // Step 2 — fetch user
  const user = await fetchUser(userId);

  // Step 3 — fetch recent expenses
  const recentExpenses = await fetchRecentExpenses(userId);

  // Step 4 — system prompt
  const systemPrompt = `${SYSTEM_PROMPT_BASE}

Additional rules for asset projections:
- If the user's location is not set, explicitly state in the summary that this projection is not location-specific and may vary significantly by region.
- Use depreciationModel + annualDepreciationRate to project future asset value if available.
- If generatesIncome is true, factor monthly income against annual ownership cost for net projection.`;

  // Step 5 — build user prompt
  const lines = [];
  lines.push(`Asset: ${asset.name}`);
  lines.push(`Type: ${asset.type}`);
  if (asset.brand) lines.push(`Brand: ${asset.brand}`);
  if (asset.condition) lines.push(`Condition: ${asset.condition}`);
  if (asset.purchaseYear) lines.push(`Purchase year: ${asset.purchaseYear}`);
  if (asset.purchasePrice != null) lines.push(`Purchase price: ${asset.purchasePrice}`);
  if (asset.estimatedCurrentValue != null) lines.push(`Estimated current value: ${asset.estimatedCurrentValue}`);
  if (asset.annualOwnershipCost != null) lines.push(`Annual ownership cost: ${asset.annualOwnershipCost}`);
  if (asset.depreciationModel && asset.depreciationModel !== 'none') {
    lines.push(`Depreciation model: ${asset.depreciationModel}`);
    if (asset.annualDepreciationRate != null) lines.push(`Annual depreciation rate: ${asset.annualDepreciationRate}%`);
  }
  if (asset.generatesIncome) {
    lines.push(`Generates income: yes`);
    if (asset.monthlyIncomeAmount != null) lines.push(`Monthly income amount: ${asset.monthlyIncomeAmount}`);
  }
  if (asset.expectedReplacementYear != null) lines.push(`Expected replacement year: ${asset.expectedReplacementYear}`);
  if (asset.warrantyExpiryDate) lines.push(`Warranty expiry: ${asset.warrantyExpiryDate.toISOString().slice(0, 10)}`);
  if (asset.notes) lines.push(`Notes: ${asset.notes}`);
  lines.push(`User currency: ${(user && user.currency) || 'USD'}`);
  lines.push(`User location: ${locationString(user)}`);
  lines.push(`Client monthly spending averages by category (last 90 days):\n${spendingAveragesSummary(recentExpenses)}`);

  const userPrompt = lines.join('\n');

  // Step 6 — call AI
  const { text, rawResponse } = await callAI({
    systemPrompt,
    userPrompt,
    maxTokens: 1024,
  });

  // Step 7 — parse response
  const parsed = parseAIJson(text);

  let title, summary, projectedCost, projectedDate, monthlySavingsTarget, timelineLabel, confidence;

  if (!parsed) {
    title = `Advisory Insight: ${asset.name}`;
    summary = text.slice(0, 500);
    projectedCost = 0;
    confidence = 'low';
    projectedDate = null;
    monthlySavingsTarget = null;
    timelineLabel = null;
  } else {
    title = parsed.title;
    summary = parsed.summary;
    projectedCost = safeProjectedCost(parsed.projectedCost);
    projectedDate = parsed.projectedDate || null;
    monthlySavingsTarget = parsed.monthlySavingsTarget || null;
    timelineLabel = parsed.timelineLabel || null;
    confidence = parsed.confidence || 'low';
  }

  // Step 8 — save and return
  const prediction = await AIPrediction.create({
    user: userId,
    sourceType: 'asset',
    sourceId: asset._id,
    title,
    summary,
    projectedCost,
    projectedDate,
    monthlySavingsTarget,
    timelineLabel,
    confidence,
    aiProvider: 'anthropic',
    rawPrompt: userPrompt,
    rawResponse,
  });

  return prediction;
}

// ---------------------------------------------------------------------------
// generateForLifeEvent
// ---------------------------------------------------------------------------

/**
 * Generate and persist an AIPrediction for a given life event.
 *
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} lifeEventId
 * @returns {Promise<AIPrediction>}
 */
async function generateForLifeEvent(userId, lifeEventId) {
  // Step 1 — fetch + validate life event
  const event = await LifeEvent.findOne({ _id: lifeEventId, user: userId });
  if (!event) throw new Error('Life event not found or access denied');

  // Step 2 — fetch user
  const user = await fetchUser(userId);

  // Step 3 — fetch recent expenses
  const recentExpenses = await fetchRecentExpenses(userId);

  // Step 4 — system prompt
  const systemPrompt = `${SYSTEM_PROMPT_BASE}

Additional rules for life event projections:
- If the user's location is not set, explicitly state in the summary that this projection is not location-specific and may vary significantly by region.
- If costFrequency is 'monthly', project to annual or multi-year total cost.
- If targetDate is set, project cost to that date.
- If the event is inactive (isActive: false), note that in the summary.`;

  // Step 5 — build user prompt
  const lines = [];
  lines.push(`Life event: ${event.name}`);
  lines.push(`Type: ${event.type}`);
  lines.push(`Active: ${event.isActive ? 'yes' : 'no'}`);
  lines.push(`Todays date: ${new Date().toLocaleDateString()}`);

  // Universal details fields
  const d = event.details || {};
  if (d.description) lines.push(`Description: ${d.description}`);
  if (d.estimatedCost != null) lines.push(`Estimated cost: ${d.estimatedCost}`);
  if (d.costFrequency) lines.push(`Cost frequency: ${d.costFrequency}`);
  if (d.targetDate) lines.push(`Target date: ${new Date(d.targetDate).toISOString().slice(0, 10)}`);

  // Type-specific detail fields (only non-empty values)
  if (d.petName) lines.push(`Pet name: ${d.petName}`);
  if (d.species) lines.push(`Species: ${d.species}`);
  if (d.age != null) lines.push(`Age: ${d.age}`);
  if (d.studentName) lines.push(`Student name: ${d.studentName}`);
  if (d.institution) lines.push(`Institution: ${d.institution}`);
  if (d.startYear != null) lines.push(`Start year: ${d.startYear}`);
  if (d.endYear != null) lines.push(`End year: ${d.endYear}`);
  if (d.vehicleDescription) lines.push(`Vehicle: ${d.vehicleDescription}`);
  if (d.condition) lines.push(`Condition: ${d.condition}`);
  if (d.personName) lines.push(`Person: ${d.personName}`);
  if (d.careLevel) lines.push(`Care level: ${d.careLevel}`);

  lines.push(`User currency: ${(user && user.currency) || 'USD'}`);
  lines.push(`User location: ${locationString(user)}`);
  lines.push(`Client monthly spending averages by category (last 90 days):\n${spendingAveragesSummary(recentExpenses)}`);

  const userPrompt = lines.join('\n');

  // Step 6 — call AI
  const { text, rawResponse } = await callAI({
    systemPrompt,
    userPrompt,
    maxTokens: 1024,
  });

  // Step 7 — parse response
  const parsed = parseAIJson(text);

  let title, summary, projectedCost, projectedDate, monthlySavingsTarget, timelineLabel, confidence;

  if (!parsed) {
    title = `Advisory Insight: ${event.name}`;
    summary = text.slice(0, 500);
    projectedCost = 0;
    confidence = 'low';
    projectedDate = null;
    monthlySavingsTarget = null;
    timelineLabel = null;
  } else {
    title = parsed.title;
    summary = parsed.summary;
    projectedCost = safeProjectedCost(parsed.projectedCost);
    projectedDate = parsed.projectedDate || null;
    monthlySavingsTarget = parsed.monthlySavingsTarget || null;
    timelineLabel = parsed.timelineLabel || null;
    confidence = parsed.confidence || 'low';
  }

  // Step 8 — save and return
  const prediction = await AIPrediction.create({
    user: userId,
    sourceType: 'lifeEvent',
    sourceId: event._id,
    title,
    summary,
    projectedCost,
    projectedDate,
    monthlySavingsTarget,
    timelineLabel,
    confidence,
    aiProvider: 'anthropic',
    rawPrompt: userPrompt,
    rawResponse,
  });

  return prediction;
}

// ---------------------------------------------------------------------------

module.exports = { generateForAsset, generateForLifeEvent };
