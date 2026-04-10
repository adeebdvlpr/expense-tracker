const request = require('supertest');

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

describe('Budgets v1', () => {
  test('Upsert -> List -> Delete budget', async () => {
    const agent = await createAuthAgent();

    const created = await agent
      .post('/api/budgets')
      .send({
        period:   '2026-02',
        category: 'Groceries',
        amount:   500,
        currency: 'USD',
      })
      .expect(201);

    expect(created.body).toHaveProperty('_id');

    const list = await agent
      .get('/api/budgets')
      .query({ period: '2026-02', includeSpent: true })
      .expect(200);

    expect(list.body).toHaveProperty('period', '2026-02');
    expect(Array.isArray(list.body.budgets)).toBe(true);

    await agent.delete(`/api/budgets/${created.body._id}`).expect(200);
  });
});
