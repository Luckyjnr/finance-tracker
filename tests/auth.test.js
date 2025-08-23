const request = require('supertest');
const app = require('../app');
const User = require('../models/user');
const { createTestUser } = require('./utils/testUtils');

describe('Auth Routes', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        accountType: 'savings',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('token');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.accountType).toBe(userData.accountType);
      expect(response.body).not.toHaveProperty('password');
      expect(response.body.balance).toBe(0);
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        accountType: 'current',
        password: 'password123'
      };

      // Create first user
      await request(app).post('/api/auth/signup').send(userData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });

    it('should return 400 for invalid account type', async () => {
      const userData = {
        name: 'Invalid User',
        email: 'invalid@example.com',
        accountType: 'invalid',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const { user } = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe(user.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const { user } = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
