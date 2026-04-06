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
      .send({ name: 'HVAC Unit', type: 'home_system', brand: 'Carrier', condition: 'good' })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('HVAC Unit');
    expect(res.body.type).toBe('home_system');
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
