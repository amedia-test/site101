import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import convict from 'convict';

const pkgJSONPath = new URL('../../package.json', import.meta.url).pathname;
const pkg = JSON.parse(fs.readFileSync(pkgJSONPath, 'utf8'));
const dirname = path.dirname(fileURLToPath(import.meta.url));

const environments = ['development', 'production', 'test'];

const config = convict({
  env: {
    doc: 'Applicaton environments',
    format: environments,
    default: 'production',
    env: 'NODE_ENV',
    arg: 'env',
  },

  version: {
    doc: 'Version of the application',
    format: String,
    default: pkg.version,
    env: 'VERSION',
  },

  appName: {
    doc: 'Name of the application',
    format: String,
    default: pkg.name,
  },

  contextPath: {
    doc: 'Context path for the application. Serves as a prefix for the paths in all URLs',
    format: String,
    default: `/${pkg.name}`,
  },

  basePath: {
    doc: 'The route the application is served on. This is the route the end user access in the browser',
    format: String,
    default: `/api/${pkg.name}/v1`,
  },

  port: {
    doc: 'The port the server should bind to',
    format: 'port',
    default: 8080, // Change this to your port
    env: 'PORT',
    arg: 'port',
  },

  hostName: {
    doc: 'Application hostname',
    format: String,
    default: 'localhost',
    env: 'HOSTNAME',
  },

  host: {
    doc: 'Address or hostname application is served on: use 0.0.0.0 or :: to listen on all network interfaces if your app is running in Heimdal',
    format: String,
    default: '::',
    env: 'HOST',
  },

  // Typically disable grace when developing for faster restarts
  gracefulShutdown: {
    doc: 'Whether to to wait for the server to complete queued requests before shutting down',
    format: Boolean,
    default: true,
    env: 'GRACEFUL_SHUTDOWN',
  },

  cluster: {
    doc: 'Cluster name. This is used to identify the cluster the application is running in',
    format: String,
    default: 'dev',
    env: 'CLUSTER_NAME',
  },

  logging: {
    level: {
      doc: 'Log level for the application',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
      default: 'info',
      env: 'LOG_LEVEL',
    },

    pretty: {
      doc: 'Whether to pretty print the log',
      format: Object,
      default: undefined,
      nullable: true,
      env: 'PRETTY_LOG',
    },

    requestLog: {
      doc: 'Enable logging of requests (accessLog)',
      format: String,
      default: 'trace',
      env: 'HTTP_ACCESS_LOG',
    },
  },

  metrics: {
    doc: 'Enable plugin for metrics collection',
    format: Boolean,
    default: false,
    env: 'METRICS',
  },
});

const localConfigPath = path.resolve(dirname, './local.json');

if (fs.existsSync(localConfigPath)) {
  config.loadFile([localConfigPath]);
} else {
  const { env } = config.getProperties();
  const envConfigPath = path.resolve(dirname, `./${env}.json`);

  if (fs.existsSync(envConfigPath)) {
    config.loadFile([envConfigPath]);
  }
}

config.validate();

export { config };
