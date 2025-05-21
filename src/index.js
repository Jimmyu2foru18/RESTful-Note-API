require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const authRoutes = require('./routes/auth.routes');
const noteRoutes = require('./routes/note.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const authMiddleware = require('./middleware/auth.middleware');
authMiddleware.configure(app);

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

const swaggerSetup = require('./utils/swagger');
swaggerSetup(app);

app.get('/', (req, res) => {
  res.json({
    message: 'RESTful Note API',
    version: '1.0.0',
    authMode: config.auth.mode,
    storageType: config.storage.type
  });
});

app.use(errorHandler);

const PORT = process.env.NODE_ENV === 'test' ? 0 : (config.server.port || 3000);
let server;

if (require.main === module) {
  server = app.listen(PORT, () => {
    const actualPort = server.address().port;
    console.log(`Server running in ${config.server.env} mode on port ${actualPort}`);
    console.log(`Authentication mode: ${config.auth.mode}`);
    console.log(`Storage type: ${config.storage.type}`);
  });
}

module.exports = app;
module.exports.server = server;

module.exports.startServer = async () => {
  return new Promise((resolve, reject) => {
    server = app.listen(0, () => {
      resolve(server);
    }).on('error', reject);
  });
};