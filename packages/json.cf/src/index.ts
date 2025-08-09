import type { JsonConfigOptions } from "./types";
import { type JsonConfig, createBaseConfig } from "./core";

/**
 * Creates a new JsonConfig instance with nanostores-based state management
 * @param options Configuration options
 * @returns JsonConfig instance
 */
export const jsonConfig = (options: JsonConfigOptions): JsonConfig => {
  return createBaseConfig(options);
};

// Re-export types and core functionality
export type {
  JsonConfigOptions,
  ConfigValue,
  ConfigResponse,
  ConfigsResponse,
  FetchState,
  ConfigState,
} from "./types";
export { JsonConfig } from "./core";
