import type { FastifyInstance } from 'fastify';

interface HelloQuery {
  name: string;
}

interface RouterParams {
  fastify: FastifyInstance;
  helloService: ReturnType<typeof import('../services/hello-service.js').createHelloService>;
}

/**
 * Creates and configures application routes
 */
export async function createRouter({ fastify, helloService }: RouterParams) {
  fastify.route({
    method: 'GET',
    url: '/',
    handler: async (request, reply) => {
      const host = request.headers.host || 'unknown';
      reply.type('text/html');
      return reply.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site101</title>
</head>
<body>
  <h1>Welcome to Site101 (${host})</h1>
  <p>This is a simple fake component. That should show different content based on one of these strategies:
  
  <p>By query parameter:</p>
  <ul>
  <li>siteKey - <a href="http://${host}/?site=site101">?siteKey=84</a></li>
  </ul>
  <p>By host (like Maelstrom)</p>
  <ul>
  <li><a href="http://www.oa.no.localhost.api.no:8080/api/site101/v1/">www.oa.no.localhost.api.no</a></li>
  <li><a href="http://www.ba.no.localhost.api.no:8080/api/site101/v1/">www.ba.no.localhost.api.no</a></li>
  </ul>
</body>
</html>
      `);
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
