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

describe('Expenses CRUD (basic)', () => {
  test('Create -> List -> Delete expense', async () => {
    const token = await getToken();

    const created = await request(app)
      .post('/api/expenses')
      .set('x-auth-token', token)
      .send({
        description: 'Coffee',
        amount: 4.75,
        category: 'Food',
      })
      .expect(201);

    expect(created.body).toHaveProperty('_id');
    const id = created.body._id;

    const list = await request(app)
      .get('/api/expenses')
      .set('x-auth-token', token)
      .expect(200);

    expect(Array.isArray(list.body)).toBe(true);

    await request(app)
      .delete(`/api/expenses/${id}`)
      .set('x-auth-token', token)
      .expect(200);
  });

  test('Cannot access expenses without token', async () => {
    await request(app)
      .get('/api/expenses')
      .expect(401);
  });
});
