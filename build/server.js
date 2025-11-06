#!/usr/bin/env node
import { buildApp } from './app.js';
import { config } from './config/config.js';
import { extendedLogger } from './logger.js';
const { port, host, basePath, gracefulShutdown } = config.getProperties();
async function init() {
    const { app, healthMonitor } = await buildApp();
    const logger = extendedLogger();
    const address = host.includes(':') ? `[${host}]` : `${host}`;
    app.listen({
        host,
        port,
    }, () => {
        logger.info(`server process has pid ${process.pid}`);
        logger.info(`api routes available under http://${address}:${port}${basePath}`);
    });
    /**
     * Perform a controlled shutdown of your app.
     * This base implementation is very crude - only delaying a couple of seconds,
     * but this delay alone all but guaranties that any pending requests have been served.
     *
     * If you have longer running tasks, you should consider implementing mechanics
     * to wait for them to complete. Or even better; extract them to a cronjob if possible.
     */
    function shutdown(code) {
        healthMonitor.prepareForShutdown();
        setTimeout(() => {
            app.server.close();
            process.nextTick(() => {
                process.exit(code);
            });
        }, gracefulShutdown ? 2000 : 0);
    }
    // Catch uncaught exceptions, log it and take down server in a nice way.
    // Upstart or forever should handle kicking the process back into life!
    process.on('uncaughtException', (error) => {
        logger.error(error, 'shutdown - server taken down by force due to an uncaught exception');
        shutdown(1);
    });
    process.on('SIGINT', () => {
        logger.info('shutdown - got SIGINT - taking down the server gracefully');
        shutdown(0);
    });
    process.on('SIGTERM', () => {
        logger.info('shutdown - got SIGTERM - taking down the server gracefully');
        shutdown(0);
    });
}
init();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNwQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDNUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUU3QyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7QUFFMUUsS0FBSyxVQUFVLElBQUk7SUFDakIsTUFBTSxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsR0FBRyxNQUFNLFFBQVEsRUFBRSxDQUFDO0lBQ2hELE1BQU0sTUFBTSxHQUFHLGNBQWMsRUFBRSxDQUFDO0lBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUM7SUFFN0QsR0FBRyxDQUFDLE1BQU0sQ0FDUjtRQUNFLElBQUk7UUFDSixJQUFJO0tBQ0wsRUFDRCxHQUFHLEVBQUU7UUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsSUFBSSxDQUNULHFDQUFxQyxPQUFPLElBQUksSUFBSSxHQUFHLFFBQVEsRUFBRSxDQUNsRSxDQUFDO0lBQ0osQ0FBQyxDQUNGLENBQUM7SUFFRjs7Ozs7OztPQU9HO0lBQ0gsU0FBUyxRQUFRLENBQUMsSUFBWTtRQUM1QixhQUFhLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNuQyxVQUFVLENBQ1IsR0FBRyxFQUFFO1lBQ0gsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuQixPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtnQkFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsRUFDRCxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzVCLENBQUM7SUFDSixDQUFDO0lBRUQsd0VBQXdFO0lBQ3hFLHVFQUF1RTtJQUN2RSxPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDeEMsTUFBTSxDQUFDLEtBQUssQ0FDVixLQUFLLEVBQ0wsb0VBQW9FLENBQ3JFLENBQUM7UUFFRixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtRQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLDJEQUEyRCxDQUFDLENBQUM7UUFFekUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7UUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO1FBRTFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDIn0=