import type { JsonConfigOptions } from '../../types';
import { JsonConfig } from '../../core';

/**
 * Creates a Svelte-optimized JsonConfig instance
 * Svelte automatically subscribes to nanostores when accessed with $store syntax
 */
export function createSvelteConfig(options: JsonConfigOptions) {
  const config = new JsonConfig(options);

  return {
    // Core methods
    get: config.get.bind(config),
    getConfig: config.getConfig.bind(config),
    refresh: config.refresh.bind(config),
    refreshConfig: config.refreshConfig.bind(config),
    invalidateKey: config.invalidateKey.bind(config),
    invalidateConfig: config.invalidateConfig.bind(config),
    
    // Stores - can be used directly in Svelte with $store syntax
    config: config.$config,
    keys: config.$keys,
    
    // Helper to get key-specific store
    getKeyStore: config.getKeyStore.bind(config),
  };
}

export { createSvelteConfig as jsonConfig };
export type { FetchState, ConfigState } from '../../types';
