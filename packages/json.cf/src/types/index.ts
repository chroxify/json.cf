export interface JsonConfigOptions {
  id: string;
  secret?: string;
  baseUrl?: string;
  cacheTimeout?: number;
}

export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | ConfigValue[]
  | { [key: string]: ConfigValue };

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  metadata: {
    timestamp: number;
  };
}

export interface ConfigResponse<T> {
  data: T;
  error: string | null;
  metadata: {
    timestamp: number;
  };
}

export interface ConfigsResponse<T> {
  data: T;
  error: string | null;
  metadata: {
    timestamp: number;
  };
}

// New store state types
export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ConfigState {
  data: Record<string, ConfigValue> | undefined;
  loading: boolean;
  error: string | null;
}
