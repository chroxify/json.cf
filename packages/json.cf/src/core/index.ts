import { atom, computed, task } from 'nanostores';
import type {
  JsonConfigOptions,
  ConfigValue,
  ConfigResponse,
  ConfigsResponse,
  ApiResponse,
  ConfigState,
  FetchState,
} from '../types';

/**
 * Core JsonConfig class with nanostores-based state management
 */
export class JsonConfig {
  private readonly id: string;
  private readonly secret?: string;
  private readonly baseUrl: string;

  // Core stores - start with loading: true to avoid hydration mismatch  
  public readonly $config = atom<ConfigState>({ data: undefined, loading: true, error: null });
  public readonly $keys = atom<Map<string, FetchState<ConfigValue>>>(new Map());
  
  // Cache settings
  private readonly cacheTimeout: number;
  private readonly keyTimestamps = new Map<string, number>();
  private configTimestamp?: number;

  constructor(options: JsonConfigOptions & { cacheTimeout?: number }) {
    this.id = options.id;
    this.secret = options.secret;
    this.baseUrl = options.baseUrl || 'https://api.json.cf';
    this.cacheTimeout = options.cacheTimeout || 5000; // 5s default cache
  }

  /**
   * Fetches a single key from the API
   */
  private async fetchKeyData(key: string): Promise<ConfigResponse<ConfigValue>> {
    const response = await fetch(
      `${this.baseUrl}/config/${this.id}/kv/${key}`,
      {
        headers: {
          ...(this.secret && { 'X-Config-Secret': this.secret }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch config key '${key}': ${response.statusText}`);
    }

    return (await response.json()) as ApiResponse<ConfigValue>;
  }

  /**
   * Fetches all config data from the API
   */
  private async fetchConfigData(): Promise<ConfigsResponse<Record<string, ConfigValue>>> {
    const response = await fetch(`${this.baseUrl}/config/${this.id}`, {
      headers: {
        ...(this.secret && { 'X-Config-Secret': this.secret }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }

    return (await response.json()) as ApiResponse<Record<string, ConfigValue>>;
  }

  /**
   * Checks if data is fresh enough to avoid refetching
   */
  private isFresh(timestamp?: number): boolean {
    if (!timestamp) return false;
    return Date.now() - timestamp < this.cacheTimeout;
  }

  /**
   * Fetches a specific key from the API
   */
  public fetchKey = (key: string) => {
    const current = this.$keys.get();
    const keyState = current.get(key);
    
    // Skip if already loading or fresh
    if (keyState?.loading || this.isFresh(this.keyTimestamps.get(key))) {
      return;
    }

    // Set loading state
    const newKeys = new Map(current);
    newKeys.set(key, { data: keyState?.data ?? null, loading: true, error: null });
    this.$keys.set(newKeys);

    // Fetch data
    this.fetchKeyData(key)
      .then((result) => {
        const updatedKeys = new Map(this.$keys.get());
        updatedKeys.set(key, {
          data: result.data,
          loading: false,
          error: result.error,
        });
        this.$keys.set(updatedKeys);
        this.keyTimestamps.set(key, Date.now());
      })
      .catch((error) => {
        const updatedKeys = new Map(this.$keys.get());
        updatedKeys.set(key, {
          data: keyState?.data ?? null,
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        });
        this.$keys.set(updatedKeys);
      });
  };

  /**
   * Fetches all config data
   */
  public fetchConfig = () => {
    const current = this.$config.get();
    
    // Skip if fresh data exists
    if (this.isFresh(this.configTimestamp)) {
      return;
    }
    
    // Skip if already fetching (has data but loading)
    if (current.loading && current.data !== undefined) {
      return;
    }

    // Set loading state
    this.$config.set({ ...current, loading: true, error: null });

    // Fetch data
    this.fetchConfigData()
      .then((result) => {
        this.$config.set({
          data: result.data || {},
          loading: false,
          error: result.error,
        });
        this.configTimestamp = Date.now();
      })
      .catch((error) => {
        this.$config.set({
          data: current.data,
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });
  };

  /**
   * Computed store for a specific key
   */
  public getKeyStore = (key: string) => {
    return computed(this.$keys, (keys) => {
      const keyState = keys.get(key);
      if (!keyState && !this.isFresh(this.keyTimestamps.get(key))) {
        // Trigger fetch if not exists and not fresh
        setTimeout(() => this.fetchKey(key), 0);
      }
      return keyState || { data: null, loading: false, error: null };
    });
  };

  /**
   * Invalidates cache for a specific key
   */
  public invalidateKey = (key: string) => {
    this.keyTimestamps.delete(key);
    const current = new Map(this.$keys.get());
    current.delete(key);
    this.$keys.set(current);
  };

  /**
   * Invalidates the entire config cache
   */
  public invalidateConfig = () => {
    this.configTimestamp = undefined;
    this.$config.set({ data: {}, loading: false, error: null });
  };

  /**
   * Manual refresh of a key (bypasses cache)
   */
  public refresh = (key: string) => {
    this.keyTimestamps.delete(key);
    this.fetchKey(key);
  };

  /**
   * Manual refresh of entire config (bypasses cache)
   */
  public refreshConfig = () => {
    this.configTimestamp = undefined;
    this.fetchConfig();
  };

  // Legacy API compatibility
  public async get(key: string): Promise<ConfigResponse<ConfigValue>> {
    this.fetchKey(key);
    return new Promise((resolve) => {
      const unsubscribe = this.getKeyStore(key).listen((state) => {
        if (!state.loading) {
          unsubscribe();
          resolve({
            data: state.data,
            error: state.error,
            metadata: { timestamp: Date.now() },
          });
        }
      });
    });
  }

  public async getConfig(): Promise<ConfigsResponse<Record<string, ConfigValue>>> {
    this.fetchConfig();
    return new Promise((resolve) => {
      const unsubscribe = this.$config.listen((state) => {
        if (!state.loading) {
          unsubscribe();
          resolve({
            data: state.data || {},
            error: state.error,
            metadata: { timestamp: Date.now() },
          });
        }
      });
    });
  }
}

/**
 * Creates a new JsonConfig instance
 */
export function createBaseConfig(options: JsonConfigOptions): JsonConfig {
  return new JsonConfig(options);
}
