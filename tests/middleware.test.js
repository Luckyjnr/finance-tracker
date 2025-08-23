const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { createTestUser } = require('./utils/testUtils');

describe('Auth Middleware', () => {
  describe('Protected Routes', () => {
    it('should allow access with valid token', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });

    it('should deny access with invalid token format', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer invalidtoken123')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, token failed');
    });

    it('should deny access with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.message).toBe('Not authorized, token failed');
    });

    it('should deny access with non-existent user ID in token', async () => {
      const fakeUserToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${fakeUserToken}`)
        .expect(401);

      expect(response.body.message).toBe('Not authorized, user not found');
    });
  });

  describe('Public Routes', () => {
    it('should allow access to health check without token', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toBe('Finance Tracker API is running...');
    });

    it('should allow access to auth routes without token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        accountType: 'savings',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
    });
  });
});
