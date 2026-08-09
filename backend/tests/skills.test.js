const request = require('supertest');
const app = require('../src/server');

describe('Skills Endpoints', () => {
  let adminToken = '';
  let skillId = '';
  const timestamp = Date.now();

  beforeAll(async () => {
    const email = `admin${timestamp}@test.com`;
    const phone = `07123456${timestamp % 1000}`;
    
    // Register a test user
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Admin User',
        email: email,
        phone: phone,
        password: 'Test@1234',
        county: 'Nairobi',
      });
    
    // Auto-verify the user
    await global.verifyUser(email);
    
    // Login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: email,
        password: 'Test@1234',
      });
    adminToken = res.body.data.accessToken;
  });

  describe('POST /api/skills', () => {
    it('should create a new skill', async () => {
      const res = await request(app)
        .post('/api/skills')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `JavaScript${timestamp}`,
          description: 'Programming language',
          category: 'Technology',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      skillId = res.body.data.id;
    });

    it('should not create duplicate skill', async () => {
      const res = await request(app)
        .post('/api/skills')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `JavaScript${timestamp}`,
          description: 'Programming language',
          category: 'Technology',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/skills', () => {
    it('should get all skills', async () => {
      const res = await request(app)
        .get('/api/skills');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});