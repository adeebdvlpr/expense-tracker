// Mock AI dependencies before any require() so controllers get stubs.
jest.mock('../services/predictionEngine');
jest.mock('../services/aiService');

const request = require('supertest');
const predictionEngine = require('../services/predictionEngine');
const { callAI } = require('../services/aiService');

let app;

const unique = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;

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
  return agent;
}

beforeAll(() => {
  app = require('../server');
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Predictions API', () => {
  test('GET /api/predictions returns 200 and an array', async () => {
    const agent = await createAuthAgent();
    const res = await agent.get('/api/predictions').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/predictions/asset/:id returns 200 with mocked prediction', async () => {
    const agent = await createAuthAgent();

    const mockPrediction = {
      _id:          '000000000000000000000001',
      title:        'Toyota Camry Replacement Cost',
      summary:      'Based on age and depreciation, replacement in 5 years.',
      projectedCost: 28000,
      confidence:   'medium',
    };
    predictionEngine.generateForAsset.mockResolvedValue(mockPrediction);

    const res = await agent
      .post('/api/predictions/asset/000000000000000000000001')
      .expect(200);

    expect(res.body.title).toBe('Toyota Camry Replacement Cost');
    expect(res.body.projectedCost).toBe(28000);
  });

  test('POST /api/predictions/asset/:id returns 500 gracefully when engine throws', async () => {
    const agent = await createAuthAgent();
    predictionEngine.generateForAsset.mockRejectedValue(new Error('AI service unavailable'));

    const res = await agent
      .post('/api/predictions/asset/000000000000000000000001')
      .expect(500);

    expect(res.body).toHaveProperty('error');
    expect(res.body.details).toBe('AI service unavailable');
  });

  test('GET /api/predictions/global-audit returns 200 with audit shape', async () => {
    const agent = await createAuthAgent();
    predictionEngine.generateGlobalAudit.mockResolvedValue({
      needs:                  1200,
      wants:                  600,
      savings:                300,
      monthlyIncome:          5000,
      currency:               'USD',
      runwayMonths:           8,
      twelveMonthRequirement: 25000,
      categoryMap:            { Housing: 'need' },
      pulseInsight:           'Good progress on savings.',
    });

    const res = await agent.get('/api/predictions/global-audit').expect(200);

    expect(res.body).toHaveProperty('needs');
    expect(res.body).toHaveProperty('pulseInsight');
    expect(res.body.needs).toBe(1200);
  });

  test('POST /api/predictions/advisor-chat returns 200 with answer', async () => {
    const agent = await createAuthAgent();
    predictionEngine.generateGlobalAudit.mockResolvedValue({
      needs: 0, wants: 0, savings: 0, monthlyIncome: 0, currency: 'USD',
      runwayMonths: null, twelveMonthRequirement: null, categoryMap: {}, pulseInsight: null,
    });
    callAI.mockResolvedValue({ text: 'You should increase your savings rate.', rawResponse: '{}' });

    const res = await agent
      .post('/api/predictions/advisor-chat')
      .send({ question: 'Am I saving enough?' })
      .expect(200);

    expect(res.body).toHaveProperty('answer');
    expect(typeof res.body.answer).toBe('string');
  });
});
