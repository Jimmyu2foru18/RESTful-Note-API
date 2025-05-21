module.exports = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  auth: {
    mode: process.env.AUTH_MODE || 'stateless',
    jwt: {
      secret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
      expiresIn: parseInt(process.env.JWT_EXPIRATION) || 86400
    },
    session: {
      secret: process.env.SESSION_SECRET || 'default_session_secret_change_in_production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      }
    }
  },
  storage: {
    type: process.env.STORAGE_TYPE || 'memory',
    sqlite: {
      path: process.env.DB_PATH || './data/database.sqlite'
    },
    mongodb: {
      uri: process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/notes-api'
    }
  }
};