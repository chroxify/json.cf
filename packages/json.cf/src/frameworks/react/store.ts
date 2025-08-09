import { useSyncExternalStore } from "react";
import type { Store } from "nanostores";

/**
 * React hook to subscribe to nanostores
 */
export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(
    (callback) => store.listen(callback),
    () => store.get(),
    () => store.get()
  );
}
