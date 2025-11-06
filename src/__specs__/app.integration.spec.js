import { describe, test, expect } from 'vitest';

import { config } from '../config/config.js';
import { buildApp } from '../app.js';

const { basePath, contextPath } = config.getProperties();

const it = test.extend({
  app: async ({ annotate }, use) => {
    annotate('App integration tests');

    const { app } = await buildApp();

    await use(app);

    await app.close();
  },
});

describe('app', () => {
  describe('GET /non-existing', () => {
    it('should return 404', async ({ app }) => {
      const res = await app.inject({
        url: `${basePath}/non-existing`,
      });

      expect(res.statusCode).toStrictEqual(404);
    });
  });

  describe('GET /hello', () => {
    it('should return 200', async ({ app }) => {
      const res = await app.inject({
        url: `${basePath}/hello?name=world`,
      });
      expect(res.statusCode).toStrictEqual(200);
    });
  });

  describe('etag', () => {
    const itExtended = it.extend({
      res: async ({ app }, use) => {
        const response = await app.inject({
          url: basePath,
        });
        await use(response);
      },
    });

    itExtended('header includes etag', async ({ res }) => {
      expect(Object.keys(res.headers)).toContain('etag');
    });

    itExtended('using weak etag', async ({ res }) => {
      expect(res.headers.etag).match(/^W\/".+"$/);
    });
  });

  describe('Requests for liveness', () => {
    it('should return 200', async ({ app }) => {
      const res = await app.inject({
        method: 'GET',
        url: `${contextPath}/apiadmin/ping`,
      });

      expect(res.statusCode).toStrictEqual(200);
    });
  });
});
