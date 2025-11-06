/**
 * Creates and configures application routes
 */
export async function createRouter({ fastify, helloService }) {
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
  <li>siteKey - <a href="http://${host}/?site=site101">?site=84</a></li>
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
            const { name } = request.query;
            await reply.send(helloService.hello(name));
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JvdXRlcy9yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBV0E7O0dBRUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLFlBQVksQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQWdCO0lBQ3hFLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDWixNQUFNLEVBQUUsS0FBSztRQUNiLEdBQUcsRUFBRSxHQUFHO1FBQ1IsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDaEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDO1lBQy9DLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDOzs7Ozs7Ozs7NEJBU0ksSUFBSTs7Ozs7a0NBS0UsSUFBSTs7Ozs7Ozs7O09BUy9CLENBQUMsQ0FBQztRQUNMLENBQUM7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ1osTUFBTSxFQUFFLEtBQUs7UUFDYixHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRTtZQUNOLFdBQVcsRUFBRTtnQkFDWCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtpQkFDekI7Z0JBQ0QsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO2FBQ25CO1lBQ0QsUUFBUSxFQUFFO2dCQUNSLEdBQUcsRUFBRTtvQkFDSCxJQUFJLEVBQUUsUUFBUTtpQkFDZjthQUNGO1NBQ0Y7UUFDRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNoQyxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsS0FBSyxDQUFDO1lBQ2hDLGFBQWEsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0I7WUFDbEQsYUFBYSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCO1lBQ3pELE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsS0FBbUIsQ0FBQztZQUM3QyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdDLENBQUM7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDIn0=