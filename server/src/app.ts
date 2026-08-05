import express from 'express';
import { env } from './config/env';
import { Logger } from './utils/logger';
import { requestLogger } from './middleware/request-logger';
import { requestId } from './middleware/request-id';
import { errorHandler } from './middleware/error';
import { configureSecurity, configureBodyParsers } from './middleware/security';
import { configureSwagger } from './docs/swagger';
import v1Router from './routes/v1';
import { ROUTES } from './constants/api-constants';

import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth/auth';

const app = express();
const port = env.PORT;

// 1. Attach Request IDs first for request trace logging
app.use(requestId);

// 2. Configure HTTP Security headers, CORS, Cookie parser, and Compression
configureSecurity(app);

// 3. Catch-all route for Better Auth (runs BEFORE body parsing)
app.all('/api/auth/*', toNodeHandler(auth));

// 4. Configure Express body parsing size limits
configureBodyParsers(app);

// 5. Mount Request performance logger
app.use(requestLogger);

// 6. Configure OpenAPI Swagger documentation interface
configureSwagger(app);

// 7. Mount health and modular routers under /api/v1 version namespace
app.use(ROUTES.API_V1_PREFIX, v1Router);

// 8. Backward compatibility route matching legacy endpoints
app.use('/api/health', v1Router);

// 9. Centralized Error Boundary Middleware
app.use(errorHandler);

if (env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    Logger.info(`Server is running on port ${port}`);
  });
}

export default app;
