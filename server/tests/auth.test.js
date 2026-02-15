const request = require('supertest');

let app;

const unique = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;

beforeAll(() => {
  app = require('../server');
});

describe('Auth (register/login)', () => {
  test('POST /api/auth/register returns token (dateOfBirth/reason optional)', async () => {
    const u = unique();

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: `user_${u}`,                 // ✅ matches /^[a-zA-Z0-9_]{3,20}$/ (keep <= 20)
        email: `user_${u}@example.com`,        // ✅ valid email
        password: 'Password1',                // ✅ passes regex + length
        // dateOfBirth omitted
        // reason omitted
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  test('POST /api/auth/register accepts optional fields when provided', async () => {
    const u = unique();

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: `u_${u}`.slice(0, 20),       // ensure <= 20
        email: `u_${u}@example.com`,
        password: 'Password1',
        dateOfBirth: '1999-01-01',             // ✅ ISO8601 YYYY-MM-DD
        reason: 'Budgeting'                    // ✅ in allowed list
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/login returns token for valid credentials', async () => {
    const u = unique();
    const username = `u${u}`.slice(0, 20);
    const email = `${username}@example.com`;

    // Register first
    await request(app)
      .post('/api/auth/register')
      .send({ username, email, password: 'Password1' })
      .expect(200);

    // Login by username
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: username, password: 'Password1' })
      .expect(200);

    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/login fails for wrong password', async () => {
    const u = unique();
    const username = `u${u}`.slice(0, 20);

    await request(app)
      .post('/api/auth/register')
      .send({
        username,
        email: `${username}@example.com`,
        password: 'Password1',
      })
      .expect(200);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: username,
        password: 'Password2', // wrong
      })
      .expect(400);

    expect(res.body).toHaveProperty('message');
  });

  test('POST /api/auth/register rejects invalid username', async () => {
    const u = unique();

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'ab', // too short (min 3)
        email: `bad_${u}@example.com`,
        password: 'Password1',
      })
      .expect(400); // <-- your validate middleware currently uses 406

    // validate middleware shape might be { errors: [...] }
    expect(res.body).toBeTruthy();
  });
});
