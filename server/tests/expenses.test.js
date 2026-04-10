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

describe('Expenses CRUD (basic)', () => {
  test('Create -> List -> Delete expense', async () => {
    const agent = await createAuthAgent();

    const created = await agent
      .post('/api/expenses')
      .send({
        description: 'Coffee',
        amount: 4.75,
        category: 'Entertainment & Leisure',
      })
      .expect(201);

    expect(created.body).toHaveProperty('_id');
    const id = created.body._id;

    const list = await agent.get('/api/expenses').expect(200);
    expect(Array.isArray(list.body)).toBe(true);

    await agent.delete(`/api/expenses/${id}`).expect(200);
  });

  test('Cannot access expenses without token', async () => {
    await request(app).get('/api/expenses').expect(401);
  });
});
