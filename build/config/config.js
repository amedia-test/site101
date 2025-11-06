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
}
else {
    const { env } = config.getProperties();
    const envConfigPath = path.resolve(dirname, `./${env}.json`);
    if (fs.existsSync(envConfigPath)) {
        config.loadFile([envConfigPath]);
    }
}
config.validate();
export { config };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ3pCLE9BQU8sSUFBSSxNQUFNLFdBQVcsQ0FBQztBQUM3QixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXpDLE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQztBQUU5QixNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUM1RSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDN0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRTdELE1BQU0sWUFBWSxHQUFHLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUUzRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUM7SUFDckIsR0FBRyxFQUFFO1FBQ0gsR0FBRyxFQUFFLHlCQUF5QjtRQUM5QixNQUFNLEVBQUUsWUFBWTtRQUNwQixPQUFPLEVBQUUsWUFBWTtRQUNyQixHQUFHLEVBQUUsVUFBVTtRQUNmLEdBQUcsRUFBRSxLQUFLO0tBQ1g7SUFFRCxPQUFPLEVBQUU7UUFDUCxHQUFHLEVBQUUsNEJBQTRCO1FBQ2pDLE1BQU0sRUFBRSxNQUFNO1FBQ2QsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO1FBQ3BCLEdBQUcsRUFBRSxTQUFTO0tBQ2Y7SUFFRCxPQUFPLEVBQUU7UUFDUCxHQUFHLEVBQUUseUJBQXlCO1FBQzlCLE1BQU0s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