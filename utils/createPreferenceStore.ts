import AsyncStorage from "@react-native-async-storage/async-storage";

export function createPreferenceStore<Value>(
  key: string,
  defaultValue: Value,
  parse: (saved: string | null) => Value,
) {
  let state = { value: defaultValue, isLoading: true, error: null as string | null };
  let loadingPromise: Promise<void> | null = null;
  let writeQueue = Promise.resolve();
  let revision = 0;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  const load = (): Promise<void> => {
    if (!loadingPromise) {
      const initialRevision = revision;
      loadingPromise = AsyncStorage.getItem(key)
        .then((saved) => {
          if (revision === initialRevision) {
            state = { value: parse(saved), isLoading: false, error: null };
          }
        })
        .catch(() => {
          if (revision === initialRevision) {
            state = { value: defaultValue, isLoading: false, error: "Kunde inte läsa inställningen." };
          }
        })
        .finally(notify);
    }
    return loadingPromise;
  };

  const setValue = (value: Value): Promise<void> => {
    void load();
    const currentRevision = ++revision;
    state = { value, isLoading: false, error: null };
    notify();
    writeQueue = writeQueue
      .then(() => AsyncStorage.setItem(key, String(value)))
      .catch(() => {
        if (revision === currentRevision) {
          state = { ...state, error: "Kunde inte spara inställningen." };
          notify();
        }
      });
    return writeQueue;
  };

  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    load,
    setValue,
  };
}