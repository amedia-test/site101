import { SiteConfigClient } from '@amedia/site-config';
import { logger } from '../logger.js';
/**
 * Creates a site configuration service
 * Provides methods to retrieve site configuration by domain or key
 */
export function createSiteConfigService() {
    // Using the Amedia Gaia service for site configuration
    const siteConfigClient = new SiteConfigClient({
        gaiaURL: 'https://services.api.no/gaia',
    });
    /**
     * Initialize the site config client
     * Must be called before using the service
     */
    async function initialize() {
        await siteConfigClient.isReady();
        logger.info('Site config client initialized');
    }
    /**
     * Get site key from publication domain
     */
    function getSiteKey(publication) {
        try {
            const siteConfig = siteConfigClient.fromDomain(publication);
            return siteConfig?.key;
        }
        catch (error) {
            logger.warn({ publication, error }, 'Failed to get site key from domain');
            return undefined;
        }
    }
    /**
     * Get full site configuration from site key
     */
    function getSiteConfig(siteKey) {
        try {
            return siteConfigClient.fromKey(siteKey);
        }
        catch (error) {
            logger.warn({ siteKey, error }, 'Failed to get site config from key');
            return undefined;
        }
    }
    /**
     * Extract the actual domain from host header
     * Strips port and localhost.api.no suffix for local development
     */
    function extractDomain(host) {
        // Remove port if present
        let domain = host.split(':')[0];
        // Remove localhost.api.no suffix if present (for local development)
        if (domain.endsWith('.localhost.api.no')) {
            domain = domain.replace('.localhost.api.no', '');
        }
        // Also handle snap environments
        if (domain.endsWith('.snap0.api.no')) {
            domain = domain.replace('.snap0.api.no', '');
        }
        if (domain.endsWith('.snap1.api.no')) {
            domain = domain.replace('.snap1.api.no', '');
        }
        return domain;
    }
    /**
     * Extract site configuration from request
     * Checks queryParam 'siteKey' first, then falls back to Host header
     */
    function getSiteFromRequest(request) {
        // Priority 1: Check for siteKey query parameter
        const query = request.query;
        if (query.siteKey) {
            // Check if it's a numeric ID or a string key
            const isNumeric = /^\d+$/.test(query.siteKey);
            let config;
            if (isNumeric) {
                // Lookup by ID
                try {
                    config = siteConfigClient.fromId(parseInt(query.siteKey, 10));
                }
                catch (error) {
                    logger.debug({ siteKey: query.siteKey, error }, 'Failed to get site config by ID');
                }
            }
            else {
                // Lookup by key
                config = getSiteConfig(query.siteKey);
            }
            if (config) {
                logger.debug({ siteKey: query.siteKey, type: isNumeric ? 'id' : 'key', source: 'queryParam' }, 'Site resolved from query parameter');
                return config;
            }
        }
        // Priority 2: Check Host header
        const host = request.headers.host;
        if (host) {
            const domain = extractDomain(host);
            try {
                const config = siteConfigClient.fromDomain(domain);
                if (config) {
                    logger.debug({ originalHost: host, extractedDomain: domain, source: 'host' }, 'Site resolved from Host header');
                    return config;
                }
            }
            catch (error) {
                logger.debug({ host, domain, error }, 'Failed to resolve site from Host header');
            }
        }
        logger.debug('No site could be resolved from request');
        return undefined;
    }
    return {
        initialize,
        getSiteKey,
        getSiteConfig,
        getSiteFromRequest,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2l0ZS1jb25maWctc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9zaXRlLWNvbmZpZy1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBSXZELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFJdEM7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QjtJQUNyQyx1REFBdUQ7SUFDdkQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixDQUFDO1FBQzVDLE9BQU8sRUFBRSw4QkFBOEI7S0FDeEMsQ0FBQyxDQUFDO0lBRUg7OztPQUdHO0lBQ0gsS0FBSyxVQUFVLFVBQVU7UUFDdkIsTUFBTSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxVQUFVLENBQUMsV0FBbUI7UUFDckMsSUFBSSxDQUFDO1lBQ0gsTUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzVELE9BQU8sVUFBVSxFQUFFLEdBQUcsQ0FBQztRQUN6QixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztZQUMxRSxPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxhQUFhLENBQUMsT0FBZTtRQUNwQyxJQUFJLENBQUM7WUFDSCxPQUFPLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FB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