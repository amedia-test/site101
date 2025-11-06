import type { FastifyInstance } from 'fastify';

interface HelloQuery {
  name: string;
}

interface RouterParams {
  fastify: FastifyInstance;
  helloService: ReturnType<typeof import('../services/hello-service.js').createHelloService>;
  siteConfigService: ReturnType<typeof import('../services/site-config-service.js').createSiteConfigService>;
}

/**
 * Creates and configures application routes
 */
export async function createRouter({ fastify, helloService, siteConfigService }: RouterParams) {
  fastify.route({
    method: 'GET',
    url: '/',
    handler: async (request, reply) => {
      const host = request.headers.host || 'unknown';

      // Get site config from request (query param or host header)
      const siteConfig = siteConfigService.getSiteFromRequest(request);

      const siteName = siteConfig?.name?.full || 'Unknown Site';
      const siteKey = siteConfig?.key || 'not found';
      const siteDomain = siteConfig?.domains?.main || 'not found';

      reply.type('text/html');
      return reply.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site101 - ${siteName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    .site-info { background: #f0f0f0; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    .site-info strong { color: #0066cc; }
    code { background: #e0e0e0; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Welcome to Site101</h1>
  <div class="site-info">
    <h2>Current Site Information</h2>
    <p><strong>Site Name:</strong> ${siteName}</p>
    <p><strong>Site Key:</strong> ${siteKey}</p>
    <p><strong>Main Domain:</strong> ${siteDomain}</p>
    <p><strong>Request Host:</strong> ${host}</p>
  </div>

  <h2>Try Different Sites</h2>
  <p>This component shows different content based on site configuration.</p>

  <h3>By Query Parameter (takes priority):</h3>
  <ul>
    <li><a href="http://[::]:8080/api/site101/v1?siteKey=opplan">?siteKey=opplan</a> (Oppland Arbeiderblad)</li>
    <li><a href="http://[::]:8080/api/site101/v1?siteKey=bergen">?siteKey=bergen</a> (Bergensavisen)</li>
    <li><a href="http://[::]:8080/api/site101/v1?siteKey=bt__dk">?siteKey=bt__dk</a> (BT)</li>
  </ul>

  <h3>By Host Header (like Maelstrom):</h3>
  <ul>
    <li><a href="http://www.op.no.localhost.api.no:8080/api/site101/v1/">www.op.no.localhost.api.no</a></li>
    <li><a href="http://www.ba.no.localhost.api.no:8080/api/site101/v1/">www.ba.no.localhost.api.no</a></li>
    <li><a href="http://www.indre.no.localhost.api.no:8080/api/site101/v1/">www.indre.no.localhost.api.no</a></li>
  </ul>

  <p><small>Note: Query parameter <code>siteKey</code> takes precedence over Host header.</small></p>
</body>
</html>
      `);
    },
  });

  fastify.route({
    method: 'GET',
    url: '/debug/site',
    handler: async (request, reply) => {
      const query = request.query as { domain?: string; siteKey?: string };

      let result: any = {
        requestHost: request.headers.host,
      };

      if (query.domain) {
        const config = siteConfigService.getSiteConfig(query.domain) ||
                      siteConfigService.getSiteKey(query.domain);
        result.lookupByDomain = {
          input: query.domain,
          result: config || 'not found',
        };
      }

      if (query.siteKey) {
        const config = siteConfigService.getSiteConfig(query.siteKey);
        result.lookupBySiteKey = {
          input: query.siteKey,
          result: config || 'not found',
        };
      }

      const fromRequest = siteConfigService.getSiteFromRequest(request);
      result.fromRequest = fromRequest || 'not found';

      reply.type('application/json');
      return reply.send(result);
    },
  });

  fastify.route({
    method: 'GET',
    url: '/hello',
    schema: {
      querystring: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      },
      response: {
        200: {
          type: 'string',
        },
      },
    },
    handler: async (request, reply) => {
      const { headerManager } = reply;
      headerManager.setLocalMaxAge(10); // browser cache
      headerManager.setLocalChannelMaxAge(10); // varnish cache
      const { name } = request.query as HelloQuery;
      await reply.send(helloService.hello(name));
    },
  });
}
