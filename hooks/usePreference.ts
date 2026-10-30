import { useEffect, useSyncExternalStore } from "react";
import type { createPreferenceStore } from "@/utils/createPreferenceStore";

export function usePreference<Value>(store: ReturnType<typeof createPreferenceStore<Value>>) {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => { void store.load(); }, [store]);
  return state;
}