const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('../config');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RESTful Note API',
      version: '1.0.0',
      description: 'A flexible note-taking API with both stateless and stateful authentication',
      contact: {
        name: 'API Support',
        url: 'https://github.com/jimmyu2foru18/restful-note-api',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'API endpoints for user authentication',
      },
      {
        name: 'Notes',
        description: 'API endpoints for managing notes',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerSetup = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger documentation available at /api-docs`);
};

module.exports = swaggerSetup;