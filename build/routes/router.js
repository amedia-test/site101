/**
 * Creates and configures application routes
 */
export async function createRouter({ fastify, helloService, siteConfigService }) {
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
            const query = request.query;
            let result = {
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
            const { name } = request.query;
            await reply.send(helloService.hello(name));
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JvdXRlcy9yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBWUE7O0dBRUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLFlBQVksQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQWdCO0lBQzNGLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDWixNQUFNLEVBQUUsS0FBSztRQUNiLEdBQUcsRUFBRSxHQUFHO1FBQ1IsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDaEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDO1lBRS9DLDREQUE0RDtZQUM1RCxNQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVqRSxNQUFNLFFBQVEsR0FBRyxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxjQUFjLENBQUM7WUFDMUQsTUFBTSxPQUFPLEdBQUcsVUFBVSxFQUFFLEdBQUcsSUFBSSxXQUFXLENBQUM7WUFDL0MsTUFBTSxVQUFVLEdBQUcsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLElBQUksV0FBVyxDQUFDO1lBRTVELEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDOzs7Ozs7cUJBTUgsUUFBUTs7Ozs7Ozs7Ozs7O3FDQVlRLFFBQVE7b0NBQ1QsT0FBTzt1Q0FDSixVQUFVO3dDQUNULElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BdUJyQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUNaLE1BQU0sRUFBRSxLQUFLO1FBQ2IsR0FBRyxFQUFFLGFBQWE7UUFDbEIsT0FB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