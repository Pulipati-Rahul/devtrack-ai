export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const HEADERS = {
  REQUEST_ID: 'x-request-id',
  RETRY_AFTER: 'retry-after',
} as const;

export const LIMITS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MAX_REQUEST_SIZE: '10mb',
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // Limit each IP to 100 requests per window
} as const;

export const MESSAGES = {
  SUCCESS: 'Success',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  BAD_REQUEST: 'Bad Request. The request parameters are invalid.',
  UNAUTHORIZED: 'Unauthorized. Please authenticate to access this resource.',
  FORBIDDEN: 'Forbidden. You do not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  CONFLICT: 'Conflict. The resource already exists or has state conflicts.',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  INTERNAL_SERVER_ERROR: 'Internal Server Error. An unexpected error occurred.',
} as const;

export const ROUTES = {
  API_V1_PREFIX: '/api/v1',
  HEALTH: '/health',
  AUTH: '/auth',
} as const;
