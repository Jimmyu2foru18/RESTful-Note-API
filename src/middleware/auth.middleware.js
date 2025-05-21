const jwt = require('jsonwebtoken');
const session = require('express-session');
const config = require('../config');
const { getUserById } = require('../services/user.service');
const jwtAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.auth.jwt.secret);
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    next(error);
  }
};

const sessionAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }
  req.user = req.session.user;
  next();
};

const configure = (app) => {
  if (config.auth.mode === 'stateful') {
    app.use(session(config.auth.session));
    console.log('Configured stateful authentication with sessions');
  } else {
    console.log('Configured stateless authentication with JWT');
  }
};

const getAuthMiddleware = () => {
  return config.auth.mode === 'stateful' ? sessionAuth : jwtAuth;
};

module.exports = {
  configure,
  protect: getAuthMiddleware(),
  jwtAuth,
  sessionAuth
};