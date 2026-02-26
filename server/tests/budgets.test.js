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

describe('Budgets v1', () => {
  test('Upsert -> List -> Delete budget', async () => {
    const token = await getToken();

    const created = await request(app)
      .post('/api/budgets')
      .set('x-auth-token', token)
      .send({
        period: '2026-02',
        category: 'Groceries',
        amount: 500,
        currency: 'USD',
      })
      .expect(201);

    expect(created.body).toHaveProperty('_id');

    const list = await request(app)
      .get('/api/budgets')
      .set('x-auth-token', token)
      .query({ period: '2026-02', includeSpent: true })
      .expect(200);

    expect(list.body).toHaveProperty('period', '2026-02');
    expect(Array.isArray(list.body.budgets)).toBe(true);

    await request(app)
      .delete(`/api/budgets/${created.body._id}`)
      .set('x-auth-token', token)
      .expect(200);
  });
});
