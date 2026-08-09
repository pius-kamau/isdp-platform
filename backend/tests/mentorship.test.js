const request = require('supertest');
const app = require('../src/server');

describe('Mentorship Endpoints', () => {
  let userToken = '';
  const timestamp = Date.now();

  beforeAll(async () => {
    const email = `mentor${timestamp}@test.com`;
    const phone = `07123456${timestamp % 1000}`;
    
    // Register a test user
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Mentorship User',
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
    userToken = res.body.data.accessToken;
  });

  describe('GET /api/mentorship/me', () => {
    it('should get user mentorship requests', async () => {
      const res = await request(app)
        .get('/api/mentorship/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('asMentee');
      expect(res.body.data).toHaveProperty('asMentor');
    });
  });
});