const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// openapi.yaml 로드
const swaggerDocument = YAML.load(
  path.join(__dirname, 'openapi.yaml')
);

// 함수로 export (app에 붙이기 쉽게)
module.exports = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  console.log('Swagger UI: http://localhost:3000/docs');
};