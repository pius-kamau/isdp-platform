const request = require('supertest');
const app = require('../src/server');

describe('Users Endpoints', () => {
  let adminToken = '';
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

  describe('GET /api/users', () => {
    it('should get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should not get users without token', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID', async () => {
      const usersRes = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const user = usersRes.body.data[0];
      if (user) {
        const res = await request(app)
          .get(`/api/users/${user.id}`)
          .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('id');
      }
    });
  });
});