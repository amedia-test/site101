import { randomUUID } from 'node:crypto';

import { fastifyHeaderPlugin } from '@amedia/atomizer-header';
import { HealthMonitor, healthMonitorPlugin } from '@amedia/health-monitor';
import { MetricsClient, metricsPlugin } from '@amedia/metrics';
import { fastifyCors } from '@fastify/cors';
import { fastifyEtag } from '@fastify/etag';
import Fastify, { type FastifyInstance } from 'fastify';

import { extendedLogger } from './logger.js';
import { requestLogger } from './plugins/request-logger.js';
import { config } from './config/config.js';
import { createRouter } from './routes/router.js';
import { createHelloService } from './services/hello-service.js';

const { appName, contextPath, basePath, metrics } = config.getProperties();

interface BuildAppParams {
  healthMonitor?: HealthMonitor;
  metricsClient?: MetricsClient;
}

interface BuildAppResult {
  app: FastifyInstance;
  healthMonitor: HealthMonitor;
  metricsClient: MetricsClient;
}

/**
 * Builds and configures the Fastify application with all plugins and routes
 */
export async function buildApp(
  { healthMonitor = new HealthMonitor(), metricsClient = new MetricsClient() }: BuildAppParams = {}
): Promise<BuildAppResult> {
  const fastify = Fastify({
    logger: false,
    disableRequestLogging: true,
    genReqId(req) {
      const existingId = req.headers['x-request-id'];
      return existingId ? String(existingId) : randomUUID();
    },
    routerOptions: {
      // Increase the maximum parameter length to handle longer values. Default is 100 if not set.
      maxParamLength: 200,
      /*
       * Enables uniform handling of URLs with or without trailing
       * slashes, mitigating routing discrepancies during the Express to
       * Fastify migration.
       */
      ignoreTrailingSlash: true,
    },
  });

  fastify.register(fastifyEtag, {
    weak: true,
  });

  /*
   * metrics collection is opt-in through app configuration
   * @see src/config.js
   */
  if (metrics) {
    fastify.register(metricsPlugin, {
      client: metricsClient,
    });
  }

  fastify.register(fastifyHeaderPlugin, {
    serverName: appName,
    appName,
  });

  /**
   * Health monitor hijacks the onRequest hook which causes issues with
   * other plugins that also use this hook (like the header plugin).
   * To ensure proper hook order, the health monitor plugin must be
   * registered after the header plugin.
   */
  fastify.register(healthMonitorPlugin, {
    healthMonitor,
  });

  fastify.register(fastifyCors, { hook: 'preHandler' });

  fastify.addHook('preHandler', (_, reply, done) => {
    reply.headerManager.addLocalGroup(`/${appName}`);

    done();
  });

  fastify.get(
    `${contextPath}/apiadmin/ping`,
    {
      schema: {
        hide: true,
      } as any,
    },
    () => 'OK'
  );

  fastify.register(requestLogger);

  const helloService = createHelloService();

  const router = async (fastify: FastifyInstance) => createRouter({ fastify, helloService });

  fastify.register(router, { prefix: basePath });

  // Error handling
  fastify.setErrorHandler((error, _, reply) => {
    const logger = extendedLogger();
    if (error.statusCode) {
      logger[error.statusCode >= 500 ? 'error' : 'warn'](error);
      return reply.status(error.statusCode).send(error.message);
    }
    logger.error(error);
    reply.headerManager.setLocalChannelMaxAge(15);
    return reply.status(500).send('Internal server error');
  });

  return {
    app: fastify,
    healthMonitor,
    metricsClient,
  };
}
