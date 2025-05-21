const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { createUser, authenticateUser } = require('../services/user.service');
const { ApiError } = require('../middleware/error.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or username already exists
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw ApiError.badRequest('Username and password are required');
    }
    
    if (password.length < 6) {
      throw ApiError.badRequest('Password must be at least 6 characters long');
    }

    const user = await createUser(username, password);
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: user.id,
      username: user.username
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and receive token/session
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw ApiError.badRequest('Username and password are required');
    }

    const user = await authenticateUser(username, password);
    if (config.auth.mode === 'stateful') {
      req.session.user = user;
      
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username
        }
      });
    } else {
      const token = jwt.sign(
        { userId: user.id },
        config.auth.jwt.secret,
        { expiresIn: config.auth.jwt.expiresIn }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (stateful mode only)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Not applicable in stateless mode
 */
router.post('/logout', (req, res) => {
  if (config.auth.mode === 'stateful' && req.session) {
    // Destroy session for stateful auth
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  } else {
    res.json({
      message: 'Logout successful on client side. For stateless authentication, please discard the token on the client.'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *       401:
 *         description: Not authenticated
 */
router.get('/me', require('../middleware/auth.middleware').protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;