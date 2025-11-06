import { fastifyPlugins } from '@amedia/node-log';
import { config } from '../config/config.js';
import { extendedLogger } from '../logger.js';
const { logging: { requestLog }, } = config.getProperties();
/**
 * Configures request logging for the application
 */
export const requestLogger = fastifyPlugins.requestLoggerPlugin({
    extendedLogger,
    httpAccessLogLevel: requestLog,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC1sb2dnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9yZXF1ZXN0LWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFbEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFOUMsTUFBTSxFQUNKLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxHQUN4QixHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUUzQjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsbUJBQW1CLENBQUM7SUFDOUQsY0FBYztJQUNkLGtCQUFrQixFQUFFLFVBQWdGO0lBQ3BHLE9BQU8sRUFBRSxJQUFJO0lBQ2IsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDcEIsT0FBTztZQUNMLGFBQWEsRUFBRSxPQUFPLENBQUMsTUFBTTtZQUM3QixVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUc7WUFDdkIsY0FBYyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1lBQy9CLFlBQVksRUFBRSxPQUFPLENBQUMsS0FBSztZQUMzQixXQUFXLEVBQUUsT0FBTyxDQUFDLElBQUk7U0FDMUIsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFDLENBQUMifQ==