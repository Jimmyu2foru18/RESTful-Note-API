const User = require('../models/user.model');
const storage = require('./storage');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Create a new user
 * @param {string} username - The username
 * @param {string} password - The password 
 * @returns {Promise<User>} The created user object
 */
async function createUser(username, password) {
  // Check if username already exists
  const existingUser = await storage.getUserByUsername(username);
  if (existingUser) {
    throw ApiError.badRequest('Username already exists');
  }

  const user = await User.create(username, password);
  await storage.saveUser(user);
  
  return user;
}

/**
 * Authenticate a user
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<User>} The authenticated user 
 */
async function authenticateUser(username, password) {
  const user = await storage.getUserByUsername(username);
  if (!user) {
    throw ApiError.unauthorized('Invalid username or password');
  }
  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid username or password');
  }

  return user;
}

/**
 * Get user by ID
 * @param {string} id - The user ID
 * @returns {Promise<User>} The user object
 */
async function getUserById(id) {
  return storage.getUserById(id);
}

module.exports = {
  createUser,
  authenticateUser,
  getUserById
};