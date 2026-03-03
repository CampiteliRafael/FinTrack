import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Load OpenAPI spec from YAML file
const swaggerDocument = YAML.load(path.join(__dirname, '../../docs/openapi.yaml'));

// Swagger UI options
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3B82F6; }
    .swagger-ui .scheme-container { background: #F9FAFB; }
  `,
  customSiteTitle: 'FinTrack API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true, // Persist authorization data between page reloads
    displayRequestDuration: true, // Display request duration
    filter: true, // Enable filtering by tags
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
  },
};

export { swaggerUi, swaggerDocument, swaggerOptions };
