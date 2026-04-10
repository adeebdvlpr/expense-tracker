const request = require('supertest');

let app;

const unique = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;

/** Register a new user and return a cookie-bearing agent. */
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

describe('Assets CRUD (basic)', () => {
  test('POST /api/assets returns 201 with valid payload', async () => {
    const agent = await createAuthAgent();

    const res = await agent
      .post('/api/assets')
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
    const agent = await createAuthAgent();

    const res = await agent
      .post('/api/assets')
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
    const agent = await createAuthAgent();

    await agent.post('/api/assets').send({ name: 'Refrigerator', type: 'appliance' }).expect(201);

    const res = await agent.get('/api/assets').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('PATCH /api/assets/:id returns 200 for owner', async () => {
    const agent = await createAuthAgent();

    const created = await agent
      .post('/api/assets')
      .send({ name: 'Toyota Camry', type: 'vehicle', mileage: 45000 })
      .expect(201);

    const id = created.body._id;

    const res = await agent
      .patch(`/api/assets/${id}`)
      .send({ mileage: 47000, condition: 'good' })
      .expect(200);

    expect(res.body.mileage).toBe(47000);
    expect(res.body.condition).toBe('good');
  });

  test('DELETE /api/assets/:id returns 200 for owner', async () => {
    const agent = await createAuthAgent();

    const created = await agent
      .post('/api/assets')
      .send({ name: 'Old Laptop', type: 'electronics' })
      .expect(201);

    const id = created.body._id;

    const res = await agent.delete(`/api/assets/${id}`).expect(200);
    expect(res.body).toHaveProperty('message');

    const list = await agent.get('/api/assets').expect(200);
    expect(list.body.find((a) => a._id === id)).toBeUndefined();
  });

  test('GET /api/assets returns 401 without auth token', async () => {
    await request(app).get('/api/assets').expect(401);
  });
});
