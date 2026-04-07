// Mock the AI engine before any require() so the controller gets the stub.
jest.mock('../services/predictionEngine');

const request = require('supertest');
const predictionEngine = require('../services/predictionEngine');

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
});
