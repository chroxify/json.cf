import type {
  ConfigResponse,
  ConfigsResponse,
  ConfigValue,
  JsonConfigOptions,
} from "../../types";
import { createConfig } from "../../core";
import { createConfigStore, useStore } from "./store";

export function createReactConfig(options: JsonConfigOptions) {
  const config = createConfig(options);

  // Create store
  const store = createConfigStore({
    data: undefined,
    error: null,
    metadata: { timestamp: Date.now() },
  });

  const handleError = (error: unknown): ConfigResponse<ConfigValue> => ({
    data: null,
    error: error instanceof Error ? error.message : String(error),
    metadata: { timestamp: Date.now() },
  });

  return {
    get: (key: string) => config.get(key),
    getAll: () => config.getAll(),
    useKey: (key: string): ConfigResponse<ConfigValue | undefined> => {
      const state = useStore(store, { keys: [key] });
      config
        .get(key)
        .then((result) => store.setKey(key, result))
        .catch((error: unknown) => store.setKey(key, handleError(error)));
      return state as ConfigResponse<ConfigValue | undefined>;
    },
    useAll: (): ConfigsResponse<Record<string, ConfigValue> | undefined> => {
      const state = useStore(store);
      config
        .getAll()
        .then((result) => store.set(result))
        .catch((error: unknown) => store.set(handleError(error)));
      return state as ConfigsResponse<Record<string, ConfigValue> | undefined>;
    },
  };
}
