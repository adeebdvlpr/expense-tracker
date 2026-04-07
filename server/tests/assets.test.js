const request = require('supertest');

let app;

const unique = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;

async function getToken() {
  const u = unique();
  const username = `u${u}`.slice(0, 20);

  const res = await request(app)
    .post('/api/auth/register')
    .send({
      username,
      email: `${username}@example.com`,
      password: 'Password1',
    })
    .expect(200);

  return res.body.token;
}

beforeAll(() => {
  app = require('../server');
});

describe('Assets CRUD (basic)', () => {
  test('POST /api/assets returns 201 with valid payload', async () => {
    const token = await getToken();

    const res = await request(app)
      .post('/api/assets')
      .set('x-auth-token', token)
      .send({
        name: 'Toyota Camry 2020', type: 'vehicle', brand: 'Toyota', condition: 'good',
        estimatedCurrentValue: 14000,
        annualOwnershipCost: 1800,
        depreciationModel: 'straight_line',
        annualDepreciationRate: 15,
        generatesIncome: false,
        expectedReplacementYear: 2031,
        notes: 'Test vehicle note',
      })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Toyota Camry 2020');
    expect(res.body.type).toBe('vehicle');
    expect(res.body.estimatedCurrentValue).toBe(14000);
    expect(res.body.annualOwnershipCost).toBe(1800);
    expect(res.body.depreciationModel).toBe('straight_line');
    expect(res.body.annualDepreciationRate).toBe(15);
    expect(res.body.generatesIncome).toBe(false);
    expect(res.body.expectedReplacementYear).toBe(2031);
    expect(res.body.notes).toBe('Test vehicle note');
  });

  test('POST /api/assets returns 201 for real_estate with income fields', async () => {
    const token = await getToken();

    const res = await request(app)
      .post('/api/assets')
      .set('x-auth-token', token)
      .send({
        name: 'Rental Property', type: 'real_estate',
        generatesIncome: true,
        monthlyIncomeAmount: 1200,
        depreciationModel: 'appreciating',
      })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.generatesIncome).toBe(true);
    expect(res.body.monthlyIncomeAmount).toBe(1200);
    expect(res.body.depreciationModel).toBe('appreciating');
  });

  test('GET /api/assets returns 200 with array', async () => {
    const token = await getToken();

    // Create one first
    await request(app)
      .post('/api/assets')
      .set('x-auth-token', token)
      .send({ name: 'Refrigerator', type: 'appliance' })
      .expect(201);

    const res = await request(app)
      .get('/api/assets')
      .set('x-auth-token', token)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('PATCH /api/assets/:id returns 200 for owner', async () => {
    const token = await getToken();

    const created = await request(app)
      .post('/api/assets')
      .set('x-auth-token', token)
      .send({ name: 'Toyota Camry', type: 'vehicle', mileage: 45000 })
      .expect(201);

    const id = created.body._id;

    const res = await request(app)
      .patch(`/api/assets/${id}`)
      .set('x-auth-token', token)
      .send({ mileage: 47000, condition: 'good' })
      .expect(200);

    expect(res.body.mileage).toBe(47000);
    expect(res.body.condition).toBe('good');
  });

  test('DELETE /api/assets/:id returns 200 for owner', async () => {
    const token = await getToken();

    const created = await request(app)
      .post('/api/assets')
      .set('x-auth-token', token)
      .send({ name: 'Old Laptop', type: 'electronics' })
      .expect(201);

    const id = created.body._id;

    const res = await request(app)
      .delete(`/api/assets/${id}`)
      .set('x-auth-token', token)
      .expect(200);

    expect(res.body).toHaveProperty('message');

    // Confirm it's gone
    const list = await request(app)
      .get('/api/assets')
      .set('x-auth-token', token)
      .expect(200);

    expect(list.body.find((a) => a._id === id)).toBeUndefined();
  });

  test('GET /api/assets returns 401 without auth token', async () => {
    await request(app)
      .get('/api/assets')
      .expect(401);
  });
});
