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

describe('Life Events CRUD (basic)', () => {
  test('POST /api/life-events returns 201 with valid payload', async () => {
    const agent = await createAuthAgent();

    const res = await agent
      .post('/api/life-events')
      .send({
        name: 'Buddy the Dog',
        type: 'pet',
        details: {
          petName:       'Buddy',
          species:       'Dog',
          estimatedCost: 150,
          costFrequency: 'monthly',
          targetDate:    '2026-06-01',
        },
      })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Buddy the Dog');
    expect(res.body.type).toBe('pet');
    expect(res.body.isActive).toBe(true);
    expect(res.body.details.petName).toBe('Buddy');
    expect(res.body.details.estimatedCost).toBe(150);
    expect(res.body.details.costFrequency).toBe('monthly');
  });

  test('POST /api/life-events with type wedding returns 201', async () => {
    const agent = await createAuthAgent();

    const res = await agent
      .post('/api/life-events')
      .send({
        name: 'Our Wedding',
        type: 'wedding',
        details: {
          estimatedCost: 30000,
          costFrequency: 'one_time',
          targetDate:    '2027-06-15',
        },
      })
      .expect(201);

    expect(res.body.type).toBe('wedding');
    expect(res.body.details.estimatedCost).toBe(30000);
    expect(res.body.details.costFrequency).toBe('one_time');
  });

  test('GET /api/life-events returns 200 with array', async () => {
    const agent = await createAuthAgent();

    await agent
      .post('/api/life-events')
      .send({ name: 'College Fund', type: 'college' })
      .expect(201);

    const res = await agent.get('/api/life-events').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('PATCH /api/life-events/:id returns 200 for owner', async () => {
    const agent = await createAuthAgent();

    const created = await agent
      .post('/api/life-events')
      .send({ name: 'Dad care', type: 'eldercare', isActive: true })
      .expect(201);

    const id = created.body._id;

    const res = await agent
      .patch(`/api/life-events/${id}`)
      .send({
        isActive: false,
        details: { personName: 'Dad', careLevel: 'in_home', estimatedCost: 2000, costFrequency: 'monthly' },
      })
      .expect(200);

    expect(res.body.isActive).toBe(false);
    expect(res.body.details.personName).toBe('Dad');
    expect(res.body.details.estimatedCost).toBe(2000);
  });

  test('DELETE /api/life-events/:id returns 200 for owner', async () => {
    const agent = await createAuthAgent();

    const created = await agent
      .post('/api/life-events')
      .send({ name: 'Old medical plan', type: 'medical' })
      .expect(201);

    const id = created.body._id;

    const res = await agent.delete(`/api/life-events/${id}`).expect(200);
    expect(res.body).toHaveProperty('message');

    const list = await agent.get('/api/life-events').expect(200);
    expect(list.body.find((e) => e._id === id)).toBeUndefined();
  });

  test('GET /api/life-events returns 401 without auth token', async () => {
    await request(app).get('/api/life-events').expect(401);
  });
});
