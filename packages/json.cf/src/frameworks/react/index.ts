import type {
  JsonConfigOptions,
  ConfigValue,
  FetchState,
  ConfigState,
} from '../../types';
import { JsonConfig } from '../../core';
import { useStore } from './store';
import { useMemo, useEffect } from 'react';

/**
 * React hook to use a specific config key with automatic fetching
 */
export function useConfigKey(config: JsonConfig, key: string): FetchState<ConfigValue> {
  const keyStore = useMemo(() => config.getKeyStore(key), [config, key]);
  return useStore(keyStore);
}

/**
 * React hook to use all config data with automatic fetching
 */
export function useConfig(config: JsonConfig): ConfigState {
  const state = useStore(config.$config);
  
  // Trigger fetch on mount
  useEffect(() => {
    if (state.data === undefined && !state.error) {
      config.fetchConfig();
    }
  }, [config]);
  
  return state;
}

/**
 * React hook to get a config value with suspense support
 */
export function useConfigValue(config: JsonConfig, key: string): ConfigValue | null {
  const state = useConfigKey(config, key);
  
  // Trigger fetch if not loading and no data
  useMemo(() => {
    if (!state.loading && !state.data && !state.error) {
      config.fetchKey(key);
    }
  }, [config, key, state.loading, state.data, state.error]);
  
  return state.data;
}

/**
 * Creates a React-optimized JsonConfig instance
 */
function createReactConfig(options: JsonConfigOptions) {
  const config = new JsonConfig(options);

  return {
    // Core methods
    get: config.get.bind(config),
    getConfig: config.getConfig.bind(config),
    refresh: config.refresh.bind(config),
    refreshConfig: config.refreshConfig.bind(config),
    invalidateKey: config.invalidateKey.bind(config),
    invalidateConfig: config.invalidateConfig.bind(config),
    
    // Stores for advanced usage
    $config: config.$config,
    $keys: config.$keys,
    getKeyStore: config.getKeyStore.bind(config),
    
    // React hooks
    useKey: (key: string) => useConfigKey(config, key),
    useConfig: () => useConfig(config),
    useValue: (key: string) => useConfigValue(config, key),
  };
}

export { createReactConfig as jsonConfig };
export type { FetchState, ConfigState } from '../../types';
