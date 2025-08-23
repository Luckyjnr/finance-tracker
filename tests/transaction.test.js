const request = require('supertest');
const app = require('../app');
const Transaction = require('../models/Transaction');
const User = require('../models/user');
const { createTestUser } = require('./utils/testUtils');

describe('Transaction Routes', () => {
  let authToken, testUser;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    testUser = user;
  });

  describe('POST /api/transactions', () => {
    it('should create a credit transaction successfully', async () => {
      const transactionData = {
        amount: 500,
        type: 'credit',
        description: 'Salary payment'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.amount).toBe(transactionData.amount);
      expect(response.body.type).toBe(transactionData.type);
      expect(response.body.description).toBe(transactionData.description);
      expect(response.body.user).toBe(testUser._id.toString());

      // Check if user balance was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.balance).toBe(1500); // 1000 + 500
    });

    it('should create a debit transaction successfully', async () => {
      const transactionData = {
        amount: 200,
        type: 'debit',
        description: 'Grocery shopping'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body.type).toBe(transactionData.type);

      // Check if user balance was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.balance).toBe(800); // 1000 - 200
    });

    it('should return 400 if amount is missing', async () => {
      const transactionData = {
        type: 'credit',
        description: 'Test transaction'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(400);

      expect(response.body.message).toBe('Amount and type are required');
    });

    it('should return 400 if type is missing', async () => {
      const transactionData = {
        amount: 100,
        description: 'Test transaction'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(400);

      expect(response.body.message).toBe('Amount and type are required');
    });
  });

  describe('GET /api/transactions', () => {
    beforeEach(async () => {
      // Create some test transactions
      await Transaction.create([
        { user: testUser._id, amount: 100, type: 'credit', description: 'Income 1' },
        { user: testUser._id, amount: 200, type: 'credit', description: 'Income 2' },
        { user: testUser._id, amount: 50, type: 'debit', description: 'Expense 1' }
      ]);
    });

    it('should get all transactions for authenticated user', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('total');
      expect(response.body.transactions).toHaveLength(3);
    });

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/transactions?type=credit')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.transactions.every(t => t.type === 'credit')).toBe(true);
    });

    it('should paginate results correctly', async () => {
      const response = await request(app)
        .get('/api/transactions?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.page).toBe(1);
      expect(response.body.totalPages).toBe(2);
    });
  });

  describe('GET /api/transactions/:id', () => {
    let testTransaction;

    beforeEach(async () => {
      testTransaction = await Transaction.create({
        user: testUser._id,
        amount: 150,
        type: 'credit',
        description: 'Test transaction'
      });
    });

    it('should get transaction by ID', async () => {
      const response = await request(app)
        .get(`/api/transactions/${testTransaction._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body._id).toBe(testTransaction._id.toString());
      expect(response.body.amount).toBe(testTransaction.amount);
    });

    it('should return 404 for non-existent transaction', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/transactions/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('Transaction not found');
    });
  });

  describe('PUT /api/transactions/:id', () => {
    let testTransaction;

    beforeEach(async () => {
      testTransaction = await Transaction.create({
        user: testUser._id,
        amount: 100,
        type: 'credit',
        description: 'Original description'
      });
    });

    it('should update transaction successfully', async () => {
      const updateData = {
        amount: 200,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/transactions/${testTransaction._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.amount).toBe(updateData.amount);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.type).toBe(testTransaction.type); // Should remain unchanged
    });

    it('should update user balance correctly when amount changes', async () => {
      const originalBalance = testUser.balance;
      const updateData = { amount: 200 };

      await request(app)
        .put(`/api/transactions/${testTransaction._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      const updatedUser = await User.findById(testUser._id);
      // Balance should be: original + (new amount - old amount)
      const expectedBalance = originalBalance + (200 - 100);
      expect(updatedUser.balance).toBe(expectedBalance);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    let testTransaction;

    beforeEach(async () => {
      testTransaction = await Transaction.create({
        user: testUser._id,
        amount: 100,
        type: 'credit',
        description: 'To be deleted'
      });
    });

    it('should delete transaction successfully', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${testTransaction._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Transaction deleted');

      // Verify transaction is deleted
      const deletedTransaction = await Transaction.findById(testTransaction._id);
      expect(deletedTransaction).toBeNull();
    });

    it('should update user balance correctly when deleting', async () => {
      const originalBalance = testUser.balance;

      await request(app)
        .delete(`/api/transactions/${testTransaction._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const updatedUser = await User.findById(testUser._id);
      // Balance should be: original - transaction amount (since it was credit)
      const expectedBalance = originalBalance - 100;
      expect(updatedUser.balance).toBe(expectedBalance);
    });
  });
});
