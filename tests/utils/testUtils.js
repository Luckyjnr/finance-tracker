const jwt = require('jsonwebtoken');
const User = require('../../models/user');

const generateTestToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    accountType: 'savings',
    password: 'password123',
    balance: 1000
  };

  const user = await User.create({ ...defaultUser, ...userData });
  const token = generateTestToken(user._id);
  
  return { user, token };
};

module.exports = {
  generateTestToken,
  createTestUser
};
