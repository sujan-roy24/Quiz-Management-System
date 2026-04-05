const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Go two levels up from config folder to reach backend root
const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));

const swaggerSetup = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('✅ Swagger docs available at http://localhost:5000/api-docs');
};

module.exports = swaggerSetup;