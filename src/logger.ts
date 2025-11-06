import * as url from 'node:url';

import { createExtendedLogger, createLogger } from '@amedia/node-log';

import { config } from './config/config.js';
const appPath = `${
  process.env.PWD ??
  process.cwd() ??
  url.fileURLToPath(new URL('..', import.meta.url))
}/`;

const {
  appName: name,
  cluster: serverName,
  hostName,
  logging: { level: logLevel, pretty: prettyLog },
} = config.getProperties();
export const logConfig = {
  name,
  serverName,
  hostName,
  logLevel: logLevel as 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent',
  prettyLog,
};

export const logger = createLogger(logConfig);
export const extendedLogger = createExtendedLogger(appPath, logger);
