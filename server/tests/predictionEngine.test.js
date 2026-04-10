'use strict';

/**
 * predictionEngine.test.js
 *
 * Tests for generateForAsset and generateForLifeEvent.
 * callAI is mocked — no real Anthropic API calls are made.
 */

jest.mock('../services/aiService');

const { callAI } = require('../services/aiService');
const mongoose   = require('mongoose');
const request    = require('supertest');

let app;

const unique = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;

/**
 * Register a new user, return a cookie-bearing agent + the user's MongoDB _id.
 * userId is fetched via GET /api/users/me after registration.
 */
async function createAuthAgent() {
  const agent = request.agent(app);
  const u = unique();
  await agent
    .post('/api/auth/register')
    .send({
      username: `u${u}`.slice(0, 20),
      email:    `u${u}@example.com`,
      password: 'Password1',
    })
    .expect(200);

  const me = await agent.get('/api/users/me').expect(200);
  return { agent, userId: me.body._id };
}

beforeAll(() => {
  app = require('../server');
});

beforeEach(() => {
  callAI.mockResolvedValue({
    text: JSON.stringify({
      title:               'Test Prediction',
      summary:             'This is a test projection summary.',
      projectedCost:       5000,
      projectedDate:       '2027-06-01',
      monthlySavingsTarget: 200,
      timelineLabel:       '18–24 months',
      confidence:          'medium',
    }),
    rawResponse: '{"mock":true}',
  });
});

afterEach(() => jest.clearAllMocks());

describe('predictionEngine', () => {
  const { generateForAsset, generateForLifeEvent } = require('../services/predictionEngine');

  test('generateForAsset creates an AIPrediction document', async () => {
    const { agent, userId } = await createAuthAgent();

    const assetRes = await agent
      .post('/api/assets')
      .send({
        name:                 'Honda Civic 2018',
        type:                 'vehicle',
        brand:                'Honda',
        condition:            'good',
        estimatedCurrentValue: 11000,
        annualOwnershipCost:  1500,
        depreciationModel:    'straight_line',
        annualDepreciationRate: 12,
      })
      .expect(201);

    const prediction = await generateForAsset(userId, assetRes.body._id);

    expect(prediction).toHaveProperty('_id');
    expect(prediction.sourceType).toBe('asset');
    expect(prediction.projectedCost).toBe(5000);
    expect(prediction.confidence).toBe('medium');
    expect(typeof prediction.rawPrompt).toBe('string');
    expect(prediction.rawPrompt.length).toBeGreaterThan(0);
    expect(prediction.rawResponse).toBe('{"mock":true}');
    expect(callAI).toHaveBeenCalledTimes(1);
  });

  test('generateForAsset throws if asset not found', async () => {
    const { userId } = await createAuthAgent();
    const fakeId = new mongoose.Types.ObjectId();

    await expect(generateForAsset(userId, fakeId)).rejects.toThrow(
      'Asset not found or access denied'
    );
    expect(callAI).not.toHaveBeenCalled();
  });

  test('generateForLifeEvent creates an AIPrediction document', async () => {
    const { userId } = await createAuthAgent();

    const LifeEvent = require('../models/LifeEvent');
    const event = await LifeEvent.create({
      user:     userId,
      name:     'Buddy the Dog',
      type:     'pet',
      isActive: true,
      details:  {
        petName:       'Buddy',
        species:       'Dog',
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

  test('generateForLifeEvent throws if life event not found', async () => {
    const { userId } = await createAuthAgent();
    const fakeId = new mongoose.Types.ObjectId();

    await expect(generateForLifeEvent(userId, fakeId)).rejects.toThrow(
      'Life event not found or access denied'
    );
    expect(callAI).not.toHaveBeenCalled();
  });

  test('generateForAsset saves prediction with defaults when AI returns invalid JSON', async () => {
    callAI.mockResolvedValue({ text: 'not valid json at all', rawResponse: '{}' });

    const { agent, userId } = await createAuthAgent();

    const assetRes = await agent
      .post('/api/assets')
      .send({ name: 'Old Fridge', type: 'appliance' })
      .expect(201);

    const prediction = await generateForAsset(userId, assetRes.body._id);

    expect(prediction).toHaveProperty('_id');
    expect(prediction.projectedCost).toBe(0);
    expect(prediction.confidence).toBe('low');
    expect(prediction.summary).toContain('not valid json at all');
  });
});
