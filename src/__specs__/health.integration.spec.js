import { describe, test, expect } from 'vitest';
import { HealthProbe } from '@amedia/health-monitor';

import { config } from '../config/config.js';
import { buildApp } from '../app.js';

const { contextPath } = config.getProperties();

/** @type {import("vitest").TestAPI<{ ctx: { app: import("fastify").FastifyInstance, hm: import("@amedia/health-monitor").HealthMonitor, probe: import("@amedia/health-monitor").HealthProbe } }>} */
const it = test.extend({
  ctx: async ({ annotate }, use) => {
    annotate('Health and HealthMonitor integration tests');

    const { app, healthMonitor: hm } = await buildApp();
    const probe = new HealthProbe('Test Probe');

    hm.addProbe(probe);

    await app.ready();

    await use({ app, hm, probe });

    await app.close();
  },
});

describe('Health and HealthMonitor', () => {
  describe('Returned Health Monitor', () => {
    it('should return expected system states using strict equality', ({
      ctx: { hm },
    }) => {
      const status = hm.getStatus();

      expect(status).toStrictEqual({
        details: [],
        isShuttingDown: false,
        status: 1,
      });
    });

    it('should handle shutdown state correctly', ({ ctx: { hm } }) => {
      // Use our test health monitor instance
      hm.prepareForShutdown();
      const status = hm.getStatus();

      expect(status).toStrictEqual({
        details: ['Shutting down'],
        isShuttingDown: true,
        status: 6,
      });
      expect(hm.getIsSystemReady(status)).toBe(false);
    });
  });

  describe('GET /livez', () => {
    it('should return 200 with OK status', async ({ ctx: { app } }) => {
      const res = await app.inject({
        method: 'GET',
        url: '/livez',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBe('OK');
    });
  });

  describe('GET /readyz', () => {
    it('should return 200 when system is ready', async ({ ctx: { app } }) => {
      const res = await app.inject({
        method: 'GET',
        url: '/readyz',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBe('ready');
    });

    it('should return 500 when system is in shutdown state', async ({
      ctx: { app, hm },
    }) => {
      hm.prepareForShutdown();

      const res = await app.inject({
        method: 'GET',
        url: '/readyz',
      });

      expect(res.statusCode).toBe(500);
      expect(res.body).toContain('Shutting down');
    });
  });

  describe('GET /healthz', () => {
    it('should return 200 with health status object', async ({
      ctx: { app },
    }) => {
      const res = await app.inject({
        method: 'GET',
        url: '/healthz',
      });

      expect(res.statusCode).toBe(200);

      expect(JSON.parse(res.body)).toStrictEqual({
        status: 1,
        details: [],
        isShuttingDown: false,
      });
    });

    it('should report on health probe status', async ({
      ctx: { app, probe },
    }) => {
      probe.mark();

      const res = await app.inject({
        method: 'GET',
        url: '/healthz',
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toStrictEqual({
        status: 2,
        details: ['Test Probe had 1 errors (warn threshold=5)'],
        isShuttingDown: false,
      });
    });

    it('should report unhealthy when a probe is marked several times (>11)', async ({
      ctx: { app, probe },
    }) => {
      for (let i = 0; i < 11; i++) {
        probe.mark();
      }

      await app.ready();

      const res = await app.inject({
        method: 'GET',
        url: '/healthz',
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toStrictEqual({
        status: 4,
        details: ['Test Probe had 11 errors (error threshold=10)'],
        isShuttingDown: false,
      });
    });
  });

  describe('GET /apiadmin/ping', () => {
    it('should return 200 with OK status', async ({ ctx: { app } }) => {
      const res = await app.inject({
        method: 'GET',
        url: `${contextPath}/apiadmin/ping`,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBe('OK');
    });
  });
});
