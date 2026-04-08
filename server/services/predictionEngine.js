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
const CategoryMap = require('../models/CategoryMap');
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
 Bracket-boundary sanitization: find the first '{' and the last '}'
 to ignore any markdown fences or conversational preamble.
 Uses lastIndexOf for the closing brace so the entire JSON object is captured,
 not just up to the first nested field's closing brace.
*/
function sanitizeAIJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1) return text;

  return text.substring(start, end + 1).trim();
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
// Static default category → type mapping (no AI needed for these)
// ---------------------------------------------------------------------------

const DEFAULT_TYPE_MAP = {
  'Housing':                 'need',
  'Food':                    'need',
  'Utilities':               'need',
  'Transportation':          'need',
  'Savings & Investments':   'saving',
  'Debt Payments':           'need',
  'Health & Personal Care':  'need',
  'Entertainment & Leisure': 'want',
  'Insurance':               'need',
  'Other':                   'want',
};

const DEFAULT_CATEGORY_SET = new Set(Object.keys(DEFAULT_TYPE_MAP));

// ---------------------------------------------------------------------------
// Shared system prompt shape
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT_BASE = `You are a Senior Financial Advisor. Today's date is {{CURRENT_DATE}}.
Your goal is to provide a "Strategic Financial Audit" for data in <client_data>.

ADVISORY LOGIC RULES:
1. Estimate Stress-Testing: Do not take the client's "Estimated Cost" at face value. Based on your general knowledge of global costs (inflation, travel, luxury vs. economy), provide a "Stress Test." If their estimate is aggressively low, suggest a 20% "Correction Buffer."
2. Financial Gap Analysis: Compare the required monthly savings to the client's current spending.
3. Trade-off Advice: Identify one specific category (e.g., 'Entertainment') to trim to fund this goal.
4. Opportunity Cost: Briefly state what this capital could achieve if invested in a low-cost index fund instead.
5. Accuracy: Perform all date math relative to {{CURRENT_DATE}}.

RESPONSE FORMAT:
Respond ONLY with a valid JSON object. No markdown. No preamble. Start with '{'.

{
  "title": "string",
  "summary": "3-4 sentences. Include the Stress Test (e.g. 'While $3,500 is a lean budget for France, we suggest a 15% buffer for peak-season flight volatility'). Identify the trade-off.",
  "projectedCost": number,
  "projectedDate": "ISO 8601 date",
  "monthlySavingsTarget": number,
  "opportunityCost": "string (e.g. 'This represents 4 months of your current transportation spend')",
  "riskRating": "low | medium | high",
  "confidence": "low | medium | high"
}`;

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

  // Step 4 — system prompt (inject current date for accurate timeline math)
  const currentDate = new Date().toLocaleDateString();
  const systemPrompt = `${SYSTEM_PROMPT_BASE.replace(/\{\{CURRENT_DATE\}\}/g, currentDate)}

Additional rules for asset projections:
- If the user's location is not set, explicitly state in the summary that this projection is not location-specific and may vary significantly by region.
- Use depreciationModel + annualDepreciationRate to project future asset value if available.
- If generatesIncome is true, factor monthly income against annual ownership cost for net projection.`;

  // Step 5 — build user prompt
  const lines = [];
  lines.push(`<client_data>`);
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
  lines.push(`</client_data>`);

  const userPrompt = lines.join('\n');

  // Step 6 — call AI
  const { text, rawResponse } = await callAI({
    systemPrompt,
    userPrompt,
    maxTokens: 1024,
  });

  // Step 7 — parse response
  const parsed = parseAIJson(text);

  let title, summary, projectedCost, projectedDate, monthlySavingsTarget, timelineLabel, confidence, riskRating, opportunityCost;

  if (!parsed) {
    title = `Advisory Insight: ${asset.name}`;
    summary = text.slice(0, 500);
    projectedCost = 0;
    confidence = 'low';
    projectedDate = null;
    monthlySavingsTarget = null;
    timelineLabel = null;
    riskRating = null;
    opportunityCost = null;
  } else {
    title = parsed.title;
    summary = parsed.summary;
    projectedCost = safeProjectedCost(parsed.projectedCost);
    projectedDate = parsed.projectedDate || null;
    monthlySavingsTarget = parsed.monthlySavingsTarget || null;
    timelineLabel = parsed.timelineLabel || null;
    confidence = parsed.confidence || 'low';
    riskRating = parsed.riskRating || null;
    opportunityCost = parsed.opportunityCost || null;
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
    riskRating,
    opportunityCost,
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

  // Step 4 — system prompt (inject current date for accurate timeline math)
  const currentDate = new Date().toLocaleDateString();
  const systemPrompt = `${SYSTEM_PROMPT_BASE.replace(/\{\{CURRENT_DATE\}\}/g, currentDate)}

Additional rules for life event projections:
- If the user's location is not set, explicitly state in the summary that this projection is not location-specific and may vary significantly by region.
- If costFrequency is 'monthly', project to annual or multi-year total cost.
- If targetDate is set, project cost to that date.
- If the event is inactive (isActive: false), note that in the summary.`;

  // Step 5 — build user prompt
  const lines = [];
  lines.push(`<client_data>`);
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
  lines.push(`</client_data>`);

  const userPrompt = lines.join('\n');

  // Step 6 — call AI
  const { text, rawResponse } = await callAI({
    systemPrompt,
    userPrompt,
    maxTokens: 1024,
  });

  // Step 7 — parse response
  const parsed = parseAIJson(text);

  let title, summary, projectedCost, projectedDate, monthlySavingsTarget, timelineLabel, confidence, riskRating, opportunityCost;

  if (!parsed) {
    title = `Advisory Insight: ${event.name}`;
    summary = text.slice(0, 500);
    projectedCost = 0;
    confidence = 'low';
    projectedDate = null;
    monthlySavingsTarget = null;
    timelineLabel = null;
    riskRating = null;
    opportunityCost = null;
  } else {
    title = parsed.title;
    summary = parsed.summary;
    projectedCost = safeProjectedCost(parsed.projectedCost);
    projectedDate = parsed.projectedDate || null;
    monthlySavingsTarget = parsed.monthlySavingsTarget || null;
    timelineLabel = parsed.timelineLabel || null;
    confidence = parsed.confidence || 'low';
    riskRating = parsed.riskRating || null;
    opportunityCost = parsed.opportunityCost || null;
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
    riskRating,
    opportunityCost,
    aiProvider: 'anthropic',
    rawPrompt: userPrompt,
    rawResponse,
  });

  return prediction;
}

// ---------------------------------------------------------------------------
// generateCategoryMap
// ---------------------------------------------------------------------------

/**
 * Return a mapping of category name → 'need' | 'want' | 'saving' for the
 * given list of categories.
 *
 * - Default categories are classified statically (zero AI calls).
 * - Custom categories are looked up from the persisted CategoryMap doc.
 * - Only newly-seen custom categories trigger an AI call; the result is
 *   stored permanently so the same category is never classified twice.
 *
 * @param {string|ObjectId} userId
 * @param {string[]} categories
 * @returns {Promise<Record<string, 'need'|'want'|'saving'>>}
 */
async function generateCategoryMap(userId, categories) {
  const result = {};

  const customs = [];
  for (const cat of categories) {
    if (DEFAULT_CATEGORY_SET.has(cat)) {
      result[cat] = DEFAULT_TYPE_MAP[cat];
    } else {
      customs.push(cat);
    }
  }

  if (customs.length === 0) return result;

  // Load existing custom classifications for this user
  const doc = await CategoryMap.findOne({ user: userId });
  const existingMapping = doc ? doc.mapping : new Map();

  const unclassified = customs.filter((c) => !existingMapping.has(c));

  // Merge already-classified customs into result
  for (const cat of customs) {
    if (existingMapping.has(cat)) {
      result[cat] = existingMapping.get(cat);
    }
  }

  if (unclassified.length === 0) return result;

  // Classify unclassified customs via AI (haiku — cheap, fast)
  const systemPrompt =
    'You are a personal finance classifier. Classify each expense category name as one of: need, want, or saving. ' +
    'Respond ONLY with a valid JSON object mapping each category name exactly as provided to one of those three values. No markdown. No explanation.';
  const userPrompt = JSON.stringify(unclassified);

  let newClassifications = {};
  let rawPrompt = userPrompt;
  let rawResponse = '';

  try {
    const { text, rawResponse: raw } = await callAI({ systemPrompt, userPrompt, maxTokens: 512 });
    rawResponse = raw;
    const parsed = parseAIJson(text);
    if (parsed && typeof parsed === 'object') {
      const valid = ['need', 'want', 'saving'];
      for (const cat of unclassified) {
        const val = parsed[cat];
        newClassifications[cat] = valid.includes(val) ? val : 'want';
      }
    } else {
      for (const cat of unclassified) newClassifications[cat] = 'want';
    }
  } catch (_) {
    // AI failure — default all unclassified to 'want'
    for (const cat of unclassified) newClassifications[cat] = 'want';
  }

  // Persist new classifications (upsert into CategoryMap doc)
  try {
    const update = {};
    for (const [cat, type] of Object.entries(newClassifications)) {
      update[`mapping.${cat}`] = type;
    }
    await CategoryMap.findOneAndUpdate(
      { user: userId },
      {
        $set: update,
        $push: { rawPrompts: rawPrompt, rawResponses: rawResponse },
      },
      { upsert: true, new: true }
    );
  } catch (_) {
    // Non-fatal — classifications still returned for this request
  }

  Object.assign(result, newClassifications);
  return result;
}

// ---------------------------------------------------------------------------
// generateGlobalAudit
// ---------------------------------------------------------------------------

/**
 * Aggregate the user's spending into need/want/saving buckets and generate
 * an AI-powered "pulse insight" string.
 *
 * Privacy rule: only category names and aggregated totals go to AI — never
 * raw transaction descriptions.
 *
 * @param {string|ObjectId} userId
 * @returns {Promise<object>} audit result with buckets + AI insight fields
 */
async function generateGlobalAudit(userId) {
  const FALLBACK = {
    needs: 0,
    wants: 0,
    savings: 0,
    monthlyIncome: 0,
    currency: 'USD',
    runwayMonths: null,
    twelveMonthRequirement: null,
    categoryMap: {},
    pulseInsight: null,
  };

  try {
    // Fetch user financial profile
    const user = await User.findById(userId).select('monthlyIncome currency');
    const monthlyIncome = (user && user.monthlyIncome) || 0;
    const currency = (user && user.currency) || 'USD';

    // Fetch current calendar month's expenses — category + amount ONLY (no descriptions)
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth(), 1);
    const expenses = await Expense.find({ user: userId, date: { $gte: since } })
      .select('amount category')
      .lean();

    // Group by category
    const categoryTotals = {};
    for (const e of expenses) {
      const cat = e.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.amount || 0);
    }

    const categories = Object.keys(categoryTotals);

    // Classify categories (static for defaults, AI for customs)
    const categoryMap = categories.length
      ? await generateCategoryMap(userId, categories)
      : {};

    // Compute bucket totals
    let needs = 0, wants = 0, savings = 0;
    for (const [cat, total] of Object.entries(categoryTotals)) {
      const type = categoryMap[cat] || 'want';
      if (type === 'need') needs += total;
      else if (type === 'saving') savings += total;
      else wants += total;
    }

    // Fetch active AIPredictions (title + projectedCost only)
    const predictions = await AIPrediction.find({ user: userId, dismissed: { $ne: true } })
      .select('title projectedCost')
      .lean();

    // Build AI input (no descriptions — privacy compliant)
    const auditInput = JSON.stringify({
      categoryTotals,
      categoryMap,
      monthlyIncome,
      predictions: predictions.map((p) => ({ title: p.title, projectedCost: p.projectedCost })),
    });

    const systemPrompt =
      'You are a financial analyst. Given the user\'s monthly spending data, calculate their financial runway and provide a brief insight. ' +
      'Respond ONLY with a valid JSON object with exactly these fields: ' +
      '{ "runwayMonths": number, "twelveMonthRequirement": number, "pulseInsight": "string (1-2 sentences, practical and specific)" }. ' +
      'No markdown. No extra fields.';

    const { text, rawResponse } = await callAI({ systemPrompt, userPrompt: auditInput, maxTokens: 512 });

    let runwayMonths = null;
    let twelveMonthRequirement = null;
    let pulseInsight = null;

    const parsed = parseAIJson(text);
    if (parsed) {
      runwayMonths = typeof parsed.runwayMonths === 'number' ? parsed.runwayMonths : null;
      twelveMonthRequirement = typeof parsed.twelveMonthRequirement === 'number' ? parsed.twelveMonthRequirement : null;
      pulseInsight = typeof parsed.pulseInsight === 'string' ? parsed.pulseInsight : null;
    }

    // Store audit trail as a dismissed AIPrediction (sourceType: 'manual')
    try {
      await AIPrediction.create({
        user: userId,
        sourceType: 'manual',
        title: 'Global Audit',
        summary: pulseInsight || 'Global 50/30/20 audit',
        projectedCost: 0,
        dismissed: true,
        aiProvider: 'anthropic',
        rawPrompt: auditInput,
        rawResponse,
      });
    } catch (_) {
      // Audit trail failure is non-fatal
    }

    return { needs, wants, savings, monthlyIncome, currency, runwayMonths, twelveMonthRequirement, categoryMap, pulseInsight };
  } catch (_) {
    return FALLBACK;
  }
}

// ---------------------------------------------------------------------------

module.exports = { generateForAsset, generateForLifeEvent, generateCategoryMap, generateGlobalAudit };
