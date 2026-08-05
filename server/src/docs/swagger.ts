import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { ROUTES } from '../constants/api-constants';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevTrack AI API Documentation',
      version: '1.0.0',
      description: 'API documentation for DevTrack AI career management SaaS backend application.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session_token',
        },
      },
    },
  },
  // Parse route files for swagger JSDoc decorators
  apis: ['./src/routes/**/*.ts', './dist/routes/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export function configureSwagger(app: Express) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(`${ROUTES.API_V1_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
export { swaggerSpec };
