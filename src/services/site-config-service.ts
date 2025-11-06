import { SiteConfigClient } from '@amedia/site-config';
import type { FastifyRequest } from 'fastify';

import { config } from '../config/config.js';
import { logger } from '../logger.js';

export type SiteConfigService = ReturnType<typeof createSiteConfigService>;

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
  function getSiteKey(publication: string) {
    try {
      const siteConfig = siteConfigClient.fromDomain(publication);
      return siteConfig?.key;
    } catch (error) {
      logger.warn({ publication, error }, 'Failed to get site key from domain');
      return undefined;
    }
  }

  /**
   * Get full site configuration from site key
   */
  function getSiteConfig(siteKey: string) {
    try {
      return siteConfigClient.fromKey(siteKey);
    } catch (error) {
      logger.warn({ siteKey, error }, 'Failed to get site config from key');
      return undefined;
    }
  }

  /**
   * Extract the actual domain from host header
   * Strips port and localhost.api.no suffix for local development
   */
  function extractDomain(host: string): string {
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
  function getSiteFromRequest(request: FastifyRequest) {
    // Priority 1: Check for siteKey query parameter
    const query = request.query as { siteKey?: string };
    if (query.siteKey) {
      // Check if it's a numeric ID or a string key
      const isNumeric = /^\d+$/.test(query.siteKey);
      let config;

      if (isNumeric) {
        // Lookup by ID
        try {
          config = siteConfigClient.fromId(parseInt(query.siteKey, 10));
        } catch (error) {
          logger.debug({ siteKey: query.siteKey, error }, 'Failed to get site config by ID');
        }
      } else {
        // Lookup by key
        config = getSiteConfig(query.siteKey);
      }

      if (config) {
        logger.debug(
          { siteKey: query.siteKey, type: isNumeric ? 'id' : 'key', source: 'queryParam' },
          'Site resolved from query parameter'
        );
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
          logger.debug(
            { originalHost: host, extractedDomain: domain, source: 'host' },
            'Site resolved from Host header'
          );
          return config;
        }
      } catch (error) {
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
