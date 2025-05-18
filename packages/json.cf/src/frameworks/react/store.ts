import { atom, type Store } from "nanostores";
import { useCallback, useRef, useSyncExternalStore } from "react";
import type { DependencyList } from "react";
import type { ConfigResponse, ConfigsResponse, ConfigValue } from "../../types";

type InitialConfigResponse = ConfigResponse<ConfigValue | undefined>;
type InitialConfigsResponse = ConfigsResponse<
  Record<string, ConfigValue> | undefined
>;

export type ConfigStore = Store<
  InitialConfigResponse | InitialConfigsResponse
> & {
  setKey(key: string, value: ConfigResponse<ConfigValue>): void;
  set(value: InitialConfigResponse | InitialConfigsResponse): void;
};

export function createConfigStore(
  initialValue: InitialConfigResponse | InitialConfigsResponse
): ConfigStore {
  const store = atom<InitialConfigResponse | InitialConfigsResponse>(
    initialValue
  );

  return {
    ...store,
    setKey(key: string, value: ConfigResponse<ConfigValue>) {
      const current = store.get();
      if ("data" in current) {
        const newData = {
          ...((current.data as Record<string, ConfigValue>) || {}),
          [key]: value.data,
        };
        const currentValue = current.data
          ? (current.data as Record<string, ConfigValue>)[key]
          : undefined;
        if (JSON.stringify(currentValue) === JSON.stringify(value.data)) {
          return;
        }
        store.set({
          ...current,
          data: newData,
          metadata: { timestamp: Date.now() },
        });
      }
    },
    set(value: ConfigResponse<ConfigValue> | ConfigsResponse<ConfigValue>) {
      const current = store.get();
      if (JSON.stringify(current) === JSON.stringify(value)) {
        return;
      }
      store.set(value);
    },
  };
}

export interface UseStoreOptions {
  /**
   * @default
   * ```ts
   * [store, options.keys]
   * ```
   */
  deps?: DependencyList;

  /**
   * Will re-render components only on specific key changes.
   */
  keys?: string[];
}

export function useStore(
  store: ConfigStore,
  options: UseStoreOptions = {}
): InitialConfigResponse | InitialConfigsResponse {
  const snapshotRef = useRef<InitialConfigResponse | InitialConfigsResponse>(
    store.get()
  );
  const { keys, deps = [store, keys] } = options;

  const subscribe = useCallback((onChange: () => void) => {
    const emitChange = (
      value: InitialConfigResponse | InitialConfigsResponse
    ) => {
      if (JSON.stringify(snapshotRef.current) === JSON.stringify(value)) {
        return;
      }
      snapshotRef.current = value;
      onChange();
    };

    emitChange(store.get());
    return store.listen(emitChange);
  }, deps);

  return useSyncExternalStore(
    subscribe,
    () => snapshotRef.current,
    () => snapshotRef.current
  );
}
