const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quiz Management API',
      version: '1.0.0',
      description: 'API documentation for the Quiz Management System',
    },
    servers: [
      {
        url: 'http://localhost:5000',
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
  },
  apis: ['./swagger-definitions.js'], // all endpoints defined here
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;