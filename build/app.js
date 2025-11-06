import { randomUUID } from 'node:crypto';
import { fastifyHeaderPlugin } from '@amedia/atomizer-header';
import { HealthMonitor, healthMonitorPlugin } from '@amedia/health-monitor';
import { MetricsClient, metricsPlugin } from '@amedia/metrics';
import { fastifyCors } from '@fastify/cors';
import { fastifyEtag } from '@fastify/etag';
import Fastify from 'fastify';
import { extendedLogger } from './logger.js';
import { requestLogger } from './plugins/request-logger.js';
import { config } from './config/config.js';
import { createRouter } from './routes/router.js';
import { createHelloService } from './services/hello-service.js';
const { appName, contextPath, basePath, metrics } = config.getProperties();
/**
 * Builds and configures the Fastify application with all plugins and routes
 */
export async function buildApp({ healthMonitor = new HealthMonitor(), metricsClient = new MetricsClient() } = {}) {
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
    fastify.get(`${contextPath}/apiadmin/ping`, {
        schema: {
            hide: true,
        },
    }, () => 'OK');
    fastify.register(requestLogger);
    const helloService = createHelloService();
    const router = async (fastify) => createRouter({ fastify, helloService });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBRXpDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBRSxhQUFhLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM1RSxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLE9BQWlDLE1BQU0sU0FBUyxDQUFDO0FBRXhELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDN0MsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFakUsTUFBTSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQWEzRTs7R0FFRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsUUFBUSxDQUM1QixFQUFFLGFBQWEsR0FBRyxJQUFJLGFBQWEsRUFBRSxFQUFFLGFBQWEsR0FBRyxJQUFJLGFBQWEsRUFBRSxLQUFxQixFQUFFO0lBRWpHLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN0QixNQUFNLEVBQUUsS0FBSztRQUNiLHFCQUFxQixFQUFFLElBQUk7UUFD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