import { useCallback, useEffect, useState } from "react";
import { reflectiveRemoveItem, reflectiveSetItem } from "./reflective-storage";

export type UseLocalStorageResult = {
  isLoading: boolean;
  value: string | null;
  set: (value: string) => void;
  remove: () => void;
};

export function useLocalStorage(key: string): UseLocalStorageResult {
  const [cachedValue, setCachedValue] = useState<{ value: string | null } | null>(null);

  useEffect(() => {
    const storedValue = localStorage.getItem(key);
    setCachedValue({ value: storedValue });
  }, [key]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key == null || event.key === key) {
        const storedValue = localStorage.getItem(key);
        setCachedValue({ value: storedValue });
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  const set = useCallback((newValue: string) => {
    reflectiveSetItem.call(localStorage, key, newValue);
  }, [key]);

  const remove = useCallback(() => {
    reflectiveRemoveItem.call(localStorage, key);
  }, [key]);

  return {
    isLoading: cachedValue == null,
    value: cachedValue?.value ?? null,
    set,
    remove,
  };
}
