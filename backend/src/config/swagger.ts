import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Delivery App',
      version: '1.0.0',
      description: 'Documentação da API para o sistema de delivery (iFood/Uber Eats clone).',
    },
    servers: [{ url: 'http://localhost:3333' }],
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
  apis: ['./src/routes/*.ts'], // Futuramente você pode mapear e detalhar as rotas aqui
};

export const setupSwagger = (app: Application) => {
  const swaggerSpec = swaggerJSDoc(options);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};