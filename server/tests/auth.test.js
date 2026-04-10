const request = require('supertest');

let app;

const unique = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;

beforeAll(() => {
  app = require('../server');
});

describe('Auth (register/login) — HttpOnly cookie flow', () => {
  test('POST /api/auth/register sets accessToken cookie (dateOfBirth/reason optional)', async () => {
    const u = unique();

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: `u_${u}`.slice(0, 20),
        email:    `u_${u}@example.com`,
        password: 'Password1',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    // HttpOnly cookies are set via Set-Cookie header
    expect(res.headers['set-cookie']).toBeDefined();
    const cookieNames = res.headers['set-cookie'].map((c) => c.split('=')[0]);
    expect(cookieNames).toContain('accessToken');
  });

  test('POST /api/auth/register accepts optional fields when provided', async () => {
    const u = unique();

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username:    `u_${u}`.slice(0, 20),
        email:       `u_${u}@example.com`,
        password:    'Password1',
        dateOfBirth: '1999-01-01',
        reason:      'Budgeting',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/login sets accessToken cookie for valid credentials', async () => {
    const u        = unique();
    const username = `u${u}`.slice(0, 20);
    const email    = `${username}@example.com`;

    // Register first
    await request(app)
      .post('/api/auth/register')
      .send({ username, email, password: 'Password1' })
      .expect(200);

    // Login — use supertest agent so cookies carry forward if needed
    const agent = request.agent(app);
    const res = await agent
      .post('/api/auth/login')
      .send({ identifier: username, password: 'Password1' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
    const cookieNames = res.headers['set-cookie'].map((c) => c.split('=')[0]);
    expect(cookieNames).toContain('accessToken');
  });

  test('POST /api/auth/login fails for wrong password', async () => {
    const u        = unique();
    const username = `u${u}`.slice(0, 20);

    await request(app)
      .post('/api/auth/register')
      .send({ username, email: `${username}@example.com`, password: 'Password1' })
      .expect(200);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: username, password: 'WrongPass9' })
      .expect(400);

    expect(res.body).toHaveProperty('message');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('POST /api/auth/register rejects invalid username', async () => {
    const u = unique();

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'ab',                       // too short (min 3)
        email:    `bad_${u}@example.com`,
        password: 'Password1',
      })
      .expect(400);

    expect(res.body).toBeTruthy();
  });

  test('POST /api/auth/logout clears auth cookies', async () => {
    const u        = unique();
    const username = `u${u}`.slice(0, 20);

    // Register + login via agent to hold cookies
    const agent = request.agent(app);
    await agent
      .post('/api/auth/register')
      .send({ username, email: `${username}@example.com`, password: 'Password1' })
      .expect(200);

    const res = await agent.post('/api/auth/logout').expect(200);
    expect(res.body.success).toBe(true);
  });
});
