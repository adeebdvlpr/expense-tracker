// Mock AI dependencies before any require() so controllers get stubs.
jest.mock('../services/predictionEngine');
jest.mock('../services/aiService');

const request = require('supertest');
const predictionEngine = require('../services/predictionEngine');
const { callAI } = require('../services/aiService');

let app;

const unique = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;

async function getToken() {
  const u = unique();
  const username = `u${u}`.slice(0, 20);
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, email: `${username}@example.com`, password: 'Password1' })
    .expect(200);
  return res.body.token;
}

beforeAll(() => {
  app = require('../server');
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Predictions API', () => {
  test('GET /api/predictions returns 200 and an array', async () => {
    const token = await getToken();

    const res = await request(app)
      .get('/api/predictions')
      .set('x-auth-token', token)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/predictions/asset/:id returns 200 with mocked prediction', async () => {
    const token = await getToken();

    const mockPrediction = {
      _id: '000000000000000000000001',
      title: 'Toyota Camry Replacement Cost',
      summary: 'Based on age and depreciation, replacement in 5 years.',
      projectedCost: 28000,
      confidence: 'medium',
    };
    predictionEngine.generateForAsset.mockResolvedValue(mockPrediction);

    const res = await request(app)
      .post('/api/predictions/asset/000000000000000000000001')
      .set('x-auth-token', token)
      .expect(200);

    expect(res.body.title).toBe('Toyota Camry Replacement Cost');
    expect(res.body.projectedCost).toBe(28000);
  });

  test('POST /api/predictions/asset/:id returns 500 gracefully when engine throws', async () => {
    const token = await getToken();
    predictionEngine.generateForAsset.mockRejectedValue(new Error('AI service unavailable'));

    const res = await request(app)
      .post('/api/predictions/asset/000000000000000000000001')
      .set('x-auth-token', token)
      .expect(500);

    expect(res.body).toHaveProperty('error');
    expect(res.body.details).toBe('AI service unavailable');
  });

  test('GET /api/predictions/global-audit returns 200 with audit shape', async () => {
    const token = await getToken();
    predictionEngine.generateGlobalAudit.mockResolvedValue({
      needs: 1200,
      wants: 600,
      savings: 300,
      monthlyIncome: 5000,
      currency: 'USD',
      runwayMonths: 8,
      twelveMonthRequirement: 25000,
      categoryMap: { Housing: 'need' },
      pulseInsight: 'Good progress on savings.',
    });

    const res = await request(app)
      .get('/api/predictions/global-audit')
      .set('x-auth-token', token)
      .expect(200);

    expect(res.body).toHaveProperty('needs');
    expect(res.body).toHaveProperty('pulseInsight');
    expect(res.body.needs).toBe(1200);
  });

  test('POST /api/predictions/advisor-chat returns 200 with answer', async () => {
    const token = await getToken();
    predictionEngine.generateGlobalAudit.mockResolvedValue({
      needs: 0, wants: 0, savings: 0, monthlyIncome: 0, currency: 'USD',
      runwayMonths: null, twelveMonthRequirement: null, categoryMap: {}, pulseInsight: null,
    });
    callAI.mockResolvedValue({ text: 'You should increase your savings rate.', rawResponse: '{}' });

    const res = await request(app)
      .post('/api/predictions/advisor-chat')
      .set('x-auth-token', token)
      .send({ question: 'Am I saving enough?' })
      .expect(200);

    expect(res.body).toHaveProperty('answer');
    expect(typeof res.body.answer).toBe('string');
  });
});
