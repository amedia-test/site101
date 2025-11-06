#!/usr/bin/env node

import { buildApp } from './app.js';
import { config } from './config/config.js';
import { extendedLogger } from './logger.js';

const { port, host, basePath, gracefulShutdown } = config.getProperties();

async function init() {
  const { app, healthMonitor } = await buildApp();
  const logger = extendedLogger();
  const address = host.includes(':') ? `[${host}]` : `${host}`;

  app.listen(
    {
      host,
      port,
    },
    () => {
      logger.info(`server process has pid ${process.pid}`);
      logger.info(
        `api routes available under http://${address}:${port}${basePath}`
      );
    }
  );

  /**
   * Perform a controlled shutdown of your app.
   * This base implementation is very crude - only delaying a couple of seconds,
   * but this delay alone all but guaranties that any pending requests have been served.
   *
   * If you have longer running tasks, you should consider implementing mechanics
   * to wait for them to complete. Or even better; extract them to a cronjob if possible.
   */
  function shutdown(code: number): void {
    healthMonitor.prepareForShutdown();
    setTimeout(
      () => {
        app.server.close();
        process.nextTick(() => {
          process.exit(code);
        });
      },
      gracefulShutdown ? 2000 : 0
    );
  }

  // Catch uncaught exceptions, log it and take down server in a nice way.
  // Upstart or forever should handle kicking the process back into life!
  process.on('uncaughtException', (error) => {
    logger.error(
      error,
      'shutdown - server taken down by force due to an uncaught exception'
    );

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
