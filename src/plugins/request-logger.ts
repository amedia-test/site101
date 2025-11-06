import { fastifyPlugins } from '@amedia/node-log';

import { config } from '../config/config.js';
import { extendedLogger } from '../logger.js';

const {
  logging: { requestLog },
} = config.getProperties();

/**
 * Configures request logging for the application
 */
export const requestLogger = fastifyPlugins.requestLoggerPlugin({
  extendedLogger,
  httpAccessLogLevel: requestLog as 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent',
  logBody: true,
  metadata: (request) => {
    return {
      requestMethod: request.method,
      requestUrl: request.url,
      requestHeaders: request.headers,
      requestQuery: request.query,
      requestBody: request.body,
    };
  },
});
