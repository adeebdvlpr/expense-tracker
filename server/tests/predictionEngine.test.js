'use strict';

/**
 * predictionEngine.test.js
 *
 * Tests for generateForAsset and generateForLifeEvent.
 * callAI is mocked — no real Anthropic API calls are made.
 */

// Mock MUST be declared before any require of predictionEngine.
jest.mock('../services/aiService');

const { callAI } = require('../services/aiService');
const mongoose = require('mongoose');
const request = require('supertest');

let app;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const unique = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;

async function getToken() {
  const u = unique();
  const username = `u${u}`.slice(0, 20);
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, email: `${username}@example.com`, password: 'Password1' })
    .expect(200);
  return { token: res.body.token, userId: res.body.user?._id || null };
}

/** Decode the userId from the JWT without verifying (test-only helper). */
function decodeUserId(token) {
  const payload = Buffer.from(token.split('.')[1], 'base64').toString('utf8');
  return JSON.parse(payload).user.id;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeAll(() => {
  app = require('../server');
});

beforeEach(() => {
  callAI.mockResolvedValue({
    text: JSON.stringify({
      title: 'Test Prediction',
      summary: 'This is a test projection summary.',
      projectedCost: 5000,
      projectedDate: '2027-06-01',
      monthlySavingsTarget: 200,
      timelineLabel: '18–24 months',
      confidence: 'medium',
    }),
    rawResponse: '{"mock":true}',
  });
});

afterEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('predictionEngine', () => {
  const { generateForAsset, generateForLifeEvent } = require('../services/predictionEngine');

  // -----------------------------------------------------------------------
  // Test 1: generateForAsset creates an AIPrediction document
  // -----------------------------------------------------------------------
  test('generateForAsset creates an AIPrediction document', async () => {
    const { token } = await getToken();
    const userId = decodeUserId(token);

    // Create an asset via the API
    const assetRes = await request(app)
      .post('/api/assets')
      .set('x-auth-token', token)
      .send({
        name: 'Honda Civic 2018',
        type: 'vehicle',
        brand: 'Honda',
        condition: 'good',
        estimatedCurrentValue: 11000,
        annualOwnershipCost: 1500,
        depreciationModel: 'straight_line',
        annualDepreciationRate: 12,
      })
      .expect(201);

    const assetId = assetRes.body._id;

    const prediction = await generateForAsset(userId, assetId);

    expect(prediction).toHaveProperty('_id');
    expect(prediction.sourceType).toBe('asset');
    expect(prediction.projectedCost).toBe(5000);
    expect(prediction.confidence).toBe('medium');
    expect(typeof prediction.rawPrompt).toBe('string');
    expect(prediction.rawPrompt.length).toBeGreaterThan(0);
    expect(prediction.rawResponse).toBe('{"mock":true}');

    expect(callAI).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------------
  // Test 2: generateForAsset throws if asset not found
  // -----------------------------------------------------------------------
  test('generateForAsset throws if asset not found', async () => {
    const { token } = await getToken();
    const userId = decodeUserId(token);
    const fakeId = new mongoose.Types.ObjectId();

    await expect(generateForAsset(userId, fakeId)).rejects.toThrow(
      'Asset not found or access denied'
    );

    expect(callAI).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Test 3: generateForLifeEvent creates an AIPrediction document
  // -----------------------------------------------------------------------
  test('generateForLifeEvent creates an AIPrediction document', async () => {
    const { token } = await getToken();
    const userId = decodeUserId(token);

    // Create a life event via the model directly (avoids HTTP overhead)
    const LifeEvent = require('../models/LifeEvent');
    const event = await LifeEvent.create({
      user: userId,
      name: 'Buddy the Dog',
      type: 'pet',
      isActive: true,
      details: {
        petName: 'Buddy',
        species: 'Dog',
        estimatedCost: 150,
        costFrequency: 'monthly',
      },
    });

    const prediction = await generateForLifeEvent(userId, event._id);

    expect(prediction).toHaveProperty('_id');
    expect(prediction.sourceType).toBe('lifeEvent');
    expect(typeof prediction.title).toBe('string');
    expect(prediction.title.length).toBeGreaterThan(0);
    expect(typeof prediction.rawPrompt).toBe('string');
    expect(prediction.rawPrompt.length).toBeGreaterThan(0);

    expect(callAI).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------------
  // Test 4: generateForLifeEvent throws if life event not found
  // -----------------------------------------------------------------------
  test('generateForLifeEvent throws if life event not found', async () => {
    const { token } = await getToken();
    const userId = decodeUserId(token);
    const fakeId = new mongoose.Types.ObjectId();

    await expect(generateForLifeEvent(userId, fakeId)).rejects.toThrow(
      'Life event not found or access denied'
    );

    expect(callAI).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Test 5: generateForAsset handles unparseable AI response gracefully
  // -----------------------------------------------------------------------
  test('generateForAsset saves prediction with defaults when AI returns invalid JSON', async () => {
    callAI.mockResolvedValue({
      text: 'not valid json at all',
      rawResponse: '{}',
    });

    const { token } = await getToken();
    const userId = decodeUserId(token);

    const assetRes = await request(app)
      .post('/api/assets')
      .set('x-auth-token', token)
      .send({ name: 'Old Fridge', type: 'appliance' })
      .expect(201);

    const prediction = await generateForAsset(userId, assetRes.body._id);

    expect(prediction).toHaveProperty('_id');
    expect(prediction.projectedCost).toBe(0);
    expect(prediction.confidence).toBe('low');
    expect(prediction.summary).toContain('not valid json at all');
  });
});
