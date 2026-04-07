'use strict';

/**
 * aiService.js — Single Anthropic SDK gateway.
 *
 * Architecture rule: this is the ONLY file in the codebase that may import
 * @anthropic-ai/sdk. All AI calls from controllers, engines, or schedulers
 * must go through callAI().
 */

const Anthropic = require('@anthropic-ai/sdk');

/**
 * Call the Anthropic API with the given prompts.
 *
 * @param {object}  options
 * @param {string}  options.systemPrompt  — system message (required)
 * @param {string}  options.userPrompt    — user message (required)
 * @param {string}  [options.model]       — defaults to 'claude-sonnet-4-6'
 * @param {number}  [options.maxTokens]   — defaults to 1024
 * @returns {Promise<{ text: string, rawResponse: string }>}
 */
async function callAI({ systemPrompt, userPrompt, model, maxTokens }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  const resolvedModel = model || "claude-haiku-4-5-20251001";
  const resolvedMaxTokens = maxTokens || 1024;

  // Instantiate per-call so tests can stub process.env without module-level caching.
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let response;
  try {
    response = await client.messages.create({
      model: resolvedModel,
      max_tokens: resolvedMaxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
  } catch (err) {
    throw new Error(`AI call failed: ${err.message}`);
  }

  const text = response.content[0].text;
  const rawResponse = JSON.stringify(response);
  return { text, rawResponse };
}

module.exports = { callAI };
